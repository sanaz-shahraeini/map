import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Typography,
  Select,
  MenuItem,
  Skeleton,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Sidebar from "./Sidebar";
import FilteredInfoSection from "./FilteredInfoSection";
import ImageIcon from "@mui/icons-material/Image";
import Grid from "@mui/material/Grid2";
import ViewInArIcon from "@mui/icons-material/ViewInAr";

const MainSidebar = ({
  selected,
  onSelect,
  yearRange,
  setYearRange,
  selectedCountry,
  setSelectedCountry,
  selectedProduct,
  setSelectedProduct,
  countryCoordinates,
  selectedCategory,
  setIsSidebarOpen,
  filterEpdOnly,
  setFilterEpdOnly,
}) => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState();
  const [filteredExtraInfo, setFilteredExtraInfo] = useState([]);
  const [showLastProduct, setShowLastProduct] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPriority, setSelectedPriority] = useState("Top products");
  const sidebarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is on any interactive elements
      const isInteractiveElement =
        event.target.closest(".MuiSelect-root") ||
        event.target.closest(".MuiPopover-root") ||
        event.target.closest(".MuiMenuItem-root") ||
        event.target.closest(".MuiButton-root") ||
        event.target.closest("[role='button']") ||
        event.target.closest("[role='tab']") ||
        event.target.closest(".MuiPaper-root");

      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        !isInteractiveElement
      ) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setIsSidebarOpen]);

  // Fetch products data
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        // Fetch EPD products
        const response = await fetch(
          "https://epd-fullstack-project.vercel.app/api/ibudata/"
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("EPD API response:", data);

        // Format EPD products
        const epdProducts = (data.results || []).map((item) => ({
          category_name: item.classific || null,
          name: item.name || "No name specified",
          industry_solution: "EPD Product",
          image_url: null,
          description: null,
          pdf_url: item.pdf_url || null,
          geo: item.geo || null,
          company_name: null,
          created_at: null,
          isFromEPDAPI: true,
          type: "EPD",
          ref_year: item.ref_year,
          uuid: item.uuid,
        }));

        console.log("Formatted EPD products:", epdProducts);
        setProducts(epdProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Error fetching products");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Handle priority change
  const handlePriorityChange = (event) => {
    event.stopPropagation();
    setSelectedPriority(event.target.value);
  };

  // Remove a specific filter
  const handleRemoveInfo = (index) => {
    setFilteredExtraInfo((prevInfo) => prevInfo.filter((_, i) => i !== index));
  };

  // Remove last product
  const handleRemoveLastProduct = () => {
    setShowLastProduct(false);
  };

  // Filter extra info based on selected country, year range, and category
  useEffect(() => {
    const newFilteredInfo = [];
    if (selectedCountry) {
      newFilteredInfo.push(`Filtered by country: ${selectedCountry}`);
    }
    if (yearRange) {
      newFilteredInfo.push(`Year range: ${yearRange[0]} - ${yearRange[1]}`);
    }
    if (selectedCategory && selectedCategory !== "all") {
      newFilteredInfo.push(`Category: ${selectedCategory}`);
    }
    setFilteredExtraInfo(newFilteredInfo);
  }, [selectedCountry, yearRange, selectedCategory]);

  // Update filtered info when a product is selected
  const handleProductClick = (product) => {
    setSelectedProduct(product.name);
    setFilteredExtraInfo((prevInfo) => [
      ...prevInfo,
      `Selected product: ${product.name}`,
      `Industry solution: ${product.industry_solution}`,
    ]);
  };

  // Filter and sort products based on selected category and priority
  const getFilteredAndSortedProducts = () => {
    console.log("Current products:", products);
    console.log("Selected category:", selectedCategory);

    let filtered = products;

    // Filter by category if one is selected
    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter((product) => {
        // Get the first part of the category (e.g., "02 Bauprodukte" from "02 Bauprodukte / Metallbauprodukte...")
        const mainCategory = (product.category_name || "")
          .split(" / ")[0]
          .toLowerCase();
        const selectedMainCategory = selectedCategory.toLowerCase();

        // Check if the main category contains the selected category
        return mainCategory.includes(selectedMainCategory);
      });
    }

    // Sort based on priority
    if (selectedPriority === "New arrivals") {
      filtered = filtered.sort((a, b) => {
        const yearA = a.ref_year || 0;
        const yearB = b.ref_year || 0;
        return yearB - yearA;
      });
    }

    console.log("Filtered products:", filtered);
    return filtered;
  };

  const regularProducts = getFilteredAndSortedProducts();

  // Function to handle image errors
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.style.display = "none";
    e.target.parentNode.querySelector(".fallback-icon").style.display = "flex";
  };

  return (
    <>
      <Box
        ref={sidebarRef}
        sx={{
          width: "128%",
          bgcolor: "#ffffff",
          boxShadow: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          height: "68vh",
          marginLeft: { xs: "-1%", md: "9%" },
          marginTop: "5px",
        }}
      >
        {/* Buttons */}
        <Box
          sx={{
            bgcolor: "#f0f0f0",
            display: "flex",
            justifyContent: "center",
            borderRadius: "20px",
            margin: "15px",
          }}
        >
          <Grid container spacing={1}>
            <Grid size={{ xs: 6, md: 6 }}>
              <Button
                variant={selected === "Legend" ? "contained" : "outlined"}
                color="success"
                onClick={() => onSelect("Legend")}
                sx={{
                  width: "160%",
                  height: "40px",
                  marginLeft: "-57%",
                  border: "none",
                  borderRadius: "20px",
                  background:
                    selected === "Legend"
                      ? "linear-gradient(to right, #4DB6AC, #00897B,#00897B,#4DB6AC)"
                      : "#f0f0f0",
                  color: selected === "Legend" ? "white" : "black",
                  fontWeight: "bold",
                  boxShadow: "none",
                }}
              >
                Legend
              </Button>
            </Grid>

            <Grid size={{ xs: 6, md: 6 }}>
              <Button
                variant={selected === "Products" ? "contained" : "outlined"}
                color="success"
                onClick={() => onSelect("Products")}
                sx={{
                  width: "160%",
                  height: "40px",
                  border: "none",
                  borderRadius: "20px",
                  background:
                    selected === "Products"
                      ? "linear-gradient(to right, #4DB6AC, #00897B,#00897B,#4DB6AC)"
                      : "#f0f0f0",
                  color: selected === "Products" ? "white" : "black",
                  fontWeight: "bold",
                  boxShadow: "none",
                }}
              >
                Products
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Select Priority */}
        {selected === "Products" && (
          <Grid container alignItems="center" sx={{ px: 4, my: 3 }}>
            <Grid size={{ xs: 6, md: 6 }}>
              <Typography variant="body2">Select Priority</Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 6 }}>
              <Select
                value={selectedPriority}
                onChange={handlePriorityChange}
                onClick={(e) => e.stopPropagation()}
                onClose={(e) => e.stopPropagation()}
                MenuProps={{
                  anchorOrigin: {
                    vertical: "bottom",
                    horizontal: "left",
                  },
                  transformOrigin: {
                    vertical: "top",
                    horizontal: "left",
                  },
                  PaperProps: {
                    onClick: (e) => e.stopPropagation(),
                  },
                }}
                variant="outlined"
                size="small"
                fullWidth
                sx={{
                  bgcolor: "#F5F5F5",
                  borderRadius: "20px",
                  height: "42px",
                  border: "none",
                  "& fieldset": {
                    border: "none",
                  },
                }}
              >
                <MenuItem
                  value="Top products"
                  onClick={(e) => e.stopPropagation()}
                >
                  Top products
                </MenuItem>
                <MenuItem
                  value="New arrivals"
                  onClick={(e) => e.stopPropagation()}
                >
                  New arrivals
                </MenuItem>
              </Select>
            </Grid>
          </Grid>
        )}

        {/* Main Content with Scroll */}
        <Box sx={{ overflowY: "auto", flexGrow: 1, padding: 2 }}>
          {selected === "Products" ? (
            <List>
              {isLoading ? (
                // Display skeletons while loading
                Array.from(new Array(6)).map((_, index) => (
                  <ListItem key={`skeleton-${index}`} sx={{ py: 1 }}>
                    <Skeleton
                      variant="rectangular"
                      width={64}
                      height={64}
                      sx={{ mr: 2 }}
                    />
                    <Box sx={{ width: "100%" }}>
                      <Skeleton width="70%" height={24} />
                      <Skeleton width="40%" height={20} />
                    </Box>
                  </ListItem>
                ))
              ) : regularProducts.length > 0 ? (
                regularProducts.map((product, index) => (
                  <React.Fragment key={`Product${index}`}>
                    <ListItem
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        backgroundColor: "#ffffff",
                        px: 2,
                        py: 0.5,
                        cursor: "pointer",
                      }}
                      onClick={() => handleProductClick(product)}
                    >
                      <Box
                        sx={{
                          width: "64px",
                          height: "64px",
                          backgroundColor: "#f7f7f7",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: "16px",
                          borderRadius: "8px",
                          overflow: "hidden",
                          position: "relative",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            backgroundColor: "#f0f0f0",
                          },
                        }}
                      >
                        {product.image_url ? (
                          <>
                            <Box
                              component="img"
                              src={product.image_url}
                              alt={product.name}
                              onError={handleImageError}
                              sx={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                            <Box
                              className="fallback-icon"
                              sx={{
                                display: "none",
                                position: "absolute",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "100%",
                                height: "100%",
                                background:
                                  "linear-gradient(135deg, #E0F2F1 0%, #B2DFDB 100%)",
                                color: "#00897B",
                              }}
                            >
                              <ViewInArIcon sx={{ fontSize: "32px" }} />
                            </Box>
                          </>
                        ) : (
                          <Box
                            sx={{
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background:
                                "linear-gradient(135deg, #E0F2F1 0%, #B2DFDB 100%)",
                              color: "#00897B",
                              transition: "all 0.3s ease",
                              "&:hover": {
                                transform: "scale(1.05)",
                              },
                            }}
                          >
                            <ViewInArIcon sx={{ fontSize: "32px" }} />
                          </Box>
                        )}
                      </Box>

                      <Box sx={{ flexGrow: 1 }}>
                        <ListItemText
                          primary={product.name}
                          secondary={product.industry_solution}
                          primaryTypographyProps={{
                            sx: {
                              fontWeight: 500,
                              color: "#424242",
                              fontSize: "15px",
                            },
                          }}
                          secondaryTypographyProps={{
                            sx: { color: "#666", fontSize: "14px" },
                          }}
                        />
                      </Box>

                      <IconButton size="small" sx={{ ml: "auto" }}>
                        <InfoOutlinedIcon sx={{ color: "#4DB6AC" }} />
                      </IconButton>
                    </ListItem>
                    {index < regularProducts.length - 1 && (
                      <Divider sx={{ width: "100%", bgcolor: "#e0e0e0" }} />
                    )}
                  </React.Fragment>
                ))
              ) : (
                <Typography variant="body1" sx={{ p: 2, color: "#666" }}>
                  No products found for this category.
                </Typography>
              )}
            </List>
          ) : (
            <Sidebar
              yearRange={yearRange}
              setYearRange={setYearRange}
              selectedCountry={selectedCountry}
              setSelectedCountry={setSelectedCountry}
              countryCoordinates={countryCoordinates}
              filterEpdOnly={filterEpdOnly}
              setFilterEpdOnly={setFilterEpdOnly}
            />
          )}
        </Box>
      </Box>

      {/* Filtered Info Section */}
      <FilteredInfoSection
        extraInfo={filteredExtraInfo}
        showLastProduct={showLastProduct}
        handleRemoveInfo={handleRemoveInfo}
        handleRemoveLastProduct={handleRemoveLastProduct}
      />
    </>
  );
};

export default MainSidebar;
