import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      id="theme-toggle-btn"
      className="relative p-2 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600 transition-all duration-200"
      aria-label="Toggle theme"
    >
      <motion.div
        key={theme}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {theme === 'dark' ? (
          <Sun className="w-5 h-5 text-amber-400" />
        ) : (
          <Moon className="w-5 h-5" />
        )}
      </motion.div>
    </button>
  );
};

export default ThemeToggle;
