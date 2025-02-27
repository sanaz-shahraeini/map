import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  InputAdornment,
  Modal,
  List,
  ListItem,
  Typography,
  Fab,
  ListItemText,
  IconButton,
  ListItemIcon,
  Tooltip,
  Pagination,
  useMediaQuery,
  useTheme,
  Paper,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import SearchIcon from "@mui/icons-material/Search";
import PublicIcon from "@mui/icons-material/Public";
import ListIcon from "@mui/icons-material/List";
import DownloadIcon from "@mui/icons-material/Download";
import StarIcon from "@mui/icons-material/Star";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SendIcon from "@mui/icons-material/Send";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useSearch } from "../../useContexts/SearchContext";
import { useProducts } from "../../useContexts/ProductsContext";

const SearchBar = ({ mapRef }) => {
  const [icon, setIcon] = useState(<PublicIcon sx={{ color: "#384029" }} />);
  const [openModal, setOpenModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [showResults, setShowResults] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { setSelectedProduct } = useProducts();
  const {
    searchResults,
    setSearchQuery: setContextSearchQuery,
    searchQuery: contextSearchQuery,
    isLoading,
    markerSelected,
  } = useSearch();

  // Synchronize local state with context
  useEffect(() => {
    setSearchQuery(contextSearchQuery);
    setShowResults(contextSearchQuery.length > 0);
  }, [contextSearchQuery]);

  const filteredProducts = searchResults || [];

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setContextSearchQuery(query);
    
    // Clear the selected product when typing a new search
    setSelectedProduct(null);
    
    // Show results while typing if query is not empty
    setShowResults(query.length > 0);

    // If the query is empty, close the results
    if (!query.trim()) {
      setShowResults(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      setShowResults(true);
    }
  };

  const handleIconClick = () => {
    if (icon.type === PublicIcon) {
      setIcon(<ListIcon sx={{ color: "#384029" }} />);
      setOpenModal(true);
    } else {
      setIcon(<PublicIcon sx={{ color: "#384029" }} />);
      setOpenModal(false);
    }
  };

  const handleDownload = (pdf_url) => {
    if (pdf_url) {
      const link = document.createElement("a");
      link.href = pdf_url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.download = pdf_url.split("/").pop();
      link.click();
    }
  };

  const handleProductSelect = (product) => {
    const productName = product.product_name || product.name;
    setSearchQuery(productName);
    setContextSearchQuery(productName);
    
    // Make a deep copy to ensure all properties are passed
    const productToSelect = { ...product };
    
    // Log details before setting
    console.log("Selecting product:", productName, productToSelect);
    
    // Set the selected product in the context
    setSelectedProduct(productToSelect);
    
    // Hide the search results after selection
    setShowResults(false);
  };

  const handleSearchClick = () => {
    // Clear the search input
    setSearchQuery("");
    setContextSearchQuery("");
    
    // Reset the selected product to show all markers
    setSelectedProduct(null);
    
    // Hide the search results
    setShowResults(false);
  };

  // Group products by country
  const groupedByCountry = Array.isArray(filteredProducts)
    ? filteredProducts.reduce((acc, product) => {
        const country = product.country || "Unknown";
        if (!acc[country]) {
          acc[country] = [];
        }
        acc[country].push(product);
        return acc;
      }, {})
    : {};

  const countryNames = Object.keys(groupedByCountry);
  const productsForCurrentPage = groupedByCountry[countryNames[page - 1]] || [];

  // Calculate items per page
  const itemsPerPage = 5;
  // const startIndex = (page - 1) * itemsPerPage;
  // const currentProducts = Array.isArray(filteredProducts) &&
  //   filteredProducts.length > 0
  //   ? filteredProducts.slice(startIndex, startIndex + itemsPerPage)
  //   : [];
  // const totalPages = Math.ceil((filteredProducts?.length || 0) / itemsPerPage);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "10px",
        width: "100%",
        position: "fixed",
        top: isMobile ? 0 : 100,
        zIndex: markerSelected ? 500 : 900,
        transition: "z-index 0.1s ease",
      }}
    >
      <Grid
        container
        display={"flex"}
        justifyContent="center"
        sx={{ width: isMobile ? "95%" : "70%" }}
      >
        <Grid
          item
          xs={isMobile ? 8 : 9}
          sx={{ marginRight: isMobile ? 0 : "8px", position: "relative" }}
        >
          <TextField
            placeholder="Search for products"
            variant="outlined"
            fullWidth
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyPress={handleKeyPress}
            onClick={handleSearchClick}
            sx={{
              borderRadius: "25px",
              transition: "all 0.3s ease",
              "& .MuiOutlinedInput-root": {
                height: "45px",
                borderRadius: "25px",
                background: "rgba(251, 251, 251, 0.9)",
                backdropFilter: "blur(10px)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: "0 6px 16px rgba(0, 0, 0, 0.12)",
                  transform: "translateY(-2px)",
                },
                "&.Mui-focused": {
                  boxShadow: "0 8px 20px rgba(0, 137, 123, 0.15)",
                  background: "#ffffff",
                },
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(0, 137, 123, 0.2)",
              },
              "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#00897B",
                borderWidth: "2px",
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Search only shows products from the regular products API. Search matches the first letter after 'zehnder-' in product names. Example: &quot;l&quot; will find &quot;zehnder-luna&quot;">
                    <HelpOutlineIcon
                      sx={{
                        color: "#00897B",
                        marginRight: 1,
                        fontSize: "20px",
                        cursor: "help",
                      }}
                    />
                  </Tooltip>
                  <SearchIcon
                    sx={{
                      color: "#00897B",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "scale(1.1)",
                        cursor: "pointer",
                      },
                    }}
                    onClick={() => setShowResults(true)}
                  />
                </InputAdornment>
              ),
            }}
          />

          {/* Search Results Dropdown */}
          {showResults && (
            <Paper
              elevation={3}
              sx={{
                position: "absolute",
                zIndex: 9999,
                marginTop: "5px",
                width: "100%",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
              }}
            >
              <Box p={2}>
                {isLoading ? (
                  <Typography color="textSecondary" sx={{ py: 2, textAlign: 'center' }}>
                    Searching...
                  </Typography>
                ) : filteredProducts.length > 0 ? (
                  <List sx={{ py: 0 }}>
                    {filteredProducts.slice(0, 5).map((product, index) => (
                      <ListItem
                        key={index}
                        sx={{
                          borderBottom:
                            index < filteredProducts.length - 1
                              ? "1px solid #f0f0f0"
                              : "none",
                          transition: "all 0.2s ease",
                          cursor: "pointer",
                          "&:hover": {
                            backgroundColor: "#E0F2F1",
                          },
                        }}
                        onClick={() => handleProductSelect(product)}
                      >
                        <ListItemIcon>
                          <Box
                            component="img"
                            src={
                              product.image_url || "/public/images/images(map).png"
                            }
                            alt={product.product_name}
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: "8px",
                              objectFit: "cover",
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography
                              variant="subtitle2"
                              sx={{ color: "#00897B", fontWeight: 600 }}
                            >
                              {product.product_name || product.name}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" sx={{ color: "#666" }}>
                              {product.geo || "Location not specified"}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography color="textSecondary" sx={{ py: 2, textAlign: 'center' }}>
                    No products found. Try a different search.
                    <br />
                    <span style={{ fontSize: '12px', marginTop: '8px', display: 'block' }}>
                      For zehnder products, type a letter that appears after "zehnder-".
                      <br />
                      Example: &quot;l&quot; will find &quot;zehnder-luna&quot;
                    </span>
                  </Typography>
                )}
              </Box>
            </Paper>
          )}
        </Grid>

        <Grid
          item
          xs={isMobile ? 4 : 2}
          sx={{ display: "flex", alignItems: "center" }}
        >
          <Fab
            size="small"
            aria-label="Icon"
            sx={{
              background: "white",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
              transition: "all 0.3s ease",
              "&:hover": {
                background: "#E0F2F1",
                boxShadow: "0 6px 16px rgba(0, 0, 0, 0.12)",
                transform: "translateY(-2px)",
              },
            }}
            onClick={handleIconClick}
          >
            {icon}
          </Fab>
        </Grid>
      </Grid>

      <Modal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setIcon(<PublicIcon sx={{ color: "#384029" }} />);
        }}
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <Box
          sx={{
            width: isMobile ? "90%" : "900px",
            height: isMobile ? "80%" : "600px",
            bgcolor: "white",
            padding: 3,
            marginTop: isMobile ? 5 : 10,
            borderRadius: 4,
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
            overflowY: "auto",
            animation: "fadeIn 0.3s ease-out",
            "@keyframes fadeIn": {
              "0%": {
                opacity: 0,
                transform: "translateY(20px)",
              },
              "100%": {
                opacity: 1,
                transform: "translateY(0)",
              },
            },
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: "#f1f1f1",
              borderRadius: "10px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#B2DFDB",
              borderRadius: "10px",
              "&:hover": {
                background: "#80CBC4",
              },
            },
          }}
        >
          <Typography
            variant="h5"
            sx={{
              marginBottom: 3,
              color: "#00897B",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <PublicIcon sx={{ fontSize: 28 }} />
            Products from {countryNames[page - 1] || "All Countries"}
          </Typography>

          <List sx={{ padding: 0 }}>
            {productsForCurrentPage.map((product, index) => (
              <ListItem
                key={`Product${index}`}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#ffffff",
                  height: "75px",
                  paddingX: 2,
                  paddingY: 5,
                  borderRadius: "12px",
                  marginBottom: 2,
                  transition: "all 0.2s ease",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                  "&:hover": {
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    transform: "translateY(-2px)",
                    backgroundColor: "#F5F5F5",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: "40px", marginRight: 4 }}>
                  <Box
                    component="img"
                    src={product.image_url || "/public/images/images(map).png"}
                    alt={`Product ${index + 1}`}
                    sx={{
                      width: 40,
                      height: 40,
                      objectFit: "cover",
                      borderRadius: "8px",
                      boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                </ListItemIcon>
                <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
                  <ListItemText
                    primary={
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          color: "#333",
                        }}
                      >
                        {product.name || product.product_name}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: "12px",
                          color: "#666",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {product.description?.length > 100
                          ? `${product.description.slice(0, 100)}...`
                          : product.description || ""}
                      </Typography>
                    }
                  />
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      marginLeft: 2,
                    }}
                  >
                    <Box
                      sx={{
                        height: "24px",
                        width: "auto",
                        display: "flex",
                        alignItems: "center",
                        backgroundColor: "#E0F2F1",
                        padding: "5px 12px",
                        borderRadius: "20px",
                        marginBottom: 1,
                      }}
                    >
                      <StarIcon
                        sx={{
                          color: "#00897B",
                          fontSize: "16px",
                          marginRight: 0.5,
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{ color: "#00897B", fontWeight: 600 }}
                      >
                        {product.type || "Product"}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center",
                      }}
                    >
                      {product.type === "EPD" && product.pdf_url ? (
                        <Tooltip title="Download PDF">
                          <IconButton
                            onClick={() => handleDownload(product.pdf_url)}
                            sx={{
                              backgroundColor: "#E0F2F1",
                              "&:hover": {
                                backgroundColor: "#B2DFDB",
                              },
                              transition: "all 0.2s ease",
                            }}
                          >
                            <DownloadIcon sx={{ color: "#00897B" }} />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Request Info">
                          <IconButton
                            onClick={() => alert("Request sent!")}
                            sx={{
                              backgroundColor: "#E0F2F1",
                              "&:hover": {
                                backgroundColor: "#B2DFDB",
                              },
                              transition: "all 0.2s ease",
                            }}
                          >
                            <SendIcon
                              style={{ color: "#00897B", fontSize: "20px" }}
                            />
                          </IconButton>
                        </Tooltip>
                      )}
                      <IconButton
                        sx={{
                          marginLeft: 1,
                          backgroundColor: "#E0F2F1",
                          "&:hover": {
                            backgroundColor: "#B2DFDB",
                          },
                          transition: "all 0.2s ease",
                        }}
                      >
                        <InfoOutlinedIcon sx={{ color: "#00897B" }} />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
              </ListItem>
            ))}
          </List>
          <Pagination
            count={countryNames.length}
            page={page}
            onChange={(event, value) => setPage(value)}
            sx={{ marginTop: 2, display: "flex", justifyContent: "center" }}
          />
        </Box>
      </Modal>
    </Box>
  );
};

export default SearchBar;
