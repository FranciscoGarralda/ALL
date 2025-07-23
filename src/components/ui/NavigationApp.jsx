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
          ? 'menu-item-active'
          : 'text-gray-700 hover:menu-item-hover active:bg-blue-100'
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
      fixed top-0 left-0 h-full bg-white shadow-large flex flex-col border-r border-gray-200
      transition-all duration-300 ease-in-out z-30
      ${isSidebarOpen ? 'w-64' : 'w-20 max-lg:w-0 max-lg:overflow-hidden'}
      ${!isSidebarOpen ? 'max-lg:-translate-x-full' : ''}
    `}>
      {/* Header del Sidebar */}
      <div className={`
        p-4 border-b border-gray-200 flex items-center
        ${isSidebarOpen ? 'justify-between' : 'justify-center'}
      `}>
        {isSidebarOpen && (
          <div className="flex items-center space-x-2 sidebar-enter">
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
        <div className="p-4 border-t border-gray-200 bg-gray-50 sidebar-enter">
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

  // Cerrar sidebar en móvil cuando se hace clic en un item
  const handleNavigate = (page) => {
    onNavigate(page);
    // En móvil, cerrar el sidebar después de navegar
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <MainMenu 
        onNavigate={handleNavigate} 
        activeItem={currentPage} 
        isSidebarOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
      />
      
      {/* Contenido principal */}
      <div className={`main-content ${
        isSidebarOpen 
          ? 'lg:ml-64' 
          : 'lg:ml-20'
      }`}>
        {/* Overlay para móvil cuando el sidebar está abierto */}
        {isSidebarOpen && (
          <div 
            className="overlay-mobile"
            onClick={toggleSidebar}
          />
        )}
        
        {/* Botón hamburguesa para móvil - solo visible cuando sidebar está cerrada */}
        {!isSidebarOpen && (
          <div className="lg:hidden fixed top-4 left-4 z-50">
            <button
              onClick={toggleSidebar}
              className="p-3 bg-white rounded-lg shadow-medium hover:shadow-large transition-all duration-200 touch-target"
              aria-label="Abrir menú"
            >
              <List size={24} className="text-gray-700" />
            </button>
          </div>
        )}
        
        {/* Contenido de la página */}
        <main className="min-h-screen w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

/** PÁGINA DE BIENVENIDA */
const WelcomePage = () => (
  <div className="flex flex-col items-center justify-center min-h-screen text-gray-600 p-4 lg:p-8">
    <div className="text-center max-w-md mx-auto">
      <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
        <DollarSign size={32} className="text-primary-600" />
      </div>
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-800 animate-fadeIn">
        Bienvenido a Alliance F&R
      </h2>
      <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-8 animate-slideUp">
        Sistema integral de gestión financiera. Selecciona una opción del menú lateral para comenzar a operar.
      </p>
      <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
        <div className="text-center p-4 bg-white rounded-lg shadow-soft hover:shadow-medium transition-all duration-200 animate-scaleIn">
          <Users size={20} className="mx-auto mb-2 text-primary-500" />
          <span className="block font-medium">Gestión de Clientes</span>
        </div>
        <div className="text-center p-4 bg-white rounded-lg shadow-soft hover:shadow-medium transition-all duration-200 animate-scaleIn" style={{animationDelay: '0.1s'}}>
          <TrendingUp size={20} className="mx-auto mb-2 text-success-500" />
          <span className="block font-medium">Análisis de Utilidad</span>
        </div>
        <div className="text-center p-4 bg-white rounded-lg shadow-soft hover:shadow-medium transition-all duration-200 animate-scaleIn" style={{animationDelay: '0.2s'}}>
          <Building2 size={20} className="mx-auto mb-2 text-warning-500" />
          <span className="block font-medium">Cuentas Corrientes</span>
        </div>
        <div className="text-center p-4 bg-white rounded-lg shadow-soft hover:shadow-medium transition-all duration-200 animate-scaleIn" style={{animationDelay: '0.3s'}}>
          <CreditCard size={20} className="mx-auto mb-2 text-error-500" />
          <span className="block font-medium">Prestamistas</span>
        </div>
      </div>
    </div>
  </div>
);

/** PÁGINA NO ENCONTRADA */
const NotFoundPage = ({ onNavigate }) => (
  <div className="flex flex-col items-center justify-center min-h-screen text-gray-600 p-4">
    <div className="text-center max-w-md mx-auto">
      <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="text-2xl">🔍</span>
      </div>
      <h2 className="text-xl font-bold mb-4 text-gray-800">Página no encontrada</h2>
      <p className="mb-6 text-gray-600">La página que buscas no existe o está en desarrollo.</p>
      <button 
        onClick={() => onNavigate('mainMenu')} 
        className="btn-primary touch-target"
      >
        Volver al menú principal
      </button>
    </div>
  </div>
);

/** PÁGINA EN DESARROLLO */
const ModuleInDevelopmentPage = ({ moduleName, onNavigate }) => (
  <div className="flex flex-col items-center justify-center min-h-screen text-gray-600 p-4">
    <div className="text-center max-w-md mx-auto">
      <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="text-2xl">🚧</span>
      </div>
      <h2 className="text-xl font-bold mb-4 text-gray-800">Módulo en Desarrollo</h2>
      <p className="mb-2 text-gray-600">
        El módulo <strong>{moduleName}</strong> está actualmente en desarrollo.
      </p>
      <p className="mb-6 text-sm text-gray-500">
        Estará disponible en una próxima actualización del sistema.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button 
          onClick={() => onNavigate('mainMenu')} 
          className="btn-secondary touch-target"
        >
          Menú Principal
        </button>
        <button 
          onClick={() => onNavigate('nuevoMovimiento')} 
          className="btn-primary touch-target"
        >
          Nuevo Movimiento
        </button>
      </div>
    </div>
  </div>
);

/** HOOK PERSONALIZADO PARA NAVEGACIÓN */
const useNavigation = (initialPage = 'mainMenu') => {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const navigateTo = (page) => {
    setCurrentPage(page);
  };

  return { currentPage, navigateTo };
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