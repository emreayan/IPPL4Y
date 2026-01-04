import React, { useState, useEffect } from 'react';

export const detectPlatform = () => {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isTablet: false,
      isTV: false,
      isDesktop: true,
      isTouch: false,
      platform: 'desktop'
    };
  }

  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) && 
                   !/ipad|tablet/i.test(userAgent);
  const isTablet = /ipad|android(?!.*mobile)|tablet/i.test(userAgent);
  
  // TV detection - multiple methods
  const isTV = 
    /smart-tv|smarttv|googletv|appletv|roku|bravia|netcast|viera|smart-tv|tizen|webos/i.test(userAgent) ||
    window.matchMedia('(pointer: coarse) and (hover: none) and (min-width: 1280px)').matches ||
    (window.matchMedia('(pointer: coarse)').matches && window.innerWidth >= 1920) ||
    document.querySelector('video')?.webkitDisplayingFullscreen;
  
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isDesktop = !isMobile && !isTablet && !isTV;
  
  return {
    isMobile,
    isTablet,
    isTV,
    isDesktop,
    isTouch,
    platform: isTV ? 'tv' : isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop'
  };
};

export const usePlatform = () => {
  const [platform, setPlatform] = useState(() => detectPlatform());
  
  useEffect(() => {
    const handleResize = () => {
      setPlatform(detectPlatform());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return platform;
};

