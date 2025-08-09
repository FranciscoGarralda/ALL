import React, { useState, useEffect } from 'react';
import { Menu, X, User, LogOut } from 'lucide-react';

const FixedHeader = ({ toggleSidebar, currentPage, showMenuButton, currentUser, onLogout }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-white border-b border-gray-200 z-50">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between">
        {/* Logo y menú hamburguesa */}
        <div className="flex items-center gap-4">
          {showMenuButton && (
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
          )}
          <div className="flex items-center gap-3">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
              Sistema Financiero
            </h1>
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Activo</span>
            </div>
          </div>
        </div>

        {/* User menu */}
        {currentUser && (
          <div className="relative user-menu">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <User className="w-5 h-5 text-gray-600" />
              <span className="hidden sm:block text-sm font-medium text-gray-700">
                {currentUser.name}
              </span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                  <p className="text-xs text-gray-500">{currentUser.role === 'admin' ? 'Administrador' : 'Usuario'}</p>
                </div>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default FixedHeader;