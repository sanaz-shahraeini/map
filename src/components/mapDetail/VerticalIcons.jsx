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
} from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";
import PersonIcon from "@mui/icons-material/Person";
import MenuIcon from "@mui/icons-material/Menu";
import { useProducts } from "../../useContexts/ProductsContext";
import { styled } from "@mui/material/styles";

const StyledCircleIcon = styled(CircleIcon)(({ selected }) => ({
  fontSize: "12px",
  transition: "all 0.3s ease",
  color: selected ? "#00897B" : "#B2DFDB",
  "&:hover": {
    color: "#00897B",
    transform: "scale(1.2)",
  },
}));

const CategoryButton = styled(Box)(({ selected }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "12px 8px",
  cursor: "pointer",
  position: "relative",
  transition: "all 0.3s ease",
  borderRadius: "12px",
  backgroundColor: selected ? "rgba(0, 137, 123, 0.08)" : "transparent",
  "&:hover": {
    backgroundColor: "rgba(0, 137, 123, 0.08)",
    transform: "translateY(-2px)",
    "& .category-label": {
      opacity: 1,
      transform: "translateY(0)",
    },
  },
  "&::after": {
    content: '""',
    position: "absolute",
    left: 0,
    width: "3px",
    height: selected ? "70%" : "0%",
    backgroundColor: "#00897B",
    borderRadius: "0 4px 4px 0",
    transition: "height 0.3s ease",
  },
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

  const findTopCategories = useCallback((categories) => {
    const frequencyMap = {};
    categories.forEach((category) => {
      frequencyMap[category] = (frequencyMap[category] || 0) + 1;
    });
    return Object.entries(frequencyMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4)
      .map(([category]) => category);
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

  const SidebarContent = () => (
    <Box
      sx={{
        width: "80px",
        height: "100vh",
        backgroundColor: "#ffffff",
        boxShadow: "4px 0 12px rgba(0, 0, 0, 0.05)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 3,
        position: "relative",
      }}
    >
      <Tooltip
        title="Profile"
        placement="right"
        TransitionComponent={Zoom}
        arrow
      >
        <IconButton
          sx={{
            width: "45px",
            height: "45px",
            backgroundColor: "#00897B",
            mb: 4,
            transition: "all 0.3s ease",
            "&:hover": {
              backgroundColor: "#00796B",
              transform: "scale(1.1)",
            },
          }}
        >
          <PersonIcon sx={{ color: "#ffffff", fontSize: "24px" }} />
        </IconButton>
      </Tooltip>

      <List sx={{ width: "100%", p: 0 }}>
        <Tooltip
          title="Show All Products"
          placement="right"
          TransitionComponent={Zoom}
          arrow
        >
          <CategoryButton
            selected={selectedCategory === "all"}
            onClick={() => handleCategoryClick("all")}
          >
            <StyledCircleIcon selected={selectedCategory === "all"} />
            <Typography
              className="category-label"
              variant="caption"
              sx={{
                mt: 1,
                color: selectedCategory === "all" ? "#00897B" : "#666666",
                fontWeight: selectedCategory === "all" ? 600 : 400,
                fontSize: "11px",
              }}
            >
              All
            </Typography>
          </CategoryButton>
        </Tooltip>

        {topCategories.map((category) => (
          <Tooltip
            key={category}
            title={category}
            placement="right"
            TransitionComponent={Zoom}
            arrow
          >
            <CategoryButton
              selected={selectedCategory === category}
              onClick={() => handleCategoryClick(category)}
            >
              <StyledCircleIcon selected={selectedCategory === category} />
              <Typography
                className="category-label"
                variant="caption"
                sx={{
                  mt: 1,
                  color: selectedCategory === category ? "#00897B" : "#666666",
                  fontWeight: selectedCategory === category ? 600 : 400,
                  fontSize: "11px",
                  maxWidth: "90%",
                  textAlign: "center",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {category}
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
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              zIndex: 1200,
              "&:hover": {
                backgroundColor: "#ffffff",
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
