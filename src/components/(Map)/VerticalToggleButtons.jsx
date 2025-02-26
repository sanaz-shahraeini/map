import * as React from "react";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ShareIcon from "@mui/icons-material/Share";
import SettingsIcon from "@mui/icons-material/Settings";
import HelpIcon from "@mui/icons-material/Help";
import InfoIcon from "@mui/icons-material/Info";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { useMediaQuery } from "@mui/material";

export default function VerticalToggleButtons({
  mapZoom,
  setMapZoom,
  selectedProduct,
  setShowInfoCard,
}) {
  const [view, setView] = React.useState("list");
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleChange = (event, nextView) => {
    setView(nextView);
  };

  const increaseZoom = () => {
    setMapZoom((prevZoom) => prevZoom - 1);
  };

  const decreaseZoom = () => {
    setMapZoom((prevZoom) => prevZoom + 1);
  };

  // Function to share product information
  const handleShareProduct = () => {
    if (typeof window === "undefined") {
      return; // Skip on server-side rendering
    }

    if (selectedProduct) {
      const subject = `Product Information: ${selectedProduct.name}`;
      const body =
        `Hello,\n\nI am sharing the information of the product I viewed:\n\n` +
        `Product Name: ${selectedProduct.name}\n` +
        `Description: ${selectedProduct.description}\n` +
        `Image Link: ${selectedProduct.image_url}\n\n` +
        `Best regards`;

      // Open email link with information
      window.location.href = `mailto:?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;
    } else {
      if (typeof window !== "undefined") {
        alert("No product selected for sharing.");
      }
    }
  };

  const buttons = [
    { value: "add", icon: <AddIcon />, action: increaseZoom },
    { value: "remove", icon: <RemoveIcon />, action: decreaseZoom },
    { value: "share", icon: <ShareIcon />, action: handleShareProduct },
    { value: "info", icon: <InfoIcon />, action: () => setShowInfoCard(true) },
    { value: "settings", icon: <SettingsIcon /> },
    { value: "help", icon: <HelpIcon /> },
  ];

  return (
    <ToggleButtonGroup
      orientation="vertical"
      value={view}
      exclusive
      onChange={handleChange}
      sx={{
        position: "fixed",
        bottom: "20px",
        right: "35px",
        zIndex: 1000,
        borderRadius: "20px",
        background: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
        padding: "8px 4px",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
        },
        "& .MuiToggleButton-root": {
          border: "none",
          padding: "10px",
          margin: "4px 0",
          borderRadius: "50%",
          transition: "all 0.2s ease",
          ...(isMobile && {
            padding: "6px",
            margin: "2px 0",
          }),
          "&:hover": {
            backgroundColor: "#E0F2F1",
            transform: "scale(1.1)",
          },
        },
        ...(isMobile && {
          bottom: "15px",
          right: "15px",
          borderRadius: "15px",
          padding: "6px 3px",
        }),
      }}
    >
      {buttons.map(({ value, icon, action }) => (
        <ToggleButton
          key={value}
          value={value}
          aria-label={value}
          onClick={action}
          sx={{
            ...(isMobile ? { padding: "4px" } : {}),
            "&:hover": {
              backgroundColor: "#E0F2F1",
            },
            "&.Mui-selected": {
              backgroundColor: "#B2DFDB",
              "&:hover": {
                backgroundColor: "#80CBC4",
              },
            },
          }}
        >
          {React.cloneElement(icon, {
            sx: {
              color: "#00897B",
              ...(isMobile && { fontSize: "small" }),
              transition: "all 0.2s ease",
            },
          })}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
