"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import { useProducts } from "./ProductsContext";

const SearchContext = createContext();

export function SearchProvider({ children }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { regularProducts, allProducts } = useProducts();

  // Filter products when searchQuery or regularProducts change
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const lowerCaseQuery = searchQuery.toLowerCase().trim();
    setIsLoading(true);

    // Log the search query for debugging
    console.log('Searching for:', lowerCaseQuery);
    console.log('Available products count:', regularProducts.length);

    // Filter products based on search query, only from the products API
    const filtered = regularProducts.filter((product) => {
      // Get product name, ensuring it exists
      const productName = (product.product_name || product.name || "").toLowerCase();
      
      // For zehnder products, extract the part after "zehnder-"
      if (productName.includes("zehnder-")) {
        const zehnderIndex = productName.indexOf("zehnder-") + 8;
        
        // Check if there's any content after "zehnder-"
        if (zehnderIndex < productName.length) {
          const afterPrefix = productName.substring(zehnderIndex);
          
          // Check if the first character of the part after "zehnder-" matches the first character of the query
          if (lowerCaseQuery.length > 0 && afterPrefix.length > 0) {
            return afterPrefix.charAt(0) === lowerCaseQuery.charAt(0);
          }
        }
        return false;
      }
      
      // For non-zehnder products, check if the first character matches the query's first character
      if (productName.length > 0 && lowerCaseQuery.length > 0) {
        return productName.charAt(0) === lowerCaseQuery.charAt(0);
      }
      
      return false;
    });

    console.log('Filtered results count:', filtered.length);
    
    // Enhance search results with coordinates from allProducts
    const enhancedResults = filtered.map(product => {
      // Try to find this product in allProducts which has coordinates
      const productWithCoords = allProducts.find(p => 
        (p.id === product.id) || 
        (p.product_name === product.product_name) ||
        (p.name === product.name)
      );
      
      // If found, merge the properties
      if (productWithCoords) {
        return {
          ...product,
          lat: productWithCoords.lat,
          lng: productWithCoords.lng,
          geo: productWithCoords.geo,
          geoMapped: productWithCoords.geoMapped,
          country: productWithCoords.country
        };
      }
      
      return product;
    });
    
    // Log results with coordinates for debugging
    const withCoords = enhancedResults.filter(p => p.lat && p.lng);
    console.log(`Search results with coordinates: ${withCoords.length}/${enhancedResults.length}`);
    
    setSearchResults(enhancedResults);
    setIsLoading(false);
  }, [searchQuery, regularProducts, allProducts]);

  const value = {
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    isLoading,
    setIsLoading,
  };

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
}
