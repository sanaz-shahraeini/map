"use client";
import { useState, useRef, Suspense, lazy } from "react";
import {
  Box,
  Paper,
  Typography,
  Chip,
  Fade,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import dynamic from "next/dynamic";
import MainSidebar from "../components/(Slider)/MainSidebar";
import VerticalIcons from "../components/mapDetail/VerticalIcons";
import SearchBar from "../components/mapDetail/SearchBar";
import countryCoordinates from "../../public/data/countryCoordinates.jsx";

// Import components dynamically to ensure they only load on the client
const VerticalToggleButtons = dynamic(
  () => import("../components/(Map)/VerticalToggleButtons"),
  { ssr: false }
);

const Map = dynamic(() => import("../components/(Map)/Map"), { ssr: false });
import Header from "../components/header/Header";
import "../css/colors.css";
import { SearchProvider } from "../useContexts/SearchContext";
import { ProductsProvider } from "../useContexts/ProductsContext";

const IndexPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const mapRef = useRef(null);

  const [selectedSidebar, setSelectedSidebar] = useState("Legend");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [yearRange, setYearRange] = useState([2000, 2050]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [mapZoom, setMapZoom] = useState(3);
  const [showInfoCard, setShowInfoCard] = useState(true);
  const [filterEpdOnly, setFilterEpdOnly] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(true);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <ProductsProvider>
      <SearchProvider>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            backgroundColor: "#fafafa",
          }}
        >
          {/* Header */}
          <Header />

          {/* Main Content */}
          <Box
            sx={{
              flexGrow: 1,
              mt: "64px",
              position: "relative",
              display: "flex",
              overflow: "hidden",
            }}
          >
            {/* Vertical Icons Sidebar */}
            <Box
              sx={{
                position: "relative",
                height: "100%",
                zIndex: 9999,
                width: { xs: "70px", sm: "80px" },
              }}
            >
              <VerticalIcons
                toggleSidebar={toggleSidebar}
                setSelectedCategory={setSelectedCategory}
                selectedCategory={selectedCategory}
                setCategories={setCategories}
                categories={categories}
                setSelectedSidebar={setSelectedSidebar}
                setFilterEpdOnly={setFilterEpdOnly}
                filterEpdOnly={filterEpdOnly}
              />
            </Box>

            {/* Search Bar */}
            <Grid
              container
              spacing={1}
              sx={{
                zIndex: 9990,
                position: "relative",
                mt: 2,
              }}
            >
              <Grid size={{ xs: 12, sm: 6, md: 12 }}>
                <SearchBar mapRef={mapRef} />
              </Grid>
            </Grid>

            {/* Main Content */}
            <Grid
              container
              sx={{
                display: "flex",
                flex: 1,
                position: "relative",
                height: "685px",
                zIndex: 1001,
              }}
            >
              {/* Sidebar and Icons--- */}
              <Grid container sx={{ display: "flex", flexDirection: "row" }}>
                {/* Main Sidebar */}
                {isSidebarOpen && (
                  <Box
                    sx={{
                      zIndex: 3,
                      width: "250px",
                      position: "relative",
                      top: "0",
                      marginLeft: "0px",
                    }}
                  >
                    <MainSidebar
                      selected={selectedSidebar}
                      onSelect={setSelectedSidebar}
                      yearRange={yearRange}
                      setYearRange={setYearRange}
                      selectedCountry={selectedCountry}
                      setSelectedCountry={setSelectedCountry}
                      selectedProduct={selectedProduct}
                      setSelectedProduct={setSelectedProduct}
                      countryCoordinates={countryCoordinates}
                      selectedCategory={selectedCategory}
                      setIsSidebarOpen={setIsSidebarOpen}
                      filterEpdOnly={filterEpdOnly}
                      setFilterEpdOnly={setFilterEpdOnly}
                    />
                  </Box>
                )}
              </Grid>

              {/* Map */}
              <Grid
                size={{ xs: 12 }}
                sx={{
                  position: "absolute",
                  zIndex: 1,
                  top: 0,
                  left: 0,
                  height: "100%",
                }}
              >
                <section
                  style={{
                    height: "100vh",
                    width: "100vw",
                    position: "fixed",
                    zIndex: -1,
                    top: 0,
                    left: 0,
                  }}
                >
                  <Map
                    ref={mapRef}
                    selectedCountry={selectedCountry}
                    selectedProduct={selectedProduct}
                    yearRange={yearRange}
                    selectedCategory={selectedCategory}
                    setCategories={setCategories}
                    categories={categories}
                    zoom={mapZoom}
                    setZoom={setMapZoom}
                    filterEpdOnly={filterEpdOnly}
                  />
                </section>
              </Grid>

              {/* Toggle Buttons */}
              <Grid
                sx={{
                  position: "fixed",
                  bottom: "20px",
                  right: "20px",
                  zIndex: 900,
                }}
              >
                <Suspense fallback={<div>Loading...</div>}>
                  <VerticalToggleButtons
                    mapZoom={mapZoom}
                    setMapZoom={setMapZoom}
                    selectedProduct={selectedProduct}
                    setShowInfoCard={setShowInfoCard}
                    showInfoCard={showInfoCard}
                    selectedCountry={selectedCountry}
                    selectedCategory={selectedCategory}
                    yearRange={yearRange}
                    isSidebarOpen={isSidebarOpen}
                  />
                </Suspense>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </SearchProvider>
    </ProductsProvider>
  );
};

export default IndexPage;
