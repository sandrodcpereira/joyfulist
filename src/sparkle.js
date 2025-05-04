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

    // Create an array of random sparkle objects
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
      
      {/* Add the necessary CSS for sparkle animation */}
      <style jsx>{`
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

// Example usage component (uncomment to use)
/*
function SparkleDemo() {
  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Sparkle Effect Demo</h1>
      
      <div className="mb-8">
        <Sparkles>
          <span className="text-2xl font-bold text-purple-600">
            ✨ This text has sparkles! ✨
          </span>
        </Sparkles>
      </div>
      
      <div className="mb-8">
        <Sparkles color="#FF5722" count={8} minSize={15} maxSize={25}>
          <span className="text-xl font-bold bg-orange-100 p-4 rounded-lg">
            Custom orange sparkles
          </span>
        </Sparkles>
      </div>
      
      <div className="p-6 bg-white rounded-lg shadow-md">
        <p className="mb-4">
          You can wrap <Sparkles><span className="font-bold">any element</span></Sparkles> with sparkles!
        </p>
        
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
          <Sparkles count={3}>
            Sparkly Button
          </Sparkles>
        </button>
      </div>
    </div>
  );
}
*/

// Export the Sparkles component as the default export
export default Sparkles;