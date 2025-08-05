import React, { useState, useEffect } from 'react';
import { Menu, X, Calendar, Clock, DollarSign, User, LogOut } from 'lucide-react';

const FixedHeader = ({ 
  isSidebarOpen, 
  toggleSidebar, 
  currentPage, 
  showMenuButton = true,
  currentUser,
  onLogout
}) => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Actualizar fecha y hora cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000); // Actualizar cada minuto

    return () => clearInterval(timer);
  }, []);

  // Cerrar menú de usuario al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showUserMenu]);

  // Formatear fecha y día de la semana
  const formatDate = (date) => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return {
      dayName,
      fullDate: `${day} de ${month}, ${year}`,
      shortDate: `${day}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${year}`
    };
  };

  // Formatear hora
  const formatTime = (date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Obtener título de la página actual
  const getPageTitle = (page) => {
    const titles = {
      nuevoMovimiento: 'Nuevo Movimiento',
      saldos: 'Saldos',
      movimientos: 'Movimientos',
      pendientesRetiro: 'Pendientes',
      cuentas: 'Cuentas Corrientes',
      arbitraje: 'Arbitraje',
      utilidad: 'Utilidad',
      comisiones: 'Comisiones',
      prestamistas: 'Prestamistas',
      gastos: 'Gastos',
      clientes: 'Clientes'
    };
    return titles[page] || 'Alliance F&R';
  };

  const dateInfo = formatDate(currentDateTime);
  const currentTime = formatTime(currentDateTime);

  return (
    <header className="fixed top-0 left-0 right-0 bg-gray-900 backdrop-blur-md border-b border-gray-800 shadow-xl z-40 h-16">
      <div className="h-full flex items-center justify-between px-4">
        {/* Lado izquierdo: Menú hamburguesa + Título */}
        <div className="flex items-center space-x-3">
          {/* Botón hamburguesa - visible en móvil */}
          {showMenuButton && (
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2.5 rounded-xl hover:bg-gray-800 hover:scale-105 transition-all duration-200 touch-target"
              aria-label={isSidebarOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {isSidebarOpen ? (
                <X size={24} className="text-gray-100" />
              ) : (
                <Menu size={24} className="text-gray-100" />
              )}
            </button>
          )}

          {/* Botón toggle sidebar - visible en desktop */}
          {showMenuButton && (
            <button
              onClick={toggleSidebar}
              className="hidden lg:block p-2.5 rounded-xl hover:bg-gray-800 hover:scale-105 transition-all duration-200 touch-target"
              aria-label={isSidebarOpen ? "Colapsar sidebar" : "Expandir sidebar"}
            >
              <Menu size={20} className="text-gray-100" />
            </button>
          )}

          {/* Logo y título */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center shadow-md border border-gray-600">
              <DollarSign size={20} className="text-gray-100" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-100 truncate">
                {getPageTitle(currentPage)}
              </h1>
            </div>
          </div>
        </div>

        {/* Centro: Información de fecha (visible en tablet/desktop) */}
        <div className="hidden md:flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-xl border border-gray-700">
            <Calendar size={18} className="text-gray-300" />
            <div className="text-center">
              <div className="font-semibold text-gray-100">{dateInfo.dayName}</div>
              <div className="text-xs text-gray-400">{dateInfo.shortDate}</div>
            </div>
          </div>
          
          <div className="w-px h-10 bg-gray-700"></div>
          
          <div className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-xl border border-gray-700">
            <Clock size={18} className="text-gray-300" />
            <div className="font-mono font-semibold text-gray-100 text-base">{currentTime}</div>
          </div>
        </div>

        {/* Lado derecho: Información compacta para móvil + Usuario */}
        <div className="flex items-center space-x-3">
          {/* Información compacta en móvil */}
          <div className="md:hidden text-right text-sm">
            <div className="font-semibold text-gray-100">{dateInfo.dayName}</div>
            <div className="text-gray-300 font-medium">{currentTime}</div>
          </div>

          {/* Menú de usuario */}
          {currentUser && (
            <div className="relative user-menu-container">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-xl transition-all duration-200 border border-gray-700"
              >
                <User size={18} className="text-gray-300" />
                <span className="hidden sm:block text-sm font-medium text-gray-100">
                  {currentUser.name}
                </span>
                <span className="text-xs text-gray-400 hidden lg:block">
                  ({currentUser.role === 'admin' ? 'Admin' : 'Usuario'})
                </span>
              </button>

              {/* Dropdown menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-xl shadow-xl border border-gray-700 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-700">
                    <p className="text-sm font-medium text-gray-100">{currentUser.name}</p>
                    <p className="text-xs text-gray-400">{currentUser.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-gray-100 transition-colors"
                  >
                    <LogOut size={16} />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Indicador de estado (opcional) */}
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg" title="Sistema activo"></div>
        </div>
      </div>
    </header>
  );
};

export default FixedHeader;