"use client";

import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  IconButton, 
  useMediaQuery, 
  useTheme, 
  Avatar, 
  Tooltip,
  Button,
  FormControl,
  Select,
  MenuItem
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import SearchIcon from '@mui/icons-material/Search';
import { useProducts } from '../../useContexts/ProductsContext';

const Header = () => {
  const { loading } = useProducts();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  
  const handleLanguageChange = (event) => {
    setSelectedLanguage(event.target.value);
  };
  
  return (
    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        color: '#424242',
        zIndex: 1100,
        height: '64px',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: '64px' }}>
        {/* Left side - Logo/Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600, 
              color: '#00897B', 
              letterSpacing: '0.5px',
              mr: 1,
              display: 'flex',
              alignItems: 'center' 
            }}
          >
            <Box 
              component="span" 
              sx={{ 
                width: 38, 
                height: 28, 
                backgroundColor: '#00897B', 
                borderRadius: '8px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mr: 1.5,
                boxShadow: '0 2px 8px rgba(0, 137, 123, 0.25)'
              }}
            >
              <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '14px' }}>EPD</Typography>
            </Box>
            {!isMobile && 'Map Platform'}
          </Typography>
          
          {!isMobile && (
            <Box sx={{ ml: 2, display: 'flex' }}>
              <Button 
                size="small" 
                sx={{ 
                  color: '#00897B',
                  fontWeight: 500,
                  mx: 0.5,
                  fontSize: '0.875rem',
                  '&:hover': { backgroundColor: 'rgba(0, 137, 123, 0.08)' }
                }}
              >
                Map
              </Button>
              <Button 
                size="small" 
                sx={{ 
                  color: '#757575',
                  fontWeight: 500,
                  mx: 0.5,
                  fontSize: '0.875rem',
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.05)' }
                }}
              >
                Construction Products
              </Button>
              <Button 
                size="small" 
                sx={{ 
                  color: '#757575',
                  fontWeight: 500,
                  mx: 0.5,
                  fontSize: '0.875rem',
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.05)' }
                }}
              >
               Building Products
              </Button>
              <Button 
                size="small" 
                sx={{ 
                  color: '#757575',
                  fontWeight: 500,
                  mx: 0.5,
                  fontSize: '0.875rem',
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.05)' }
                }}
              >
               Elecronical Products
              </Button>
            </Box>
          )}
        </Box>
        
        {/* Right side - Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {!loading && (
            <Box sx={{ position: 'relative', mr: 1 }}>
              <IconButton 
                size="small"
                sx={{
                  backgroundColor: 'rgba(0, 0, 0, 0.03)',
                  mr: 1,
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.08)' }
                }}
              >
                <SearchIcon fontSize="small" sx={{ color: '#616161' }} />
              </IconButton>
            </Box>
          )}
          
          <Tooltip title="Help">
            <IconButton 
              size="small"
              sx={{
                backgroundColor: 'rgba(0, 0, 0, 0.03)',
                mr: 1,
                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.08)' }
              }}
            >
              <HelpOutlineIcon fontSize="small" sx={{ color: '#616161' }} />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Notifications">
            <IconButton 
              size="small"
              sx={{
                backgroundColor: 'rgba(0, 0, 0, 0.03)',
                mr: 2,
                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.08)' }
              }}
            >
              <NotificationsNoneIcon fontSize="small" sx={{ color: '#616161' }} />
            </IconButton>
          </Tooltip>
          
          <FormControl sx={{ mr: 2 }}>
            <Select
              value={selectedLanguage}
              onChange={handleLanguageChange}
              displayEmpty
              variant="outlined"
              size="small"
              sx={{
                height: 36,
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#616161',
                backgroundColor: 'rgba(0, 0, 0, 0.03)',
                borderRadius: '8px',
                '& .MuiOutlinedInput-notchedOutline': { 
                  border: 'none' 
                },
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.08)'
                },
                '& .MuiSelect-icon': {
                  color: '#616161'
                }
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    borderRadius: 2,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    mt: 0.5
                  }
                }
              }}
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="de">Deutsch</MenuItem>
              <MenuItem value="fr">Français</MenuItem>
              <MenuItem value="es">Español</MenuItem>
            </Select>
          </FormControl>
          
          <Avatar 
            sx={{ 
              width: 36, 
              height: 36, 
              backgroundColor: '#00897B',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                transform: 'scale(1.05)'
              }
            }}
          >
            U
          </Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
