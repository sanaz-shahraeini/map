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
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import MenuIcon from "@mui/icons-material/Menu";
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import CategoryIcon from '@mui/icons-material/Category';
import StarIcon from '@mui/icons-material/Star';
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

  // Get icon for category
  const getCategoryIcon = (name, selected) => {
    if (name === "all") {
      return <ViewInArIcon fontSize="small" />;
    }
    
    // Choose different icons for different categories
    const iconIndex = topCategories.findIndex(cat => cat.name === name);
    
    switch (iconIndex % 3) {
      case 0:
        return <CategoryIcon fontSize="small" />;
      case 1:
        return <StarIcon fontSize="small" />;
      default:
        return <ViewInArIcon fontSize="small" />;
    }
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
          mb: 5, 
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
            <StyledCategoryIcon selected={selectedCategory === "all"} className="category-icon">
              {getCategoryIcon("all", selectedCategory === "all")}
            </StyledCategoryIcon>
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
                <StyledCategoryIcon selected={selectedCategory === category.name} className="category-icon">
                  {getCategoryIcon(category.name, selectedCategory === category.name)}
                </StyledCategoryIcon>
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
