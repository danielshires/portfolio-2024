import React, { useState, useEffect } from 'react';
import CursorLoading from './CursorLoading';

const LoadingManager: React.FC = () => {
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    // Check if this is the initial page load
    const hasShownLoading = sessionStorage.getItem('hasShownLoading');
    
    if (hasShownLoading) {
      // Skip loading animation for subsequent navigations
      setShowLoading(false);
      return;
    }

    // Mark that we've shown the loading animation
    sessionStorage.setItem('hasShownLoading', 'true');
  }, []);

  const handleLoadingComplete = () => {
    setShowLoading(false);
  };

  if (!showLoading) {
    return null;
  }

  return (
    <CursorLoading 
      onComplete={handleLoadingComplete}
    />
  );
};

export default LoadingManager;