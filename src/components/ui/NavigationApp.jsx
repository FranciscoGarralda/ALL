import React, { useState } from 'react';
import {
  Plus,
  Users,
  Wallet,
  List,
  DollarSign,
  TrendingUp,
  CreditCard,
  Receipt,
  Building2,
  UserCheck,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

/** COMPONENTE DE ELEMENTO DEL MENÚ */
function MenuItem({ icon: Icon, title, onClick, isActive, isSidebarOpen }) {
  return (
    <button
      className={`
        w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200
        ${isActive
          ? 'bg-primary-600 text-white shadow-medium transform scale-105'
          : 'text-gray-700 hover:bg-primary-50 hover:text-primary-700 active:bg-primary-100 hover:scale-102'
        }
        ${isSidebarOpen ? '' : 'justify-center'}
        touch-manipulation select-none
      `}
      onClick={onClick}
      title={!isSidebarOpen ? title : ''} // Tooltip cuando está colapsado
    >
      <Icon size={24} className="flex-shrink-0" />
      {isSidebarOpen && (
        <span className="text-sm font-medium truncate transition-all duration-200">
          {title}
        </span>
      )}
    </button>
  );
}

/** COMPONENTE DEL MENÚ PRINCIPAL */
function MainMenu({ onNavigate, activeItem, isSidebarOpen, toggleSidebar }) {
  const menuItems = [
    { id: 'nuevoMovimiento', icon: Plus, title: 'Nuevo Movimiento' },
    { id: 'saldos', icon: Wallet, title: 'Saldos' },
    { id: 'movimientos', icon: List, title: 'Movimientos' },
    { id: 'cuentas', icon: Building2, title: 'Cuentas Corrientes' },
    { id: 'arbitraje', icon: ArrowUpDown, title: 'Arbitraje' },
    { id: 'utilidad', icon: TrendingUp, title: 'Utilidad' },
    { id: 'comisiones', icon: DollarSign, title: 'Comisiones' },
    { id: 'prestamistas', icon: CreditCard, title: 'Prestamistas' },
    { id: 'gastos', icon: Receipt, title: 'Gastos' },
    { id: 'clientes', icon: UserCheck, title: 'Clientes' }
  ];

  const handleItemClick = (itemId) => {
    onNavigate(itemId);
  };

  return (
    <div className={`
      ${isSidebarOpen ? 'w-64' : 'w-20'}
      fixed top-0 left-0 h-full bg-white shadow-strong flex flex-col 
      transition-all duration-300 ease-in-out z-30
      border-r border-gray-200
    `}>
      {/* Header del Sidebar */}
      <div className={`
        p-4 border-b border-gray-200 flex items-center
        ${isSidebarOpen ? 'justify-between' : 'justify-center'}
      `}>
        {isSidebarOpen && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <DollarSign size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 truncate">
              Alliance F&R
            </h1>
          </div>
        )}
        
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-full hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 touch-target"
          aria-label={isSidebarOpen ? "Colapsar menú" : "Expandir menú"}
        >
          {isSidebarOpen ? (
            <ChevronLeft size={20} className="text-gray-600" />
          ) : (
            <ChevronRight size={20} className="text-gray-600" />
          )}
        </button>
      </div>

      {/* Menú de navegación */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <MenuItem
            key={item.id}
            icon={item.icon}
            title={item.title}
            isActive={activeItem === item.id}
            onClick={() => handleItemClick(item.id)}
            isSidebarOpen={isSidebarOpen}
          />
        ))}
      </nav>

      {/* Footer del Sidebar */}
      {isSidebarOpen && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">© 2024 Alliance F&R</p>
            <p className="text-xs text-gray-400">Sistema Financiero</p>
          </div>
        </div>
      )}
    </div>
  );
}

/** COMPONENTE PRINCIPAL DE NAVEGACIÓN */
const NavigationApp = ({ children, currentPage, onNavigate }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <MainMenu 
        onNavigate={onNavigate} 
        activeItem={currentPage} 
        isSidebarOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
      />
      
      {/* Contenido principal */}
      <div className={`
        flex-1 transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'ml-64' : 'ml-20'}
      `}>
        {/* Overlay para móvil cuando el sidebar está abierto */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={toggleSidebar}
          />
        )}
        
        {/* Contenido de la página */}
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};

/** PÁGINA DE BIENVENIDA */
const WelcomePage = () => (
  <div className="flex flex-col items-center justify-center min-h-screen text-gray-600 p-4">
    <div className="text-center max-w-md fade-in">
      <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <DollarSign size={32} className="text-primary-600" />
      </div>
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-800">
        Bienvenido a Alliance F&R
      </h2>
      <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
        Sistema integral de gestión financiera. Selecciona una opción del menú lateral para comenzar a operar.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-gray-500">
        <div className="text-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
          <Users size={20} className="mx-auto mb-1 text-primary-500" />
          <span>Gestión de Clientes</span>
        </div>
        <div className="text-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
          <TrendingUp size={20} className="mx-auto mb-1 text-success-500" />
          <span>Análisis de Utilidad</span>
        </div>
        <div className="text-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
          <Building2 size={20} className="mx-auto mb-1 text-purple-500" />
          <span>Cuentas Corrientes</span>
        </div>
        <div className="text-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
          <CreditCard size={20} className="mx-auto mb-1 text-warning-500" />
          <span>Prestamistas</span>
        </div>
      </div>
    </div>
  </div>
);

/** PÁGINA NO ENCONTRADA */
const NotFoundPage = ({ onNavigate }) => (
  <div className="flex flex-col items-center justify-center min-h-screen text-gray-600 p-4">
    <div className="text-center fade-in">
      <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Users size={32} className="text-error-600" />
      </div>
      <h2 className="text-xl font-bold mb-4 text-gray-800">Página no encontrada</h2>
      <p className="mb-4 text-gray-600">La página que buscas no existe o está en desarrollo.</p>
      <button 
        onClick={() => onNavigate('mainMenu')} 
        className="btn-primary touch-target"
      >
        Volver al menú principal
      </button>
    </div>
  </div>
);

/** PÁGINA DE MÓDULO EN DESARROLLO */
const ModuleInDevelopmentPage = ({ moduleName, onNavigate }) => (
  <div className="flex flex-col items-center justify-center min-h-screen text-gray-600 p-4">
    <div className="text-center max-w-md fade-in">
      <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <TrendingUp size={32} className="text-warning-600" />
      </div>
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        {moduleName || 'Módulo'} en Desarrollo
      </h2>
      <p className="mb-6 text-gray-600 leading-relaxed">
        Este módulo está siendo desarrollado y estará disponible próximamente.
      </p>
      <div className="space-y-3">
        <button 
          onClick={() => onNavigate('nuevoMovimiento')} 
          className="btn-primary w-full touch-target"
        >
          Ir a Nuevo Movimiento
        </button>
        <button 
          onClick={() => onNavigate('mainMenu')} 
          className="btn-secondary w-full touch-target"
        >
          Volver al menú principal
        </button>
      </div>
    </div>
  </div>
);

/** HOOK PERSONALIZADO PARA MANEJO DE NAVEGACIÓN */
const useNavigation = (initialPage = 'mainMenu') => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [navigationHistory, setNavigationHistory] = useState([initialPage]);

  const navigateTo = (page) => {
    setCurrentPage(page);
    setNavigationHistory(prev => [...prev, page]);
  };

  const goBack = () => {
    if (navigationHistory.length > 1) {
      const newHistory = navigationHistory.slice(0, -1);
      const previousPage = newHistory[newHistory.length - 1];
      setCurrentPage(previousPage);
      setNavigationHistory(newHistory);
    }
  };

  const canGoBack = navigationHistory.length > 1;

  return {
    currentPage,
    navigateTo,
    goBack,
    canGoBack,
    navigationHistory
  };
};

export {
  MenuItem,
  MainMenu,
  NavigationApp,
  WelcomePage,
  NotFoundPage,
  ModuleInDevelopmentPage,
  useNavigation
};