import React, { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import {
  Plus,
  Users,
  Wallet,
  List,
  Clock,
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
import FixedHeader from './FixedHeader';
import Footer from './Footer';

/** COMPONENTE DE ELEMENTO DEL MENÚ OPTIMIZADO */
const MenuItem = memo(({ icon: Icon, title, onClick, isActive, isSidebarOpen }) => {
  const buttonRef = useRef(null);
  
  const buttonClasses = useMemo(() => `
    w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 relative
    ${isActive
      ? 'menu-item-active'
      : 'text-gray-700 hover:menu-item-hover active:bg-blue-100'
    }
    ${isSidebarOpen ? '' : 'justify-center menu-tooltip'}
    touch-manipulation select-none
  `, [isActive, isSidebarOpen]);

  // Calculate tooltip Y position when hovering (only for collapsed sidebar)
  const handleMouseEnter = useCallback(() => {
    if (!isSidebarOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const tooltipY = rect.top + (rect.height / 2);
      document.documentElement.style.setProperty('--tooltip-y', `${tooltipY}px`);
    }
  }, [isSidebarOpen]);

  return (
    <button
      ref={buttonRef}
      className={buttonClasses}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      data-tooltip={!isSidebarOpen ? title : undefined}
      aria-label={!isSidebarOpen ? title : undefined}
    >
      <Icon size={24} className="flex-shrink-0" />
      {isSidebarOpen && (
        <span className="text-sm font-medium truncate transition-all duration-200">
          {title}
        </span>
      )}
    </button>
  );
});

MenuItem.displayName = 'MenuItem';

/** COMPONENTE DEL MENÚ PRINCIPAL OPTIMIZADO */
const MainMenu = memo(({ onNavigate, activeItem, isSidebarOpen, toggleSidebar }) => {
  const menuItems = useMemo(() => [
    { id: 'nuevoMovimiento', icon: Plus, title: 'Nuevo Movimiento' },
    { id: 'saldos', icon: Wallet, title: 'Saldos' },
    { id: 'movimientos', icon: List, title: 'Movimientos' },
    { id: 'pendientesRetiro', icon: Clock, title: 'Pendientes de retiro' },
    { id: 'cuentas', icon: Building2, title: 'Cuentas Corrientes' },
    { id: 'arbitraje', icon: ArrowUpDown, title: 'Arbitraje' },
    { id: 'utilidad', icon: TrendingUp, title: 'Utilidad' },
    { id: 'comisiones', icon: DollarSign, title: 'Comisiones' },
    { id: 'prestamistas', icon: CreditCard, title: 'Prestamistas' },
    { id: 'gastos', icon: Receipt, title: 'Gastos' },
    { id: 'clientes', icon: UserCheck, title: 'Clientes' }
  ], []);

  const handleItemClick = useCallback((itemId) => {
    onNavigate(itemId);
  }, [onNavigate]);

  return (
    <div className={`
      fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white shadow-large flex flex-col border-r border-gray-200
      transition-all duration-300 ease-in-out z-30
      ${isSidebarOpen ? 'w-64' : 'w-20 max-lg:w-0 max-lg:overflow-hidden'}
      ${!isSidebarOpen ? 'max-lg:-translate-x-full sidebar-collapsed' : ''}
    `} style={{ overflowX: isSidebarOpen ? 'hidden' : 'visible' }}>
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
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto" style={{ overflowX: isSidebarOpen ? 'hidden' : 'visible' }}>
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
});

MainMenu.displayName = 'MainMenu';

/** COMPONENTE PRINCIPAL DE NAVEGACIÓN OPTIMIZADO */
const NavigationApp = memo(({ children, currentPage, onNavigate }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Iniciar cerrado en móvil
  const [isMobile, setIsMobile] = useState(false);

  // Optimized mobile detection with cleanup
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    // Initial check
    checkMobile();
    
    // Throttled resize handler to prevent excessive calls
    let resizeTimer;
    const throttledResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(checkMobile, 100);
    };
    
    window.addEventListener('resize', throttledResize, { passive: true });
    
    // Cleanup function to prevent memory leaks
    return () => {
      window.removeEventListener('resize', throttledResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  // Optimized toggle function with useCallback
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  // Optimized navigation handler with useCallback
  const handleNavigate = useCallback((page) => {
    onNavigate(page);
    // En móvil, cerrar el sidebar después de navegar
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [onNavigate, isMobile]);

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    if (isSidebarOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [isSidebarOpen]);

  // Prevent body scroll when mobile sidebar is open
  // Also prevent horizontal scroll when tooltips appear on collapsed menu
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    } else if (!isSidebarOpen && !isMobile) {
      // Prevent horizontal scroll when tooltips appear
      document.body.style.overflowX = 'hidden';
      return () => {
        document.body.style.overflowX = 'unset';
      };
    }
  }, [isMobile, isSidebarOpen]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header fijo */}
      <FixedHeader 
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        currentPage={currentPage}
        showMenuButton={true}
      />

      {/* Sidebar */}
      <MainMenu 
        onNavigate={handleNavigate} 
        activeItem={currentPage} 
        isSidebarOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
      />
      
      {/* Contenido principal con footer */}
      <div className={`main-content pt-16 flex flex-col flex-1 ${
        isSidebarOpen 
          ? 'lg:ml-64' 
          : 'lg:ml-20'
      }`}>
        {/* Overlay para móvil cuando el sidebar está abierto */}
        {isSidebarOpen && isMobile && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={toggleSidebar}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && toggleSidebar()}
            aria-label="Cerrar menú"
          />
        )}
        
        {/* Contenido de la página */}
        <main className="flex-1 w-full">
          {children}
        </main>
        
        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
});

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
  const [isClient, setIsClient] = useState(false);

  // Efecto para detectar que estamos en el cliente y restaurar página
  useEffect(() => {
    setIsClient(true);
    
    try {
      const savedPage = localStorage.getItem('financial-current-page');
      if (savedPage) {
        setCurrentPage(savedPage);
      }
    } catch (error) {
      console.error('Error loading current page from localStorage:', error);
    }
  }, []);

  const navigateTo = (page) => {
    setCurrentPage(page);
    
    // Guardar página actual en localStorage (solo en el cliente)
    if (isClient) {
      try {
        localStorage.setItem('financial-current-page', page);
      } catch (error) {
        console.error('Error saving current page to localStorage:', error);
      }
    }
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