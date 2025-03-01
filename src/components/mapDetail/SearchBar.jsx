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

  const { setSelectedProduct, regularProducts, allProducts } = useProducts();
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
    console.log("Product selected:", product);

    // Set search query and context
    setSearchQuery(productName);
    setContextSearchQuery(productName);

    // Hide the search results immediately
    setShowResults(false);

    // Make a deep copy to ensure all properties are passed
    const productToSelect = { ...product };

    // Set the selected product in the context
    setSelectedProduct(productToSelect);

    // Center map on the selected product's location if coordinates are available
    if (productToSelect.lat && productToSelect.lng) {
      console.log(
        "Attempting to center map on:",
        productToSelect.lat,
        productToSelect.lng
      );

      // Try to center the map multiple times to handle timing issues
      const maxAttempts = 5;
      let attempts = 0;

      const tryToCenter = () => {
        if (mapRef.current && mapRef.current.centerOnLocation) {
          try {
            mapRef.current.centerOnLocation(
              parseFloat(productToSelect.lat),
              parseFloat(productToSelect.lng),
              8
            );
            console.log("Successfully centered map");
          } catch (error) {
            console.error("Error centering map:", error);
          }
        } else {
          attempts++;
          if (attempts < maxAttempts) {
            console.log(
              `Map ref not ready, attempt ${attempts} of ${maxAttempts}`
            );
            setTimeout(tryToCenter, 100);
          } else {
            console.warn("Failed to center map after maximum attempts");
          }
        }
      };

      tryToCenter();
    } else {
      console.warn("Unable to center map - missing coordinates:", {
        lat: productToSelect.lat,
        lng: productToSelect.lng,
      });
    }
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

  // Group products by country for the modal display
  const productsForModal = [...(regularProducts || []), ...(allProducts || [])];

  const groupedByCountry = Array.isArray(productsForModal)
    ? productsForModal.reduce((acc, product) => {
        const country = product.country || "Unknown";
        if (!acc[country]) {
          acc[country] = [];
        }
        // Add a source flag to identify the product type
        const productWithSource = {
          ...product,
          source: product.type === "EPD" ? "EPD" : "Regular",
        };
        acc[country].push(productWithSource);
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
        display: isLoading ? "none" : "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: isMobile ? "5px" : "10px",
        width: "100%",
        position: "fixed",
        top: isMobile ? "70px" : "100px",
        left: 0,
        right: 0,
        zIndex: 999,
        pointerEvents: "auto",
      }}
    >
      <Grid
        container
        sx={{
          display: "flex",
          justifyContent: "center",
          width: isMobile ? "100%" : "70%",
          padding: isMobile ? "0 10px" : 0,
          position: "relative",
          zIndex: 999,
        }}
      >
        <Grid
          xs={isMobile ? 9 : 9}
          container={false}
          sx={{
            marginRight: isMobile ? "5px" : "8px",
            position: "relative",
            zIndex: 999,
          }}
        >
          <TextField
            placeholder={isMobile ? "Search..." : "Search for products"}
            variant="outlined"
            fullWidth
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyPress={handleKeyPress}
            onClick={handleSearchClick}
            sx={{
              borderRadius: "25px",
              transition: "all 0.3s ease",
              position: "relative",
              zIndex: 999,
              "& .MuiOutlinedInput-root": {
                height: isMobile ? "40px" : "45px",
                borderRadius: "25px",
                background: "rgba(251, 251, 251, 0.95)",
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
                ...(isMobile && {
                  "& .MuiOutlinedInput-input": {
                    fontSize: "14px",
                    padding: "8px 14px",
                    caretColor: "#00897B",
                  },
                }),
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <IconButton
                      sx={{
                        padding: isMobile ? "8px" : "4px",
                        color: "#00897B",
                      }}
                    >
                      <HelpOutlineIcon
                        fontSize={isMobile ? "small" : "medium"}
                      />
                    </IconButton>
                    <IconButton
                      onClick={() => setShowResults(true)}
                      sx={{
                        padding: isMobile ? "8px" : "4px",
                        color: "#00897B",
                        "&:active": {
                          transform: "scale(0.95)",
                        },
                      }}
                    >
                      <SearchIcon fontSize={isMobile ? "small" : "medium"} />
                    </IconButton>
                  </Box>
                </InputAdornment>
              ),
            }}
          />

          {/* Search Results Dropdown */}
          {showResults && (
            <Paper
              elevation={3}
              sx={{
                position: "static",
                top: "2%",
                left: 0,
                right: 0,
                zIndex: 1002,
                marginTop: "1px",
                width: "100%",
                borderRadius: isMobile ? "8px" : "12px",
                overflow: "hidden",
                boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
                background: "rgba(255, 255, 255, 0.98)",
                backdropFilter: "blur(10px)",
                maxHeight: isMobile ? "calc(100vh - 200px)" : "400px",
                overflowY: "auto",
                WebkitOverflowScrolling: "touch",
                touchAction: "pan-y",
                position: "relative",
                animation: "fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "@keyframes fadeIn": {
                  "0%": {
                    opacity: 0,
                    transform: isMobile ? "translateY(100%)" : "scale(0.95)",
                  },
                  "100%": {
                    opacity: 1,
                    transform: isMobile ? "translateY(0)" : "scale(1)",
                  },
                },
                "&::-webkit-scrollbar": {
                  width: isMobile ? "4px" : "8px",
                },
                "&::-webkit-scrollbar-track": {
                  background: "#f5f5f5",
                  borderRadius: isMobile ? "4px" : "8px",
                  margin: isMobile ? "4px" : "8px",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "#80CBC4",
                  borderRadius: isMobile ? "4px" : "8px",
                  border: "2px solid #f5f5f5",
                  "&:hover": {
                    background: "#4DB6AC",
                  },
                },
              }}
            >
              <Box p={isMobile ? 1 : 2}>
                {isLoading ? (
                  <Typography
                    color="textSecondary"
                    sx={{
                      py: isMobile ? 1 : 2,
                      textAlign: "center",
                      fontSize: isMobile ? "14px" : "16px",
                    }}
                  >
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
                          padding: isMobile ? "8px" : "16px",
                          "&:hover": {
                            backgroundColor: "#E0F2F1",
                          },
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleProductSelect(product);
                        }}
                        button
                      >
                        <ListItemIcon>
                          <Box
                            component="img"
                            src={
                              product.image_url ||
                              "/public/images/images(map).png"
                            }
                            alt={product.product_name}
                            sx={{
                              width: isMobile ? 32 : 40,
                              height: isMobile ? 32 : 40,
                              borderRadius: isMobile ? "6px" : "8px",
                              objectFit: "cover",
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography
                              variant={isMobile ? "body2" : "subtitle2"}
                              sx={{
                                color: "#00897B",
                                fontWeight: 600,
                                fontSize: isMobile ? "13px" : "inherit",
                              }}
                            >
                              {product.product_name || product.name}
                            </Typography>
                          }
                          secondary={
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#666",
                                fontSize: isMobile ? "11px" : "12px",
                              }}
                            >
                              {product.geo || "Location not specified"}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography
                    color="textSecondary"
                    sx={{
                      py: isMobile ? 1 : 2,
                      textAlign: "center",
                      fontSize: isMobile ? "13px" : "14px",
                    }}
                  >
                    No products found. Try a different search.
                    <br />
                    <span
                      style={{
                        fontSize: isMobile ? "11px" : "12px",
                        marginTop: isMobile ? "4px" : "8px",
                        display: "block",
                      }}
                    >
                      For zehnder products, type a letter that appears after
                      "zehnder-".
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
          container={false}
          xs={isMobile ? 3 : 2}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: isMobile ? "flex-end" : "center",
            paddingRight: isMobile ? "5px" : 0,
          }}
        >
          <Fab
            size={isMobile ? "small" : "medium"}
            aria-label="Icon"
            sx={{
              background: "white",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
              transition: "all 0.3s ease",
              width: isMobile ? "32px" : "40px",
              height: isMobile ? "32px" : "40px",
              minHeight: "unset",
              "&:hover": {
                background: "#E0F2F1",
                boxShadow: "0 6px 16px rgba(0, 0, 0, 0.12)",
                transform: "translateY(-2px)",
              },
            }}
            onClick={handleIconClick}
          >
            {React.cloneElement(icon, {
              sx: {
                color: "#384029",
                fontSize: isMobile ? "18px" : "24px",
              },
            })}
          </Fab>
        </Grid>
      </Grid>

      <Modal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setIcon(<PublicIcon sx={{ color: "#384029" }} />);
        }}
        slotProps={{
          backdrop: {
            onClick: () => {
              setOpenModal(false);
              setIcon(<PublicIcon sx={{ color: "#384029" }} />);
            },
          },
        }}
        BackdropProps={{
          sx: {
            backgroundColor: "rgba(0, 0, 0, 0.3)",
          },
        }}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: isMobile ? "flex-end" : "center",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1003,
          margin: 0,
          WebkitOverflowScrolling: "touch",
          p: isMobile ? 0 : 3,
        }}
      >
        <Box
          onClick={(e) => e.stopPropagation()}
          sx={{
            width: isMobile ? "100%" : "90%",
            maxWidth: isMobile ? "100%" : "1400px",
            maxHeight: isMobile ? "85vh" : "90vh",
            minHeight: isMobile ? "auto" : "50vh",
            bgcolor: "white",
            padding: isMobile ? "16px" : "32px",
            borderRadius: isMobile ? "20px 20px 0 0" : "24px",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.2)",
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            touchAction: "pan-y",
            position: "relative",
            animation: "fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "@keyframes fadeIn": {
              "0%": {
                opacity: 0,
                transform: isMobile ? "translateY(100%)" : "scale(0.95)",
              },
              "100%": {
                opacity: 1,
                transform: isMobile ? "translateY(0)" : "scale(1)",
              },
            },
            "&::-webkit-scrollbar": {
              width: isMobile ? "4px" : "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: "#f5f5f5",
              borderRadius: isMobile ? "4px" : "8px",
              margin: isMobile ? "4px" : "8px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#80CBC4",
              borderRadius: isMobile ? "4px" : "8px",
              border: "2px solid #f5f5f5",
              "&:hover": {
                background: "#4DB6AC",
              },
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: isMobile ? 2 : 4,
              borderBottom: "2px solid #E0F2F1",
              paddingBottom: isMobile ? 2 : 3,
              flexDirection: isMobile ? "column" : "row",
              gap: isMobile ? 2 : 3,
            }}
          >
            <Typography
              variant={isMobile ? "body2" : "h6"}
              sx={{
                color: "#00897B",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: isMobile ? 1 : 2,
                fontSize: isMobile ? "14px" : "1.25rem",
              }}
            >
              <PublicIcon sx={{ fontSize: isMobile ? 18 : 28 }} />
              Products from {countryNames[page - 0] || "All Countries"}
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: isMobile ? 1 : 2,
                backgroundColor: "#E0F2F1",
                padding: isMobile ? "6px 12px" : "12px 24px",
                borderRadius: "12px",
                width: isMobile ? "100%" : "auto",
                justifyContent: isMobile ? "center" : "flex-start",
              }}
            >
              <Typography
                variant={isMobile ? "body2" : "body1"}
                sx={{
                  color: "#00897B",
                  fontWeight: 600,
                  fontSize: isMobile ? "12px" : "1rem",
                }}
              >
                {countryNames.length} Countries
              </Typography>
              <Typography variant="body2" sx={{ color: "#00897B" }}>
                •
              </Typography>
              <Typography
                variant={isMobile ? "body2" : "body1"}
                sx={{
                  color: "#00897B",
                  fontWeight: 600,
                  fontSize: isMobile ? "12px" : "1rem",
                }}
              >
                Page {page} of {countryNames.length}
              </Typography>
            </Box>
          </Box>

          <List
            sx={{
              padding: 0,
              display: "grid",
              gridTemplateColumns: isMobile
                ? "1fr"
                : "repeat(auto-fill, minmax(600px, 1fr))",
              gap: isMobile ? 2 : 3,
              mt: isMobile ? 2 : 4,
            }}
          >
            {productsForCurrentPage.length > 0 ? (
              productsForCurrentPage.map((product, index) => (
                <ListItem
                  key={`Product${index}`}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor:
                      product.source === "EPD" ? "#E8F5E9" : "#ffffff",
                    height: "auto",
                    padding: isMobile ? 2 : 4,
                    borderRadius: isMobile ? "12px" : "20px",
                    border: "1px solid",
                    borderColor:
                      product.source === "EPD" ? "#A5D6A7" : "#E0E0E0",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                    "&:hover": {
                      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
                      transform: "translateY(-4px)",
                      backgroundColor:
                        product.source === "EPD" ? "#C8E6C9" : "#F5F5F5",
                    },
                    "&:active": {
                      transform: isMobile ? "scale(0.98)" : "translateY(-4px)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: isMobile ? "40px" : "80px",
                      height: isMobile ? "40px" : "80px",
                      marginRight: isMobile ? 1.5 : 3,
                      position: "relative",
                      flexShrink: 0,
                    }}
                  >
                    <Box
                      component="img"
                      src={
                        product.image_url || "/public/images/images(map).png"
                      }
                      alt={"No image"}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: isMobile ? "8px" : "16px",
                      }}
                    />
                  </Box>

                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography
                      variant={isMobile ? "body2" : "h6"}
                      sx={{
                        fontWeight: 500,
                        color: "#424242",
                        fontSize: isMobile ? "13px" : "1.1rem",
                        mb: isMobile ? 0.5 : 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {product.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#666",
                        fontSize: isMobile ? "11px" : "0.9rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {product.industry_solution || "No category"}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: isMobile ? "column" : "row",
                      gap: isMobile ? 1 : 2,
                      ml: isMobile ? 1 : 3,
                    }}
                  >
                    {product.source === "EPD" && product.pdf_url && (
                      <IconButton
                        onClick={() => handleDownload(product.pdf_url)}
                        size={isMobile ? "small" : "medium"}
                        sx={{
                          backgroundColor: "#C8E6C9",
                          padding: isMobile ? "6px" : "12px",
                          "&:hover": {
                            backgroundColor: "#A5D6A7",
                            transform: "scale(1.1)",
                          },
                        }}
                      >
                        <DownloadIcon
                          sx={{
                            fontSize: isMobile ? "16px" : "24px",
                            color: "#2E7D32",
                          }}
                        />
                      </IconButton>
                    )}
                    <IconButton
                      size={isMobile ? "small" : "medium"}
                      sx={{
                        backgroundColor: "#E0F2F1",
                        padding: isMobile ? "6px" : "12px",
                        "&:hover": {
                          backgroundColor: "#B2DFDB",
                          transform: "scale(1.1)",
                        },
                      }}
                    >
                      <InfoOutlinedIcon
                        sx={{
                          fontSize: isMobile ? "16px" : "24px",
                          color: "#00897B",
                        }}
                      />
                    </IconButton>
                  </Box>
                </ListItem>
              ))
            ) : (
              <Typography
                variant={isMobile ? "h6" : "h5"}
                sx={{
                  textAlign: "center",
                  py: isMobile ? 6 : 8,
                  color: "#666",
                  gridColumn: "1 / -1",
                  fontSize: isMobile ? "16px" : "24px",
                }}
              >
                No products available for{" "}
                {countryNames[page - 1] || "this country"}.
              </Typography>
            )}
          </List>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              marginTop: isMobile ? 4 : 6,
              borderTop: "2px solid #E0F2F1",
              paddingTop: isMobile ? 2 : 4,
            }}
          >
            <Pagination
              count={countryNames.length}
              page={page}
              onChange={(event, value) => setPage(value)}
              size={isMobile ? "small" : "large"}
              sx={{
                "& .MuiPaginationItem-root": {
                  fontSize: isMobile ? "0.9rem" : "1.1rem",
                  minWidth: isMobile ? "30px" : "40px",
                  height: isMobile ? "30px" : "40px",
                  "&.Mui-selected": {
                    backgroundColor: "#00897B",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "#00796B",
                    },
                  },
                },
              }}
            />
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default SearchBar;
