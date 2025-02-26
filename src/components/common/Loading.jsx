"use client";

import React from 'react';

const Loading = ({ fullScreen = false, message = 'Loading data...' }) => {
  const containerStyle = fullScreen ? {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(5px)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000,
  } : {
    position: 'fixed', 
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(5px)',
    zIndex: 9999, 
  };

  return (
    <div style={containerStyle}>
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
      <p className="loading-message">{message}</p>
      <style jsx>{`
        .spinner-container {
          margin-bottom: 1rem;
        }
        .spinner {
          width: 50px;
          height: 50px;
          border: 5px solid rgba(38, 166, 154, 0.3); /* Teal color to match the map markers */
          border-radius: 50%;
          border-top-color: #26A69A;
          animation: spin 1s ease-in-out infinite;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .loading-message {
          font-size: 1.1rem;
          color: #00695C;
          font-weight: 500;
          margin: 1rem 0 0;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default Loading;
