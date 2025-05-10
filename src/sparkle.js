import React, { useState, useEffect, useRef } from 'react';

// Utility helper for random number generation
const random = (min, max) => Math.floor(Math.random() * (max - min)) + min;

// Utility helper for generating a random color
const generateSparkleColor = () => {
  const colors = ['#FFC700', '#FF0055', '#2BD1FC', '#13CA91', '#E9FF70'];
  return colors[Math.floor(Math.random() * colors.length)];
};

// The individual sparkle component
const Sparkle = ({ size, color, style }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      style={style}
    >
      <path
        d="M80 0C80 0 84.2846 41.2925 101.496 58.504C118.707 75.7154 160 80 160 80C160 80 118.707 84.2846 101.496 101.496C84.2846 118.707 80 160 80 160C80 160 75.7154 118.707 58.504 101.496C41.2925 84.2846 0 80 0 80C0 80 41.2925 75.7154 58.504 58.504C75.7154 41.2925 80 0 80 0Z"
        fill={color}
      />
    </svg>
  );
};

// The main Sparkles component that wraps your content
const Sparkles = ({ children, color, count = 5, minSize = 10, maxSize = 20, ...delegated }) => {
  const [sparkles, setSparkles] = useState([]);
  const prefersReducedMotion = useRef(false);
  
  useEffect(() => {
    // Check if user prefers reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion.current = mediaQuery.matches;
    
    // Skip the effect if user prefers reduced motion
    if (prefersReducedMotion.current) return;
    
    // Create a sparkle object
    const createSparkle = () => {
      return {
        id: String(random(10000, 99999)),
        createdAt: Date.now(),
        color: color || generateSparkleColor(),
        size: random(minSize, maxSize),
        style: {
          position: 'absolute',
          top: `${random(0, 100)}%`,
          left: `${random(0, 100)}%`,
          zIndex: 2,
          animation: `sparkle-animation ${random(600, 1200) / 1000}s linear forwards`,
        },
      };
    };
    
    // Initialize sparkles
    const initialSparkles = Array.from({ length: count }, () => createSparkle());
    setSparkles(initialSparkles);
    
    // Set up intervals to randomly remove and add sparkles
    const sparkleInterval = setInterval(() => {
      const now = Date.now();
      
      // Filter out expired sparkles and add a new one
      setSparkles(sparkles => {
        const remaining = sparkles.filter(
          sparkle => now - sparkle.createdAt < 1000
        );
        
        return [...remaining, createSparkle()];
      });
    }, 500);
    
    return () => clearInterval(sparkleInterval);
  }, [color, count, minSize, maxSize]);
  
  return (
    <span
      style={{
        display: 'inline-block',
        position: 'relative',
      }}
      {...delegated}
    >
      {sparkles.map(sparkle => (
        <Sparkle
          key={sparkle.id}
          color={sparkle.color}
          size={sparkle.size}
          style={sparkle.style}
        />
      ))}
      <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
      
      <style>{`
        @keyframes sparkle-animation {
          0% {
            transform: scale(0) rotate(0deg);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: scale(1) rotate(180deg);
            opacity: 0;
          }
        }
      `}</style>
    </span>
  );
};

// Export the Sparkles component as the default export
export default Sparkles;