"use client";

// Setup Leaflet to work with Next.js and dynamic imports
import dynamic from 'next/dynamic';
import "leaflet/dist/leaflet.css";
import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import countryCoordinates from "../../../public/data/countryCoordinates";
import { useProducts } from "../../useContexts/ProductsContext";
import { useSearch } from "../../useContexts/SearchContext";
import Loading from "../common/Loading";

// Dynamically import react-leaflet to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { 
    ssr: false,
    loading: () => <div>Loading map component...</div>
  }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Circle = dynamic(
  () => import('react-leaflet').then((mod) => mod.Circle),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

const useMap = dynamic(
  () => import('react-leaflet').then((mod) => mod.useMap),
  { ssr: false }
);

const MapComponent = forwardRef(
  (
    {
      selectedCountry = "all",
      yearRange,
      selectedProduct = "all",
      selectedCategory,
      zoom,
      setZoom,
      filterEpdOnly = true, // Default to filtering only EPD markers by year
    },
    ref
  ) => {
    const [loading, setLoading] = useState(false);
    // Early return with a loading indicator if we're not in a browser environment
    const [isBrowser, setIsBrowser] = useState(false);
    
    useEffect(() => {
      setIsBrowser(true);
    }, []);
    
    if (!isBrowser) {
      return <Loading message="Loading..." />;
    }

    const [loading, setLoading] = useState(false); 
    const [error, setError] = useState(null);
    const [locations, setLocations] = useState([]);
    const [epdFilterStats, setEpdFilterStats] = useState({
      total: 0,
      filtered: 0,
    });
    const mapRef = useRef(null);
    const {
      allProducts,
      loading: productsLoading,
      error: productsError,
      selectedProduct: selectedProductContext,
    } = useProducts();
    const { searchResults: filteredProducts, setMarkerSelected } = useSearch();
    const filteredProductsList = filteredProducts || [];

    // Expose the centerOnLocation function to parent components
    useImperativeHandle(ref, () => ({
      centerOnLocation: (lat, lng, zoomLevel = 8) => {
        if (mapRef.current) {
          mapRef.current.setView([lat, lng], zoomLevel);
        }
      },
      getLocationByProduct: (productName) => {
        const location = locations.find(
          (loc) =>
            (loc.product || "").toLowerCase() === productName.toLowerCase()
        );
        return location;
      },
    }));

    useEffect(() => {
      // Set loading state to true when starting to process locations, but only if we're not already loading products
      if (!productsLoading) {
        setLoading(true);
      }

      if (!productsLoading && !productsError) {
        console.log("Processing product data for map...");

        // Decide which products to display
        const productsToShow =
          filteredProductsList && filteredProductsList.length > 0
            ? filteredProductsList
            : allProducts || [];

        console.log(`Map preparing to show ${productsToShow.length} products`);

        // Log geo distribution for debugging
        if (productsToShow.length > 0) {
          const geoDistribution = {};
          productsToShow.forEach((product) => {
            const geo = product.geo || "undefined";
            geoDistribution[geo] = (geoDistribution[geo] || 0) + 1;
          });
          console.log("Map geo distribution:", geoDistribution);
        }

        if (productsToShow.length > 0) {
          // For performance, if there are too many products, let's set a reasonable limit
          // to avoid overwhelming the map rendering
          const maxProducts = 1000;
          let productsToProcess = productsToShow;

          if (productsToShow.length > maxProducts) {
            console.warn(
              `Too many products (${productsToShow.length}), limiting to ${maxProducts} for performance`
            );
            productsToProcess = productsToShow.slice(0, maxProducts);
          }

          // Format products for map display
          const formattedLocations = productsToProcess
            .map((product) => {
              // Ensure we have valid coordinates
              if (
                !product.lat ||
                !product.lng ||
                isNaN(parseFloat(product.lat)) ||
                isNaN(parseFloat(product.lng))
              ) {
                console.warn(
                  `Product missing valid coordinates: ${product.name}`
                );
                return null;
              }

              // Create a properly formatted location object
              return {
                lat: parseFloat(product.lat),
                lng: parseFloat(product.lng),
                country: product.country || "Unknown",
                refYear: product.ref_year || product.refYear || "all",
                validUntil: product.valid_until || product.validUntil || "all",
                product:
                  product.product_name || product.name || "Unnamed Product",
                description: product.description || "",
                isEpd: product.type === "EPD" ? "EPD" : null,
                isFromEPDAPI: product.isFromEPDAPI || false,
                isFromRegularAPI: product.isFromRegularAPI || false,
                categories: product.classific || product.category_name || "",
                // Additional debugging info
                geo: product.geo,
                geoMapped: product.geoMapped,
                productId: product.id || product.uid,
              };
            })
            .filter((location) => location !== null);

          console.log(
            `Map has ${formattedLocations.length} valid locations to display`
          );

          // Sample of the locations we're displaying
          if (formattedLocations.length > 0) {
            console.log("Sample location:", formattedLocations[0]);
          }

          setLocations(formattedLocations);
        } else {
          console.warn("No products to display on map");
          setLocations([]);
        }
      }

      // Always ensure loading is set to false after processing
      // Use a small timeout to ensure state updates have processed
      const timer = setTimeout(() => {
        setLoading(false);
        console.log("Map loading complete, displaying markers");
      }, 500);

      return () => clearTimeout(timer);
    }, [allProducts, filteredProductsList, productsLoading, productsError]);

    useEffect(() => {
      // Debug log all products to help identify issues
      if (!productsLoading && allProducts) {
        console.log(`Total products available: ${allProducts.length}`);

        // Analyze geo field distribution
        const geoStats = {};
        allProducts.forEach((p) => {
          const geo = p.geo || "undefined";
          geoStats[geo] = (geoStats[geo] || 0) + 1;
        });
        console.log("Geo field distribution:", geoStats);

        // Log products with coordinates
        const withCoords = allProducts.filter((p) => p.lat && p.lng);
        console.log(
          `Products with coordinates: ${withCoords.length}/${allProducts.length}`
        );

        // Sample of products with coordinates
        if (withCoords.length > 0) {
          console.log(
            "Sample products with coordinates:",
            withCoords.slice(0, 3)
          );
        }

        // Sample of products without coordinates
        const withoutCoords = allProducts.filter((p) => !p.lat || !p.lng);
        if (withoutCoords.length > 0) {
          console.log(
            "Sample products without coordinates:",
            withoutCoords.slice(0, 3)
          );
        }
      }
    }, [allProducts, productsLoading]);

    const ZoomControl = ({ setZoom, zoom }) => {
      // Use a ref to check if we're in a browser environment
      const [isMounted, setIsMounted] = useState(false);
      
      useEffect(() => {
        setIsMounted(true);
      }, []);
      
      // If not mounted yet, don't render
      if (!isMounted) return null;
      
      const map = useMap();

      useEffect(() => {
        mapRef.current = map;
        map.setView(map.getCenter(), zoom);
      }, [zoom, map]);

      useEffect(() => {
        const updateZoom = () => {
          setZoom(map.getZoom());
        };

        map.on("zoomend", updateZoom);
        return () => {
          map.off("zoomend", updateZoom);
        };
      }, [map, setZoom]);

      return null;
    };

    // Combined loading state for all data fetching operations
    const isLoading = loading || productsLoading;
    const loadingMessage = productsLoading
      ? "Loading product data..."
      : "Processing locations...";

    // Log the loading state for debugging
    useEffect(() => {
      console.log("Loading state:", {
        componentLoading: loading,
        productsLoading,
        isLoading,
      });
    }, [loading, productsLoading, isLoading]);

    const groupByCountry = (locations) => {
      return locations.reduce((acc, location) => {
        if (!acc[location.country]) {
          acc[location.country] = [];
        }
        acc[location.country].push(location);
        return acc;
      }, {});
    };

    const distributeCircles = (lat, lng, count, zoom) => {
      var maxRadius = 2;
      if (zoom > 5) {
        maxRadius = 2;
      } else {
        maxRadius = 2;
      }
      const angleStep = (2 * Math.PI) / count; //angular distance

      return Array.from({ length: count }, (_, i) => {
        const angle = i * angleStep;
        const distance = Math.random() * maxRadius;

        const latOffset = distance * Math.cos(angle);
        const lngOffset = distance * Math.sin(angle);

        return {
          lat: lat + latOffset,
          lng: lng + lngOffset,
        };
      });
    };

    const getDistributedLocations = (locations, zoom) => {
      const groupedLocations = groupByCountry(locations);

      return Object.values(groupedLocations).flatMap((group) => {
        return group.map((item, index) => {
          const centralLocation = group[0];
          const distributedCoords = distributeCircles(
            centralLocation.lat,
            centralLocation.lng,
            group.length,
            zoom
          );

          return {
            ...item,
            lat: distributedCoords[index].lat,
            lng: distributedCoords[index].lng,
          };
        });
      });
    };

    const getFilteredLocations = useCallback(() => {
      console.log("Total locations before filtering:", locations.length);
      console.log(
        "Filtered products from search:",
        filteredProductsList.length
      );
      console.log("Selected Product:", selectedProductContext);
      console.log("Year Range:", yearRange, "EPD Only:", filterEpdOnly);

      // Early return if no locations
      if (!locations || locations.length === 0) {
        console.log("No locations available");
        return { filtered: [], epdStats: { total: 0, filtered: 0 } };
      }

      // Counters for filtering statistics
      let totalEpdMarkers = 0;
      let epdMarkersFilteredByYear = 0;

      const filtered = locations.filter((location) => {
        // Count EPD markers from the EPD API only
        if (location && location.isEpd && location.isFromEPDAPI) {
          totalEpdMarkers++;
        }

        // Skip undefined or null locations
        if (!location || !location.product) {
          return false;
        }

        // If filterEpdOnly is true, only show EPD markers from the specific API
        if (filterEpdOnly) {
          // Only show markers from the EPD API when EPD Explorer is active
          if (!location.isFromEPDAPI) {
            return false;
          }
        }
        // When filterEpdOnly is false (All icon clicked), show all markers from both APIs
        // No additional filtering needed here as we want to show everything

        // If we have filtered products from search, use those
        if (filteredProductsList && filteredProductsList.length > 0) {
          return filteredProductsList.some((product) => {
            // Only show regular API products in search results, not EPD API products
            if (product.isFromEPDAPI) {
              return false;
            }

            const productName = product.product_name || product.name || "";
            const locationProduct = location.product || "";

            // Direct match
            if (productName === locationProduct) {
              console.log(
                `Product match found: "${productName}" === "${locationProduct}"`
              );
              return true;
            }

            // Special case for zehnder-basic-silent-wall-fan
            if (productName === "zehnder-basic-silent-wall-fan") {
              // Look for related names
              if (
                locationProduct.includes("silent-wall") ||
                locationProduct.includes("basic-silent") ||
                locationProduct.includes("wall-fan")
              ) {
                console.log(
                  `Special match found for zehnder-basic-silent-wall-fan: "${locationProduct}"`
                );
                return true;
              }
            }

            // Handle Zehnder products
            if (
              productName.toLowerCase().includes("zehnder-") &&
              locationProduct.toLowerCase().includes("zehnder-")
            ) {
              const productNameWithoutPrefix = productName
                .toLowerCase()
                .split("zehnder-")[1];
              const locationNameWithoutPrefix = locationProduct
                .toLowerCase()
                .split("zehnder-")[1];

              // Check if product name parts match the location product name parts
              const productNameParts = productNameWithoutPrefix.split("-");
              const locationNameParts = locationNameWithoutPrefix.split("-");

              // Check for at least 50% matching parts
              let matchingParts = 0;
              for (const part of productNameParts) {
                if (locationNameParts.includes(part)) {
                  matchingParts++;
                }
              }

              const matchRatio = matchingParts / productNameParts.length;
              if (matchRatio >= 0.5) {
                console.log(
                  `Zehnder partial match found: "${productName}" ~= "${locationProduct}" (${Math.round(
                    matchRatio * 100
                  )}% match)`
                );
                return true;
              }

              if (productNameWithoutPrefix === locationNameWithoutPrefix) {
                console.log(
                  `Zehnder exact match found: "${productName}" === "${locationProduct}" (without prefix)`
                );
                return true;
              }
            }

            return false;
          });
        }

        // If no filtered products, apply other filters
        const countryMatch =
          selectedCountry === "all" ||
          !selectedCountry ||
          location.country === selectedCountry;

        // Year filtering logic
        let yearMatch = true;
        if (yearRange[0] !== "all" && yearRange[1] !== "all") {
          // This should only apply to EPD markers from the EPD API if filterEpdOnly is true
          if (filterEpdOnly) {
            if (location.isEpd && location.isFromEPDAPI) {
              const refYearNum =
                location.refYear && location.refYear !== "all"
                  ? parseInt(location.refYear)
                  : null;
              yearMatch =
                location.refYear === "all" ||
                (refYearNum &&
                  refYearNum >= yearRange[0] &&
                  refYearNum <= yearRange[1]);

              // Debug EPD year filtering
              if (!yearMatch && location.refYear) {
                console.log(
                  `EPD Year filter excluded: ${location.product}, year: ${location.refYear}, range: [${yearRange[0]}, ${yearRange[1]}]`
                );
                epdMarkersFilteredByYear++;
              }
            }
            // Non-EPD markers and non-EPD API markers are not filtered by year when filterEpdOnly is true
          } else {
            // If filterEpdOnly is false, apply year filtering to all markers
            const refYearNum =
              location.refYear && location.refYear !== "all"
                ? parseInt(location.refYear)
                : null;
            yearMatch =
              location.refYear === "all" ||
              (refYearNum &&
                refYearNum >= yearRange[0] &&
                refYearNum <= yearRange[1]);
          }
        }

        const productMatch =
          selectedProduct === "all" ||
          !selectedProduct ||
          location.product === selectedProduct;

        const categoryMatch =
          selectedCategory === "all" ||
          !selectedCategory ||
          (location.categories &&
            (typeof location.categories === "string"
              ? location.categories.includes(selectedCategory)
              : Array.isArray(location.categories) &&
                location.categories.includes(selectedCategory)));

        return countryMatch && yearMatch && productMatch && categoryMatch;
      });

      console.log("Filtered locations:", filtered.length);
      if (filtered.length === 0) {
        console.log("No locations matched the filters");
      } else {
        console.log("Sample filtered location:", filtered[0]);
      }

      // Log EPD filtering statistics
      if (filterEpdOnly && yearRange[0] !== "all" && yearRange[1] !== "all") {
        console.log(
          `EPD filtering statistics: ${
            totalEpdMarkers - epdMarkersFilteredByYear
          }/${totalEpdMarkers} EPD markers within year range [${
            yearRange[0]
          }, ${yearRange[1]}]`
        );
      }

      return {
        filtered,
        epdStats: {
          total: totalEpdMarkers,
          filtered: totalEpdMarkers - epdMarkersFilteredByYear,
        },
      };
    }, [
      locations,
      filteredProductsList,
      selectedProductContext,
      yearRange,
      filterEpdOnly,
      selectedCountry,
      selectedProduct,
      selectedCategory,
    ]);

    const { filtered: filteredLocations, epdStats } = useMemo(
      () => getFilteredLocations(),
      [getFilteredLocations]
    );

    // Update EPD filter stats state using useEffect to avoid render loops
    useEffect(() => {
      // Only update if the values are actually different to avoid render loops
      if (
        epdStats.total !== epdFilterStats.total ||
        epdStats.filtered !== epdFilterStats.filtered
      ) {
        setEpdFilterStats(epdStats);
      }
    }, [epdStats, epdFilterStats]);

    const distributedLocations = useMemo(
      () => getDistributedLocations(filteredLocations, zoom),
      [filteredLocations, zoom]
    );

    const getCircleRadius = (zoom) => {
      let radius;
      if (zoom > 3 && zoom <= 5) {
        radius = 600000 / (zoom * 4);
      } else if (zoom > 5 && zoom <= 10) {
        radius = 600000 / (zoom * 20);
      } else if (zoom > 10 && zoom <= 15) {
        radius = 5000 / zoom;
      } else if (zoom > 15) {
        radius = 100;
      } else {
        radius = 150000;
      }
      return radius;
    };

    const [selectedLocation, setSelectedLocation] = useState(null);
    const prevFilteredProductsRef = useRef(0);

    useEffect(() => {
      if (selectedProductContext && locations.length > 0) {
        const selectedName =
          selectedProductContext.product_name || selectedProductContext.name;
        console.log("Selected product:", selectedName, selectedProductContext);

        // Try to find matching location
        let matchedLocation = null;

        // Special handling for zehnder-basic-silent-wall-fan
        if (selectedName === "zehnder-basic-silent-wall-fan") {
          console.log("Special handling for zehnder-basic-silent-wall-fan");

          // Try to find any locations with similar names
          matchedLocation = locations.find(
            (loc) =>
              loc.product &&
              (loc.product.includes("silent-wall") ||
                loc.product.includes("basic-silent") ||
                loc.product.includes("wall-fan"))
          );

          if (matchedLocation) {
            console.log("Found similar product:", matchedLocation.product);
          }
        }

        // If no special match found, try normal matching
        if (!matchedLocation) {
          matchedLocation = locations.find(
            (loc) => loc.product === selectedName
          );
        }

        // If still no match, try case-insensitive
        if (!matchedLocation) {
          const lowerName = selectedName.toLowerCase();
          matchedLocation = locations.find(
            (loc) => (loc.product || "").toLowerCase() === lowerName
          );
        }

        if (matchedLocation) {
          console.log("Found matching location:", matchedLocation);
          setSelectedLocation(matchedLocation);

          // Center map on the location
          if (mapRef.current) {
            mapRef.current.setView(
              [matchedLocation.lat, matchedLocation.lng],
              8 // Zoom level
            );
          }
        } else {
          console.warn("No matching location found for:", selectedName);

          // Use product's own coordinates if available
          if (selectedProductContext.lat && selectedProductContext.lng) {
            const newLocation = {
              lat: parseFloat(selectedProductContext.lat),
              lng: parseFloat(selectedProductContext.lng),
              product: selectedName,
              country: selectedProductContext.country || "Unknown",
              description: selectedProductContext.description || "",
            };

            setSelectedLocation(newLocation);

            if (mapRef.current) {
              mapRef.current.setView([newLocation.lat, newLocation.lng], 8);
            }
          } else {
            setSelectedLocation(null);
          }
        }
      } else {
        setSelectedLocation(null);
      }
    }, [selectedProductContext, locations]);

    useEffect(() => {
      // If filteredProducts becomes empty and we had filtered products before
      if (
        filteredProductsList.length === 0 &&
        prevFilteredProductsRef.current > 0
      ) {
        console.log("Search results cleared, resetting map display");

        // No need to select a specific product when clearing search
        setSelectedLocation(null);

        // This will force a recalculation of locations
        if (mapRef.current) {
          // Reset view to show all markers
          mapRef.current.setView([30, -10], 3);
        }
      }

      // Keep track of previous filteredProducts length
      prevFilteredProductsRef.current = filteredProductsList.length;
    }, [filteredProductsList]);

    useEffect(() => {
      setMarkerSelected(!!selectedLocation);
    }, [selectedLocation, setMarkerSelected]);

    return (
      <>
        <MapContainer
          center={[30, -10]}
          zoom={3}
          style={{ height: "100vh", width: "100%" }}
          ref={mapRef}
          maxBounds={[
            [-90, -180],
            [90, 180],
          ]}
        >
          <ZoomControl setZoom={setZoom} zoom={zoom} />
          <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

          {/* Filter status indicators */}
          <div
            style={{
              position: "absolute",
              top: "10px",
              left: "10px",
              zIndex: 999,
              display: "flex",
              flexDirection: "column",
              gap: "5px",
            }}
          >
            {filterEpdOnly && (
              <div
                style={{
                  background: "rgba(0, 137, 123, 0.8)",
                  color: "white",
                  padding: "6px 12px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                  cursor: "help",
                  position: "relative",
                }}
                title="Showing only Environmental Product Declaration (EPD) markers from the EPD database"
              >
                <span style={{ marginRight: "5px" }}>EPD Explorer Mode</span>
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#ffffff",
                    display: "inline-block",
                    animation: "pulse 1.5s infinite",
                  }}
                ></span>
              </div>
            )}
            {filterEpdOnly &&
              yearRange[0] !== "all" &&
              yearRange[1] !== "all" && (
                <div
                  style={{
                    background: "rgba(0, 137, 123, 0.8)",
                    color: "white",
                    padding: "6px 12px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                  }}
                >
                  <span>
                    EPD API Year Filter: {yearRange[0]} - {yearRange[1]}
                  </span>
                  {epdFilterStats.total > 0 && (
                    <span
                      style={{
                        marginLeft: "8px",
                        background: "rgba(255,255,255,0.2)",
                        padding: "2px 6px",
                        borderRadius: "8px",
                      }}
                    >
                      {epdFilterStats.filtered}/{epdFilterStats.total} EPDs
                    </span>
                  )}
                </div>
              )}
          </div>

          {distributedLocations.length === 0 && !isLoading && (
            <div
              style={{
                position: "absolute",
                top: "10px",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 1,
                background: "rgba(255,255,255,0.8)",
                padding: "10px",
                borderRadius: "5px",
              }}
            >
              No markers to display. Check console for details.
            </div>
          )}
          {distributedLocations.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                zIndex: 1,
                background: "rgba(255,255,255,0.8)",
                padding: "5px",
                borderRadius: "5px",
                fontSize: "12px",
              }}
            >
              Showing {distributedLocations.length} markers
            </div>
          )}
          {distributedLocations.map((location, index) => {
            // Determine if this is the selected location
            const isSelected =
              selectedLocation &&
              location.lat === selectedLocation.lat &&
              location.lng === selectedLocation.lng;

            // Different style for selected marker
            const circleOptions = isSelected
              ? {
                  fillColor: "#4DB6AC", // Teal 300 for selected (brighter)
                  color: "#00695C", // Teal 800 border (darker)
                  weight: 2,
                  fillOpacity: 0.8,
                }
              : {
                  fillColor: location.isEpd ? "#4DB6AC" : "#00695C", // Teal 300 vs Teal 800 (light vs dark)
                  color: location.isEpd ? "#26A69A" : "#004D40", // Teal 400 vs Teal 900 border
                  weight: 1,
                  fillOpacity: 0.6,
                };
        {isBrowser ? (
          <MapContainer
            center={[30, -10]}
            zoom={3}
            style={{ height: "100vh", width: "100%" }}
            ref={mapRef}
            maxBounds={[
              [-90, -180],
              [90, 180],
            ]}
          >
            <ZoomControl setZoom={setZoom} zoom={zoom} />
            <TileLayer 
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" 
            />
            {distributedLocations.length === 0 && !isLoading && (
              <div style={{
                position: 'absolute',
                top: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1,
                background: 'rgba(255,255,255,0.8)',
                padding: '10px',
                borderRadius: '5px'
              }}>
                No markers to display. Check console for details.
              </div>
            )}
            {distributedLocations.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                zIndex: 1,
                background: 'rgba(255,255,255,0.8)',
                padding: '5px',
                borderRadius: '5px',
                fontSize: '12px'
              }}>
                Showing {distributedLocations.length} markers
              </div>
            )}
            {distributedLocations.map((location, index) => {
              // Determine if this is the selected location
              const isSelected = selectedLocation && 
                location.lat === selectedLocation.lat && 
                location.lng === selectedLocation.lng;
              
              // Different style for selected marker
              const circleOptions = isSelected 
                ? { 
                    fillColor: "#4DB6AC", // Teal 300 for selected (brighter)
                    color: "#00695C", // Teal 800 border (darker)
                    weight: 2,
                    fillOpacity: 0.8,
                  }
                : {
                    fillColor: location.isEpd ? "#4DB6AC" : "#00695C", // Teal 300 vs Teal 800 (light vs dark)
                    color: location.isEpd ? "#26A69A" : "#004D40", // Teal 400 vs Teal 900 border
                    weight: 1,
                    fillOpacity: 0.6,
                  };

            return (
              <Circle
                key={`${location.lat}-${location.lng}-${index}`}
                center={[location.lat, location.lng]}
                radius={getCircleRadius(zoom)}
                pathOptions={circleOptions}
              >
                <Popup>
                  <div style={{ maxWidth: "250px" }}>
                    <h3>{location.product}</h3>
                    <p>
                      <strong>Country:</strong> {location.country}
                      {isSelected && (
                        <span style={{ color: "red" }}> ★ Selected</span>
                      )}
                    </p>
                    {location.isEpd && (
                      <>
                        <p>
                          <strong>Type:</strong> {location.isEpd}
                        </p>
                        {location.refYear && location.refYear !== "all" && (
                          <p>
                            <strong>EPD Year:</strong> {location.refYear}
                          </p>
                        )}
                      </>
                    )}
                    {location.description && (
                      <p>
                        <strong>Description:</strong>{" "}
                        {location.description.substring(0, 100)}
                        {location.description.length > 100 ? "..." : ""}
                      </p>
                    )}
                  </div>
                </Popup>
              </Circle>
            );
          })}
        </MapContainer>

              return (
                <Circle
                  key={`${location.lat}-${location.lng}-${index}`}
                  center={[location.lat, location.lng]}
                  radius={getCircleRadius(zoom)}
                  pathOptions={circleOptions}
                >
                  <Popup>
                    <div style={{ maxWidth: "250px" }}>
                      <h3>{location.product}</h3>
                      <p>
                        <strong>Country:</strong> {location.country}
                        {isSelected && <span style={{ color: "red" }}> ★ Selected</span>}
                      </p>
                      {location.isEpd && (
                        <p>
                          <strong>Type:</strong> {location.isEpd}
                        </p>
                      )}
                      {location.description && (
                        <p>
                          <strong>Description:</strong> {location.description.substring(0, 100)}
                          {location.description.length > 100 ? "..." : ""}
                        </p>
                      )}
                    </div>
                  </Popup>
                </Circle>
              );
            })}
          </MapContainer>
        ) : (
          <div style={{ height: "100vh", width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Loading message="Loading map..." />
          </div>
        )}
        
        {/* Overlay loading indicator when loading */}
        {isLoading && <Loading message={loadingMessage} />}
        <style jsx global>{`
          .leaflet-popup {
            z-index: 99999 !important;
          }
          .leaflet-popup-content-wrapper {
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
          }
          .leaflet-popup-tip {
            background: rgba(255, 255, 255, 0.95);
          }
          /* Ensure popup container is above everything */
          .leaflet-pane {
            z-index: 99000 !important;
          }
          .leaflet-popup-pane {
            z-index: 99500 !important;
          }
          .leaflet-overlay-pane {
            z-index: 98500 !important;
          }
          /* Fix for markers being hidden behind map tiles */
          .leaflet-map-pane {
            z-index: 98000 !important;
          }
          .leaflet-tile-pane {
            z-index: 97500 !important;
          }
          .leaflet-marker-pane {
            z-index: 97600 !important;
          }
          .leaflet-shadow-pane {
            z-index: 97550 !important;
          }
          /* Ensure SVG layers (where circles are rendered) appear above tiles */
          .leaflet-objects-pane {
            z-index: 97650 !important;
          }
          .leaflet-svg-pane {
            z-index: 97700 !important;
          }
          /* Make sure popups are always on top */
          .leaflet-tooltip-pane {
            z-index: 99600 !important;
          }
          .leaflet-popup-pane {
            z-index: 99700 !important;
          }
          @keyframes pulse {
            0% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.2);
            }
            100% {
              transform: scale(1);
            }
          }
        `}</style>
      </>
    );
  }
);

MapComponent.displayName = "MapComponent";
export default MapComponent;
