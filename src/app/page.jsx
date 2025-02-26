"use client";
import { useState, useRef, Suspense } from "react";
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
import dynamic from 'next/dynamic';
import MainSidebar from "../components/(Slider)/MainSidebar"
import VerticalIcons from "../components/mapDetail/VerticalIcons";
import SearchBar from "../components/mapDetail/SearchBar";
import countryCoordinates from "../../public/data/countryCoordinates.jsx";
import Header from "../components/header/Header";
import "../css/colors.css";
import { SearchProvider } from "../useContexts/SearchContext";
import { ProductsProvider } from "../useContexts/ProductsContext";

// Dynamic imports for components that need to be client-side only
const VerticalToggleButtons = dynamic(
  () => import('../components/(Map)/VerticalToggleButtons').catch(err => {
    console.error('Failed to load VerticalToggleButtons component:', err);
    return () => <div>Error loading buttons</div>;
  }),
  { 
    ssr: false, // This ensures the component only renders on the client
    loading: () => <div>Loading...</div>
  }
);

// Dynamic import for Map component to avoid server-side rendering issues
const Map = dynamic(
  () => import('../components/(Map)/Map').catch(err => {
    console.error('Failed to load Map component:', err);
    return () => <div>Error loading map</div>;
  }),
  { 
    ssr: false,
    loading: () => <div>Loading map...</div>
  }
);

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

  const toggleSidebar = () => {
    setIsSidebarOpen(true);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <ProductsProvider>
      <SearchProvider>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100vh',
          backgroundColor: '#fafafa'
        }}>
          {/* Header */}
          <Header />
          
          {/* Main Content */}
          <Box sx={{ 
            flexGrow: 1, 
            mt: '64px', 
            position: 'relative',
            display: 'flex',
            overflow: 'hidden'
          }}>
            {/* Vertical Icons Sidebar */}
            <Box 
              sx={{ 
                position: 'relative', 
                height: '100%',
                zIndex: 100
              }}
            >
              <VerticalIcons
                toggleSidebar={toggleSidebar}
                setSelectedCategory={setSelectedCategory}
                selectedCategory={selectedCategory}
                setCategories={setCategories}
                categories={categories}
                setSelectedSidebar={setSelectedSidebar}
              />
            </Box>

            {/* Search Bar */}
            <Grid
              container
              spacing={1}
              sx={{
                zIndex: 2,
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
                  />
                </section>
              </Grid>

              {/* Floating Info Card */}
              <Fade in={showInfoCard} timeout={800}>
                <Paper
                  elevation={3}
                  sx={{
                    position: "fixed",
                    top: isMobile ? "auto" : "100px",
                    left: isMobile ? "50%" : "35px",
                    bottom: isMobile ? "80px" : "auto",
                    transform: isMobile ? "translateX(-50%)" : "none",
                    width: isMobile ? "90%" : "280px",
                    borderRadius: "16px",
                    padding: "20px",
                    background: "rgba(255, 255, 255, 0.9)",
                    backdropFilter: "blur(10px)",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                    zIndex: 900,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: "0 12px 48px rgba(0, 0, 0, 0.15)",
                      transform: isMobile
                        ? "translateX(-50%) translateY(-5px)"
                        : "translateY(-5px)",
                    },
                    display: isMobile && isSidebarOpen ? "none" : "block",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ color: "#00897B", fontWeight: 600, mb: 2 }}
                  >
                    Global Product Map
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: "#555", mb: 1 }}>
                      Currently viewing:
                    </Typography>
                    <Chip
                      label={selectedCountry || "All Countries"}
                      size="small"
                      sx={{
                        mr: 1,
                        mb: 1,
                        backgroundColor: "#E0F2F1",
                        color: "#00897B",
                        fontWeight: 500,
                      }}
                    />
                    <Chip
                      label={selectedProduct || "All Products"}
                      size="small"
                      sx={{
                        mr: 1,
                        mb: 1,
                        backgroundColor: "#E0F2F1",
                        color: "#00897B",
                        fontWeight: 500,
                      }}
                    />
                    <Chip
                      label={selectedCategory || "All Categories"}
                      size="small"
                      sx={{
                        mr: 1,
                        mb: 1,
                        backgroundColor: "#E0F2F1",
                        color: "#00897B",
                        fontWeight: 500,
                      }}
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: "#555", mb: 1 }}>
                      Year Range:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {yearRange[0]} - {yearRange[1]}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#00897B",
                        cursor: "pointer",
                        "&:hover": {
                          textDecoration: "underline",
                        },
                      }}
                      onClick={() => setShowInfoCard(false)}
                    >
                      Hide this card
                    </Typography>
                  </Box>
                </Paper>
              </Fade>

              {/* Toggle Buttons */}
              <Grid
                sx={{
                  position: "fixed",
                  bottom: "20px",
                  right: "20px",
                  zIndex: 1000,
                }}
              >
                <Suspense fallback={<div>Loading...</div>}>
                  <VerticalToggleButtons
                    mapZoom={mapZoom}
                    setMapZoom={setMapZoom}
                    selectedProduct={selectedProduct}
                    setShowInfoCard={setShowInfoCard}
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
