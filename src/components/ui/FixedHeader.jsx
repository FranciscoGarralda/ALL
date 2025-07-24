import React, { useState, useEffect } from 'react';
import { Menu, X, Calendar, Clock, DollarSign } from 'lucide-react';

const FixedHeader = ({ 
  isSidebarOpen, 
  toggleSidebar, 
  currentPage, 
  showMenuButton = true 
}) => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Actualizar fecha y hora cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000); // Actualizar cada minuto

    return () => clearInterval(timer);
  }, []);

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
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-40 h-16">
      <div className="h-full flex items-center justify-between px-4">
        {/* Lado izquierdo: Menú hamburguesa + Título */}
        <div className="flex items-center space-x-3">
          {/* Botón hamburguesa - solo visible en móvil */}
          {showMenuButton && (
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 touch-target"
              aria-label={isSidebarOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {isSidebarOpen ? (
                <X size={24} className="text-gray-700" />
              ) : (
                <Menu size={24} className="text-gray-700" />
              )}
            </button>
          )}

          {/* Logo y título - oculto en móvil cuando hay menú */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <DollarSign size={18} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-gray-900 truncate">
                {getPageTitle(currentPage)}
              </h1>
            </div>
          </div>
        </div>

        {/* Centro: Información de fecha (visible en tablet/desktop) */}
        <div className="hidden md:flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Calendar size={16} className="text-gray-500" />
            <div className="text-center">
              <div className="font-medium text-gray-900">{dateInfo.dayName}</div>
              <div className="text-xs text-gray-500">{dateInfo.shortDate}</div>
            </div>
          </div>
          
          <div className="w-px h-8 bg-gray-200"></div>
          
          <div className="flex items-center space-x-2">
            <Clock size={16} className="text-gray-500" />
            <div className="font-mono text-gray-900">{currentTime}</div>
          </div>
        </div>

        {/* Lado derecho: Información compacta para móvil */}
        <div className="flex items-center space-x-2">
          {/* Información compacta en móvil */}
          <div className="md:hidden text-right text-xs text-gray-600">
            <div className="font-medium text-gray-900">{dateInfo.dayName}</div>
            <div className="text-gray-500">{currentTime}</div>
          </div>

          {/* Indicador de estado (opcional) */}
          <div className="w-2 h-2 bg-success-500 rounded-full" title="Sistema activo"></div>
        </div>
      </div>
    </header>
  );
};

export default FixedHeader;