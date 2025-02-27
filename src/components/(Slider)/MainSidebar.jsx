import React, { useEffect, useState } from "react";
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

  // Fetch products data
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const [response1, response2] = await Promise.all([
          fetch("https://epd-fullstack-project.vercel.app/api/products/"),
          fetch("https://epd-fullstack-project.vercel.app/api/ibudata/"),
        ]);

        if (!response1.ok || !response2.ok) {
          throw new Error(
            `HTTP error! statuses: ${response1.status}, ${response2.status}`
          );
        }

        const data1 = await response1.json();
        const data2 = await response2.json();

        // Mark EPD data explicitly for filtering
        const productsData = data1.results.map(item => ({
          ...item,
          isFromRegularAPI: true
        }));
        
        const epdData = data2.results.map(item => ({
          ...item,
          type: "EPD", // Mark as EPD type
          isFromEPDAPI: true
        }));

        const combinedResults = [...productsData, ...epdData];

        const formattedProducts = combinedResults.map((item) => ({
          category_name: item.category_name || item.classific || null,
          name: item.product_name || item.name || "No name specified",
          industry_solution:
            item.industry_solution || item.type || "No solution specified",
          image_url: item.image_url || null,
        }));

        setProducts(formattedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Error fetching products");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

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

  // Filter products based on selected category
  const filteredProducts = products.filter((product) => {
    if (selectedCategory === "all") return true;
    const productCategories = (product.category_name || "").split(" / ");
    return productCategories.includes(selectedCategory);
  });

  // Filter products to only include EPD data
  const epdProducts = filteredProducts.filter(product => product.isFromEPDAPI);

  // Function to handle image errors
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.style.display = 'none';
    e.target.parentNode.querySelector('.fallback-icon').style.display = 'flex';
  };

  return (
    <>
      <Box
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
                defaultValue="Top products"
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
                <MenuItem value="Top products">Top products</MenuItem>
                <MenuItem value="New arrivals">New arrivals</MenuItem>
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
                    <Skeleton variant="rectangular" width={60} height={60} sx={{ mr: 2 }} />
                    <Box sx={{ width: '100%' }}>
                      <Skeleton width="70%" height={24} />
                      <Skeleton width="40%" height={20} />
                    </Box>
                  </ListItem>
                ))
              ) : epdProducts.length > 0 ? (
                epdProducts.map((product, index) => (
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
                          width: "65px",
                          height: "60px",
                          backgroundColor: "#f7f7f7",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: "16px",
                          borderRadius: "8px",
                          overflow: "hidden",
                          position: "relative",
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
                                maxWidth: "100%",
                                maxHeight: "100%",
                                objectFit: "contain",
                              }}
                            />
                            <Box 
                              className="fallback-icon"
                              sx={{ 
                                display: 'none',
                                position: 'absolute',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '100%',
                                height: '100%'
                              }}
                            >
                              <ImageIcon sx={{ color: "#656959", fontSize: "35px" }} />
                            </Box>
                          </>
                        ) : (
                          <ImageIcon sx={{ color: "#656959", fontSize: "35px" }} />
                        )}
                      </Box>

                      <Box sx={{ flexGrow: 1 }}>
                        <ListItemText
                          primary={product.name}
                          secondary={product.industry_solution}
                          primaryTypographyProps={{
                            sx: { 
                              fontWeight: 500,
                              color: '#424242', 
                              fontSize: '15px'
                            }
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
                    {index < epdProducts.length - 1 && (
                      <Divider sx={{ width: "100%", bgcolor: "#e0e0e0" }} />
                    )}
                  </React.Fragment>
                ))
              ) : (
                <Typography variant="body1" sx={{ p: 2, color: '#666' }}>
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
