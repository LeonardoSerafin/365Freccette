import React from 'react';
import { COLORS } from '../utils/constants';

export const DarkModeToggle = ({ darkMode, toggleDarkMode }) => {
  const colors = darkMode ? COLORS.dark : COLORS.light;
  
  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-lg transition-colors"
      style={{ 
        backgroundColor: colors.button,
        color: colors.text
      }}
      title={darkMode ? 'Modalità chiara' : 'Modalità scura'}
    >
      {darkMode ? '☀️' : '🌙'}
    </button>
  );
};