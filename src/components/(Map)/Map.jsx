"use client";

import { MapContainer, TileLayer, Circle, Popup, useMap } from "react-leaflet";
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

const MapComponent = forwardRef(
  (
    {
      selectedCountry = "all",
      yearRange,
      selectedProduct = "all",
      selectedCategory,
      zoom,
      setZoom,
    },
    ref
  ) => {
    const [locations, setLocations] = useState([]);
    const mapRef = useRef(null);
    const { allProducts, loading, error, selectedProduct: selectedProductContext } = useProducts();
    const { searchResults } = useSearch();
    const filteredProducts = searchResults || [];

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
      if (!loading && !error) {
        // Decide which products to display
        const productsToShow = 
          (filteredProducts && filteredProducts.length > 0) 
            ? filteredProducts 
            : allProducts || [];
        
        console.log(`Map preparing to show ${productsToShow.length} products`);
        
        // Log geo distribution for debugging
        if (productsToShow.length > 0) {
          const geoDistribution = {};
          productsToShow.forEach(product => {
            const geo = product.geo || 'undefined';
            geoDistribution[geo] = (geoDistribution[geo] || 0) + 1;
          });
          console.log('Map geo distribution:', geoDistribution);
        }
        
        if (productsToShow.length > 0) {
          // For performance, if there are too many products, let's set a reasonable limit
          // to avoid overwhelming the map rendering
          const maxProducts = 1000;
          let productsToProcess = productsToShow;
          
          if (productsToShow.length > maxProducts) {
            console.warn(`Too many products (${productsToShow.length}), limiting to ${maxProducts} for performance`);
            productsToProcess = productsToShow.slice(0, maxProducts);
          }
          
          // Format products for map display
          const formattedLocations = productsToProcess
            .map(product => {
              // Ensure we have valid coordinates
              if (!product.lat || !product.lng || 
                  isNaN(parseFloat(product.lat)) || 
                  isNaN(parseFloat(product.lng))) {
                console.warn(`Product missing valid coordinates: ${product.name}`);
                return null;
              }
              
              // Create a properly formatted location object
              return {
                lat: parseFloat(product.lat),
                lng: parseFloat(product.lng),
                country: product.country || "Unknown",
                refYear: product.ref_year || product.refYear || "all",
                validUntil: product.valid_until || product.validUntil || "all",
                product: product.product_name || product.name || "Unnamed Product",
                description: product.description || "",
                isEpd: product.type === "EPD" ? "EPD" : null,
                categories: product.classific || product.category_name || "",
                // Additional debugging info
                geo: product.geo,
                geoMapped: product.geoMapped,
                productId: product.id || product.uid
              };
            })
            .filter(location => location !== null);
          
          console.log(`Map has ${formattedLocations.length} valid locations to display`);
          
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
    }, [allProducts, filteredProducts, loading, error]);

    useEffect(() => {
      // Debug log all products to help identify issues
      if (!loading && allProducts) {
        console.log(`Total products available: ${allProducts.length}`);
        
        // Analyze geo field distribution
        const geoStats = {};
        allProducts.forEach(p => {
          const geo = p.geo || 'undefined';
          geoStats[geo] = (geoStats[geo] || 0) + 1;
        });
        console.log('Geo field distribution:', geoStats);
        
        // Log products with coordinates
        const withCoords = allProducts.filter(p => p.lat && p.lng);
        console.log(`Products with coordinates: ${withCoords.length}/${allProducts.length}`);
        
        // Sample of products with coordinates
        if (withCoords.length > 0) {
          console.log('Sample products with coordinates:', withCoords.slice(0, 3));
        }
        
        // Sample of products without coordinates
        const withoutCoords = allProducts.filter(p => !p.lat || !p.lng);
        if (withoutCoords.length > 0) {
          console.log('Sample products without coordinates:', withoutCoords.slice(0, 3));
        }
      }
    }, [allProducts, loading]);

    const ZoomControl = ({ setZoom, zoom }) => {
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

    const getFilteredLocations = () => {
      console.log('Total locations before filtering:', locations.length);
      console.log('Filtered products from search:', filteredProducts.length);
      console.log('Selected Product:', selectedProductContext);

      // Early return if no locations
      if (!locations || locations.length === 0) {
        console.log('No locations available');
        return [];
      }

      const filtered = locations.filter((location) => {
        // Skip undefined or null locations
        if (!location || !location.product) {
          return false;
        }

        // If we have filtered products from search, use those
        if (filteredProducts && filteredProducts.length > 0) {
          return filteredProducts.some(product => {
            const productName = product.product_name || product.name || '';
            const locationProduct = location.product || '';
            
            // Direct match
            if (productName === locationProduct) {
              console.log(`Product match found: "${productName}" === "${locationProduct}"`);
              return true;
            }
            
            // Special case for zehnder-basic-silent-wall-fan
            if (productName === "zehnder-basic-silent-wall-fan") {
              // Look for related names
              if (locationProduct.includes("silent-wall") || 
                  locationProduct.includes("basic-silent") || 
                  locationProduct.includes("wall-fan")) {
                console.log(`Special match found for zehnder-basic-silent-wall-fan: "${locationProduct}"`);
                return true;
              }
            }
            
            // Handle Zehnder products
            if (productName.toLowerCase().includes('zehnder-') && 
                locationProduct.toLowerCase().includes('zehnder-')) {
              const productNameWithoutPrefix = productName.toLowerCase().split('zehnder-')[1];
              const locationNameWithoutPrefix = locationProduct.toLowerCase().split('zehnder-')[1];
              
              // Check if product name parts match the location product name parts
              const productNameParts = productNameWithoutPrefix.split('-');
              const locationNameParts = locationNameWithoutPrefix.split('-');
              
              // Check for at least 50% matching parts
              let matchingParts = 0;
              for (const part of productNameParts) {
                if (locationNameParts.includes(part)) {
                  matchingParts++;
                }
              }
              
              const matchRatio = matchingParts / productNameParts.length;
              if (matchRatio >= 0.5) {
                console.log(`Zehnder partial match found: "${productName}" ~= "${locationProduct}" (${Math.round(matchRatio * 100)}% match)`);
                return true;
              }
              
              if (productNameWithoutPrefix === locationNameWithoutPrefix) {
                console.log(`Zehnder exact match found: "${productName}" === "${locationProduct}" (without prefix)`);
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

        const yearMatch =
          yearRange[0] === "all" ||
          yearRange[1] === "all" ||
          ((location.refYear === "all" || location.refYear >= yearRange[0]) &&
            (location.validUntil === "all" ||
              location.validUntil <= yearRange[1]));

        const productMatch =
          selectedProduct === "all" ||
          !selectedProduct ||
          location.product === selectedProduct;

        const categoryMatch =
          selectedCategory === "all" ||
          !selectedCategory ||
          (location.categories && 
           (typeof location.categories === 'string' 
            ? location.categories.includes(selectedCategory)
            : Array.isArray(location.categories) && location.categories.includes(selectedCategory)));

        return countryMatch && yearMatch && productMatch && categoryMatch;
      });

      console.log('Filtered locations:', filtered.length);
      if (filtered.length === 0) {
        console.log('No locations matched the filters');
      } else {
        console.log('Sample filtered location:', filtered[0]);
      }

      return filtered;
    };

    const filteredLocations = getFilteredLocations();
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
        const selectedName = selectedProductContext.product_name || selectedProductContext.name;
        console.log("Selected product:", selectedName, selectedProductContext);
        
        // Try to find matching location
        let matchedLocation = null;
        
        // Special handling for zehnder-basic-silent-wall-fan
        if (selectedName === "zehnder-basic-silent-wall-fan") {
          console.log("Special handling for zehnder-basic-silent-wall-fan");
          
          // Try to find any locations with similar names
          matchedLocation = locations.find(loc => 
            loc.product && (
              loc.product.includes("silent-wall") ||
              loc.product.includes("basic-silent") ||
              loc.product.includes("wall-fan")
            )
          );
          
          if (matchedLocation) {
            console.log("Found similar product:", matchedLocation.product);
          }
        }
        
        // If no special match found, try normal matching
        if (!matchedLocation) {
          matchedLocation = locations.find(loc => 
            loc.product === selectedName
          );
        }
        
        // If still no match, try case-insensitive
        if (!matchedLocation) {
          const lowerName = selectedName.toLowerCase();
          matchedLocation = locations.find(loc => 
            (loc.product || '').toLowerCase() === lowerName
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
              description: selectedProductContext.description || ""
            };
            
            setSelectedLocation(newLocation);
            
            if (mapRef.current) {
              mapRef.current.setView(
                [newLocation.lat, newLocation.lng],
                8
              );
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
      if (filteredProducts.length === 0 && prevFilteredProductsRef.current > 0) {
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
      prevFilteredProductsRef.current = filteredProducts.length;
    }, [filteredProducts]);

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
          <TileLayer 
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" 
          />
          {distributedLocations.length === 0 && (
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000,
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
              zIndex: 1000,
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
        <style jsx global>{`
          .leaflet-popup {
            z-index: 2000 !important;
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
        `}</style>
      </>
    );
  }
);

MapComponent.displayName = "MapComponent";
export default MapComponent;
