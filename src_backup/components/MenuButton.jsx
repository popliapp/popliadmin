import React from 'react';
import { Menu as MenuIcon } from '@mui/icons-material';

export default function MenuButton({ onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        md:hidden 
        inline-flex items-center justify-center p-2 rounded-md 
        text-gray-600 hover:text-gray-900 hover:bg-gray-100 
        focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 
        transition-colors cursor-pointer
        ${className}
      `}
      aria-label="Open sidebar"
    >
      <MenuIcon />
    </button>
  );
}
