import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  IconButton,
  Drawer,
  List,
  useMediaQuery,
  useTheme,
  Tooltip,
  Zoom,
  Badge,
  Avatar,
  Chip,
  Divider
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import MenuIcon from "@mui/icons-material/Menu";
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import CategoryIcon from '@mui/icons-material/Category';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import DescriptionIcon from '@mui/icons-material/Description';
import SearchIcon from '@mui/icons-material/Search';
import { useProducts } from "../../useContexts/ProductsContext";
import { useSearch } from "../../useContexts/SearchContext";
import { styled } from "@mui/material/styles";

// Modern styled category indicator
const CategoryIndicator = styled(Box)(({ selected }) => ({
  width: '4px',
  height: selected ? '28px' : '0',
  backgroundColor: '#00897B',
  borderRadius: '0 3px 3px 0',
  position: 'absolute',
  left: 0,
  transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
}));

// Styled category icon - smaller and lighter when selected
const StyledCategoryIcon = styled(Box)(({ selected }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '32px',
  height: '32px',
  borderRadius: '8px',
  backgroundColor: selected ? 'rgba(0, 137, 123, 0.12)' : 'rgba(178, 223, 219, 0.08)',
  color: selected ? '#4DB6AC' : '#26A69A',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  transform: selected ? 'scale(0.95)' : 'scale(1)',
  boxShadow: selected ? '0 1px 3px rgba(0, 137, 123, 0.1)' : 'none',
  '& .MuiSvgIcon-root': {
    fontSize: '18px',
  }
}));

// Enhanced styled category button with glass morphism
const CategoryButton = styled(Box)(({ selected }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 5px",
  margin: "6px 0",
  cursor: "pointer",
  position: "relative",
  transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
  borderRadius: "12px",
  backgroundColor: selected ? "rgba(0, 137, 123, 0.08)" : "transparent",
  backdropFilter: selected ? "blur(8px)" : "none",
  boxShadow: selected ? "0 2px 8px rgba(0, 137, 123, 0.08)" : "none",
  width: "52px",
  height: "58px",
  "&:hover": {
    backgroundColor: "rgba(0, 137, 123, 0.05)",
    transform: "translateY(-1px)",
    boxShadow: "0 4px 12px rgba(0, 137, 123, 0.08)",
    "& .category-icon": {
      transform: "scale(1.05)",
    },
    "& .category-label": {
      opacity: 1,
      transform: "translateY(0)",
    },
  },
}));

const VerticalIcons = ({
  toggleSidebar,
  setSelectedCategory,
  selectedCategory = "all",
  setCategories,
  categories,
  setSelectedSidebar,
  setFilterEpdOnly,
  filterEpdOnly
}) => {
  const { loading, error, allProducts } = useProducts();
  const { setSearchQuery } = useSearch();
  const [errorState, setErrorState] = useState("");
  const [topCategories, setTopCategories] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [totalProducts, setTotalProducts] = useState(0);

  const findTopCategories = useCallback((categories) => {
    const frequencyMap = {};
    categories.forEach((category) => {
      frequencyMap[category] = (frequencyMap[category] || 0) + 1;
    });
    return Object.entries(frequencyMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4)
      .map(([category, count]) => ({ name: category, count }));
  }, []);

  useEffect(() => {
    if (!loading && !error) {
      try {
        const allCategories = Array.from(
          new Set(
            allProducts?.flatMap((item) =>
              (item.category_name || item.classific || "Uncategorized")
                .split(" / ")
                .map((category) => category.trim())
            ) || []
          )
        );
        setCategories([...allCategories]);
        setTotalProducts(allProducts?.length || 0);
      } catch (e) {
        console.error("Error processing categories:", e);
        setErrorState("Error processing categories");
      }
    }
  }, [loading, error, allProducts, setCategories]);

  useEffect(() => {
    if (categories.length > 0) {
      const topCategories = findTopCategories(categories);
      setTopCategories(topCategories);
    }
  }, [categories, findTopCategories]);

  const handleCategoryClick = (label) => {
    setSelectedCategory(label);
    if (isMobile) {
      handleDrawerToggle();
    }
    // Force sidebar to show Products view when category is selected
    setSelectedSidebar("Products");
    // Always open sidebar when category is clicked
    toggleSidebar();
    
    // Clear the search query when a category is selected
    setSearchQuery("");
    
    // If user clicks on a category, make sure EPD filter is turned off
    // to show all markers from both APIs
    setFilterEpdOnly(false);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Get first letter of category name for the avatar
  const getCategoryInitial = (name) => {
    if (name === "all") return "A";
    return name.charAt(0).toUpperCase();
  };

  // Get color based on category name (consistent coloring)
  const getCategoryColor = (name) => {
    if (name === "all") return "#00796B";
    
    // Generate consistent colors based on string hashing
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      "#00796B", // teal 700
      "#00897B", // teal 600
      "#009688", // teal 500
      "#00897B", // teal 600
      "#00796B", // teal 700
      "#00695C", // teal 800
      "#00796B", // teal 700
      "#00897B", // teal 600
    ];
    
    return colors[hash % colors.length];
  };

  const SidebarContent = () => (
    <Box
      sx={{
        width: { xs: "70px", sm: "100px" },
        height: "100vh",
        backgroundColor: "#ffffff",
        boxShadow: "0 0 20px rgba(0, 0, 0, 0.07)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 3,
        position: "relative",
        borderRight: "1px solid rgba(0, 0, 0, 0.06)",
        overflowY: "auto",
        overflowX: "hidden",
        "&::-webkit-scrollbar": {
          width: "4px",
        },
        "&::-webkit-scrollbar-track": {
          background: "transparent",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "rgba(0, 137, 123, 0.2)",
          borderRadius: "4px",
        },
        "&::-webkit-scrollbar-thumb:hover": {
          background: "rgba(0, 137, 123, 0.4)",
        },
      }}
    >
      {/* Logo/Profile area at top */}
      <Box 
        sx={{ 
          mb: 3, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          position: 'relative'
        }}
      >
        <Tooltip
          title="Profile"
          placement="right"
          TransitionComponent={Zoom}
          arrow
        >
          <Avatar
            sx={{
              width: "48px",
              height: "48px",
              backgroundColor: "#00897B",
              cursor: 'pointer',
              transition: "all 0.3s ease",
              boxShadow: "0 4px 12px rgba(0, 137, 123, 0.25)",
              "&:hover": {
                transform: "scale(1.05)",
                boxShadow: "0 6px 16px rgba(0, 137, 123, 0.3)",
              },
            }}
          >
            <PersonIcon sx={{ color: "#ffffff", fontSize: "24px" }} />
          </Avatar>
        </Tooltip>
        
        {/* App name/brand below avatar */}
        <Typography 
          variant="subtitle2" 
          sx={{ 
            mt: 1.5, 
            fontSize: '11px', 
            color: '#00897B',
            fontWeight: 600,
            letterSpacing: '0.5px'
          }}
        >
          USER
        </Typography>
      </Box>

      {/* Category section */}
      <Box sx={{ 
        width: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1
      }}>
        {/* "Categories" Label */}
        <Typography
          variant="caption"
          sx={{
            color: '#00796B',
            fontWeight: 600,
            fontSize: { xs: '10px', sm: '11px' },
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            textAlign: 'center',
            display: 'block',
            mb: 1
          }}
        >
          Categories
        </Typography>

        <List sx={{ 
          width: "100%", 
          p: 0, 
          mt: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Tooltip
            title="All Categories"
            placement="right"
            TransitionComponent={Zoom}
            arrow
          >
            <CategoryButton
              selected={selectedCategory === "all"}
              onClick={() => {
                handleCategoryClick("all");
                // Ensure both API markers are shown when clicking All
                setFilterEpdOnly(false);
              }}
            >
              <CategoryIndicator selected={selectedCategory === "all"} />
              <StyledCategoryIcon selected={selectedCategory === "all"}>
                <AllInclusiveIcon fontSize="small" />
              </StyledCategoryIcon>
              <Typography
                className="category-label"
                variant="caption"
                sx={{
                  mt: 0.5,
                  color: selectedCategory === "all" ? "#00796B" : "#26A69A",
                  fontWeight: selectedCategory === "all" ? 600 : 500,
                  fontSize: { xs: "9px", sm: "10px" },
                }}
              >
                All
              </Typography>
            </CategoryButton>
          </Tooltip>

          {topCategories.map((category) => (
            <Tooltip
              key={category.name}
              title={`${category.name} (${category.count})`}
              placement="right"
              TransitionComponent={Zoom}
              arrow
            >
              <CategoryButton
                selected={selectedCategory === category.name}
                onClick={() => handleCategoryClick(category.name)}
              >
                <CategoryIndicator selected={selectedCategory === category.name} />
                <Badge
                  badgeContent={category.count}
                  color="primary"
                  sx={{ 
                    '& .MuiBadge-badge': {
                      backgroundColor: '#00897B',
                      fontSize: '8px',
                      minWidth: '14px',
                      height: '14px',
                      top: -2,
                      right: -2,
                    }
                  }}
                >
                  <StyledCategoryIcon 
                    selected={selectedCategory === category.name}
                    sx={{
                      background: selectedCategory === category.name 
                        ? 'rgba(0, 137, 123, 0.12)' 
                        : 'rgba(178, 223, 219, 0.08)',
                      color: selectedCategory === category.name ? '#4DB6AC' : getCategoryColor(category.name),
                    }}
                  >
                    {getCategoryInitial(category.name)}
                  </StyledCategoryIcon>
                </Badge>
                <Typography
                  className="category-label"
                  variant="caption"
                  sx={{
                    mt: 0.5,
                    color: selectedCategory === category.name ? "#00796B" : "#26A69A",
                    fontWeight: selectedCategory === category.name ? 600 : 500,
                    fontSize: { xs: "9px", sm: "10px" },
                    maxWidth: "90%",
                    textAlign: "center",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {category.name.length > 8 ? `${category.name.substring(0, 7)}...` : category.name}
                </Typography>
              </CategoryButton>
            </Tooltip>
          ))}
        </List>
      </Box>

      {errorState && (
        <Typography
          color="error"
          sx={{ position: "absolute", bottom: 16, fontSize: "12px" }}
        >
          {errorState}
        </Typography>
      )}

      {/* EPD Explorer button at the bottom */}
      <Box sx={{ 
        mt: 'auto', 
        mb: { xs: 4, sm: 6 }, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        width: '100%',
        pt: 2
      }}>
        <Divider sx={{ width: '80%', mb: 2 }} />
        <Typography
          variant="caption"
          sx={{
            color: '#00796B',
            fontWeight: 600,
            fontSize: { xs: '10px', sm: '11px' },
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            textAlign: 'center',
            display: 'block',
            mb: 1
          }}
        >
          Explorer
        </Typography>
        <Tooltip
          title="EPD Explorer - Show Environmental Product Declarations"
          placement="right"
          TransitionComponent={Zoom}
          arrow
        >
          <CategoryButton
            selected={filterEpdOnly}
            onClick={() => {
              // Toggle EPD filter
              setFilterEpdOnly(!filterEpdOnly);
              // Reset search and category when toggling EPD mode
              setSearchQuery("");
              setSelectedCategory("all");
              toggleSidebar();
              setSelectedSidebar("Products");
            }}
            sx={{
              background: filterEpdOnly ? 'linear-gradient(135deg, rgba(0, 121, 107, 0.08), rgba(0, 150, 136, 0.05))' : 'transparent',
              border: filterEpdOnly ? '1px solid rgba(0, 137, 123, 0.08)' : 'none',
            }}
          >
            <CategoryIndicator selected={filterEpdOnly} />
            <StyledCategoryIcon 
              selected={filterEpdOnly}
              sx={{
                background: filterEpdOnly ? 'rgba(0, 137, 123, 0.12)' : 'rgba(178, 223, 219, 0.08)',
                color: filterEpdOnly ? '#4DB6AC' : '#26A69A',
              }}
            >
              <SearchIcon fontSize="small" />
            </StyledCategoryIcon>
            <Typography
              className="category-label"
              variant="caption"
              sx={{
                mt: 0.5,
                color: filterEpdOnly ? "#00796B" : "#26A69A",
                fontWeight: filterEpdOnly ? 600 : 500,
                fontSize: { xs: "9px", sm: "10px" },
              }}
            >
              EPD
            </Typography>
          </CategoryButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile menu button - only visible on small screens */}
      <IconButton
        onClick={handleDrawerToggle}
        sx={{
          display: { xs: "flex", sm: "none" },
          position: "fixed",
          top: "10px",
          left: "10px",
          zIndex: 1000,
          backgroundColor: "white",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          "&:hover": {
            backgroundColor: "white",
          },
        }}
      >
        <MenuIcon />
      </IconButton>

      {/* Drawer for mobile view */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            width: "70px",
            boxSizing: "border-box",
          },
        }}
      >
        <SidebarContent />
      </Drawer>

      {/* Permanent sidebar for desktop view */}
      <Box
        sx={{
          display: { xs: "none", sm: "block" },
          height: "100%",
        }}
      >
        <SidebarContent />
      </Box>
    </>
  );
};

export default VerticalIcons;
