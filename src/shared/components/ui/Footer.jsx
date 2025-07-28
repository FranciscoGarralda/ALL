import React from 'react';
import { Heart, Code, Coffee } from 'lucide-react';

/**
 * Footer component for the Alliance F&R application
 * Provides proper page closure and branding
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          {/* Main footer content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Company info */}
            <div className="flex flex-col space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">Alliance F&R</h3>
              <p className="text-sm text-gray-600">
                Sistema de gestión financiera y operaciones
              </p>
              <p className="text-xs text-gray-500">
                Optimizando procesos desde {currentYear}
              </p>
            </div>

            {/* Quick links */}
            <div className="flex flex-col space-y-2">
              <h4 className="text-sm font-medium text-gray-900">Acceso rápido</h4>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
                <span>Movimientos</span>
                <span>•</span>
                <span>Clientes</span>
                <span>•</span>
                <span>Saldos</span>
                <span>•</span>
                <span>Reportes</span>
              </div>
            </div>

            {/* Tech info */}
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Code size={16} />
                <span>Next.js + React</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Coffee size={16} />
                <span>Hecho con dedicación</span>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <span>© {currentYear} Alliance F&R.</span>
                <span>Todos los derechos reservados.</span>
              </div>
              
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <span>Desarrollado con</span>
                <Heart size={12} className="text-red-500 mx-1" />
                <span>para optimizar tu gestión</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;