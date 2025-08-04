import React from 'react';
import { Heart } from 'lucide-react';

/**
 * Footer component for the Alliance F&R application
 * Minimal thin line footer
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 flex-shrink-0">
      <div className="px-4 py-2">
        <div className="flex justify-between items-center text-xs text-gray-700">
          <span>© {currentYear} Alliance F&R</span>
          <div className="flex items-center space-x-1">
            <span>Hecho con</span>
            <Heart size={10} className="text-red-500" />
            <span>para optimizar tu gestión</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;