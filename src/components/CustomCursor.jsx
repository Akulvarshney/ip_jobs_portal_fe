import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import '../styles/resolve-home.css';

const CustomCursor = ({ cursorState }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || window.matchMedia('(pointer: coarse)').matches) return;

    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', updateMousePosition);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible, reducedMotion]);

  if (!isVisible) return null;

  return (
    <motion.div
      className={`resolve-cursor ${cursorState.variant !== 'default' ? 'hover' : ''}`}
      animate={{
        x: mousePosition.x,
        y: mousePosition.y
      }}
      transition={{ type: "spring", stiffness: 400, damping: 28, mass: 0.5 }}
    >
      <span className="resolve-cursor-label">
        {cursorState.label}
      </span>
    </motion.div>
  );
};

export default CustomCursor;
