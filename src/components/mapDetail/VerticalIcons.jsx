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
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import MenuIcon from "@mui/icons-material/Menu";
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import CategoryIcon from '@mui/icons-material/Category';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { useProducts } from "../../useContexts/ProductsContext";
import { styled } from "@mui/material/styles";

// Modern styled category indicator
const CategoryIndicator = styled(Box)(({ selected }) => ({
  width: '6px',
  height: selected ? '28px' : '0',
  backgroundColor: '#00897B',
  borderRadius: '0 3px 3px 0',
  position: 'absolute',
  left: 0,
  transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
}));

// Enhanced styled category button with glass morphism
const CategoryButton = styled(Box)(({ selected }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "12px 6px",
  margin: "8px 0",
  cursor: "pointer",
  position: "relative",
  transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
  borderRadius: "14px",
  backgroundColor: selected ? "rgba(0, 137, 123, 0.12)" : "transparent",
  backdropFilter: selected ? "blur(8px)" : "none",
  boxShadow: selected ? "0 4px 12px rgba(0, 137, 123, 0.08)" : "none",
  width: "54px",
  height: "60px",
  "&:hover": {
    backgroundColor: "rgba(0, 137, 123, 0.08)",
    transform: "translateY(-2px)",
    boxShadow: "0 6px 16px rgba(0, 137, 123, 0.1)",
    "& .category-icon": {
      transform: "scale(1.1)",
    },
    "& .category-label": {
      opacity: 1,
      transform: "translateY(0)",
    },
  },
}));

// Styled category icon
const StyledCategoryIcon = styled(Box)(({ selected }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '32px',
  height: '32px',
  borderRadius: '10px',
  backgroundColor: selected ? 'rgba(0, 137, 123, 0.15)' : 'rgba(178, 223, 219, 0.15)',
  color: selected ? '#00897B' : '#80CBC4',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
}));

const VerticalIcons = ({
  toggleSidebar,
  setSelectedCategory,
  selectedCategory = "all",
  setCategories,
  categories,
  setSelectedSidebar,
}) => {
  const { loading, error, allProducts } = useProducts();
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
    if (name === "all") return "#00897B";
    
    // Generate consistent colors based on string hashing
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      "#00897B", // teal
      "#3949AB", // indigo
      "#D81B60", // pink
      "#8E24AA", // purple
      "#F57C00", // orange
      "#5D4037", // brown
      "#546E7A", // blue grey
      "#607D8B", // blue grey
    ];
    
    return colors[hash % colors.length];
  };

  const SidebarContent = () => (
    <Box
      sx={{
        width: "80px",
        height: "100vh",
        backgroundColor: "#ffffff",
        boxShadow: "0 0 20px rgba(0, 0, 0, 0.07)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 3,
        position: "relative",
        borderRight: "1px solid rgba(0, 0, 0, 0.06)",
      }}
    >
      {/* Logo/Profile area at top */}
      <Box 
        sx={{ 
          mb: 2, 
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

      {/* "Categories" Label */}
      <Chip
        label="Categories"
        size="small"
        sx={{
          fontSize: '10px',
          fontWeight: 600,
          backgroundColor: 'rgba(0, 137, 123, 0.08)',
          color: '#00897B',
          mb: 2,
          height: '22px',
          '& .MuiChip-label': {
            px: 1
          }
        }}
      />

      <List sx={{ width: "100%", p: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Tooltip
          title={`All Products (${totalProducts})`}
          placement="right"
          TransitionComponent={Zoom}
          arrow
        >
          <CategoryButton
            selected={selectedCategory === "all"}
            onClick={() => handleCategoryClick("all")}
          >
            <CategoryIndicator selected={selectedCategory === "all"} />
            <Badge
              badgeContent={totalProducts}
              color="primary"
              sx={{ 
                '& .MuiBadge-badge': {
                  backgroundColor: '#00897B',
                  fontSize: '9px',
                  minWidth: '16px',
                  height: '16px',
                  top: -2,
                  right: -2,
                }
              }}
            >
              <Avatar
                sx={{
                  width: '30px',
                  height: '30px',
                  fontSize: '12px',
                  backgroundColor: selectedCategory === "all" ? '#00897B' : 'rgba(0, 137, 123, 0.12)',
                  color: selectedCategory === "all" ? '#fff' : '#00897B',
                  transition: "all 0.3s ease",
                }}
              >
                <AllInclusiveIcon fontSize="small" />
              </Avatar>
            </Badge>
            <Typography
              className="category-label"
              variant="caption"
              sx={{
                mt: 1,
                color: selectedCategory === "all" ? "#00897B" : "#607D8B",
                fontWeight: selectedCategory === "all" ? 600 : 500,
                fontSize: "11px",
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
                    fontSize: '9px',
                    minWidth: '16px',
                    height: '16px',
                    top: -2,
                    right: -2,
                  }
                }}
              >
                <Avatar
                  sx={{
                    width: '30px',
                    height: '30px',
                    fontSize: '12px',
                    backgroundColor: selectedCategory === category.name ? getCategoryColor(category.name) : `${getCategoryColor(category.name)}22`, // 22 is hex for 13% opacity
                    color: selectedCategory === category.name ? '#fff' : getCategoryColor(category.name),
                    transition: "all 0.3s ease",
                  }}
                >
                  {getCategoryInitial(category.name)}
                </Avatar>
              </Badge>
              <Typography
                className="category-label"
                variant="caption"
                sx={{
                  mt: 1,
                  color: selectedCategory === category.name ? "#00897B" : "#607D8B",
                  fontWeight: selectedCategory === category.name ? 600 : 500,
                  fontSize: "11px",
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

      {errorState && (
        <Typography
          color="error"
          sx={{ position: "absolute", bottom: 16, fontSize: "12px" }}
        >
          {errorState}
        </Typography>
      )}
    </Box>
  );

  return (
    <>
      {isMobile ? (
        <>
          <IconButton
            onClick={handleDrawerToggle}
            sx={{
              position: "fixed",
              top: 20,
              left: 20,
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              boxShadow: "0 2px 12px rgba(0, 0, 0, 0.15)",
              zIndex: 1200,
              width: '42px',
              height: '42px',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              "&:hover": {
                backgroundColor: "#ffffff",
                transform: 'scale(1.05)'
              },
            }}
          >
            <MenuIcon sx={{ color: "#00897B" }} />
          </IconButton>
          <Drawer
            variant="temporary"
            anchor="left"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              "& .MuiDrawer-paper": {
                width: "80px",
                backgroundColor: "transparent",
                border: "none",
              },
            }}
          >
            <SidebarContent />
          </Drawer>
        </>
      ) : (
        <SidebarContent />
      )}
    </>
  );
};

export default VerticalIcons;
