import React from 'react';
import { motion } from 'framer-motion';
import logo from '../assets/logo.png';
import '../styles/resolve-home.css';

const FullscreenLoader = () => {
  return (
    <motion.div 
      className="resolve-fullscreen-loader"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        animate={{ scale: [0.95, 1, 0.95], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <img src={logo} alt="Resolve" className="resolve-loader-logo" />
      </motion.div>
    </motion.div>
  );
};

export default FullscreenLoader;
