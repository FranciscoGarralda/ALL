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
  ChevronRight,
  Home
} from 'lucide-react';
import FixedHeader from './FixedHeader';
import Footer from './Footer';
import SidebarTooltip from './SidebarTooltip';



/** COMPONENTE DE ELEMENTO DEL MENÚ SIMPLE */
const MenuItem = memo(({ icon: Icon, title, onClick, isActive, isSidebarOpen }) => {

  return (
    <SidebarTooltip content={title} disabled={isSidebarOpen}>
      <button
        className={`
          w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200
          ${!isSidebarOpen ? 'justify-center' : ''}
          ${isActive ? 'menu-item-active' : 'text-gray-700 hover:menu-item-hover'}
          touch-manipulation select-none
        `}
        onClick={onClick}
      >
        <Icon size={20} className="flex-shrink-0" />
        {isSidebarOpen && (
          <span className="text-sm font-medium truncate">
            {title}
          </span>
        )}
      </button>
    </SidebarTooltip>
  );
});

MenuItem.displayName = 'MenuItem';

/** COMPONENTE DEL MENÚ PRINCIPAL OPTIMIZADO */
const MainMenu = memo(({ onNavigate, activeItem, isSidebarOpen, toggleSidebar, isMobile = false }) => {
  const menuItems = useMemo(() => [
    { id: 'inicio', icon: Home, title: 'Inicio' },
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
      ${isMobile 
        ? `fixed top-0 left-0 h-screen z-40 w-64 ${!isSidebarOpen ? '-translate-x-full' : ''}`
        : `h-full z-30 ${isSidebarOpen ? 'w-64' : 'w-16'}`
      }
      bg-white shadow-lg flex flex-col border-r border-gray-200
      transition-all duration-300 ease-in-out
    `}>
      {/* Menú de navegación - ocupa todo el espacio */}
      <nav className={`flex-1 ${isSidebarOpen || isMobile ? 'p-4' : 'p-2'} space-y-1 overflow-y-auto pt-28`}>
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
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    } else if (!isSidebarOpen && !isMobile) {
      // Prevent horizontal scroll
      document.body.style.overflowX = 'hidden';
      return () => {
        document.body.style.overflowX = 'unset';
      };
    }
  }, [isMobile, isSidebarOpen]);

  return (
    <div className="layout-fixed flex flex-col bg-gray-50">
      {/* Header fijo */}
      <FixedHeader 
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        currentPage={currentPage}
        showMenuButton={true}
      />

      {/* Layout principal con altura fija */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Solo desktop (lg+), siempre fija */}
        <div className="hidden lg:block">
          <MainMenu 
            onNavigate={handleNavigate} 
            activeItem={currentPage} 
            isSidebarOpen={isSidebarOpen} 
            toggleSidebar={toggleSidebar}
            isMobile={false}
          />
        </div>
        
        {/* Sidebar móvil - Solo cuando está abierto */}
        {isMobile && isSidebarOpen && (
          <MainMenu 
            onNavigate={handleNavigate} 
            activeItem={currentPage} 
            isSidebarOpen={isSidebarOpen} 
            toggleSidebar={toggleSidebar}
            isMobile={true}
          />
        )}
        
        {/* Contenido principal con flex-1 y scroll */}
        <div className="flex-1 flex flex-col overflow-hidden">
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
          
          {/* Contenido de la página - Solo esta área hace scroll */}
          <main className="flex-1 content-scrollable main-content-scroll">
            <div className="p-4 lg:p-6 pt-28">
              {children}
            </div>
          </main>
          
          {/* Footer fijo */}
          <Footer />
        </div>
      </div>
    </div>
  );
});

NavigationApp.displayName = 'NavigationApp';

/** PÁGINA DE BIENVENIDA */
const WelcomePage = ({ onNavigate }) => (
  <div className="flex flex-col items-center justify-center min-h-screen text-gray-600 p-4 lg:p-8">
    <div className="text-center max-w-4xl mx-auto">
      <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
        <DollarSign size={32} className="text-primary-600" />
      </div>
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-800 animate-fadeIn">
        Bienvenido a Alliance F&R
      </h2>
      <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-8 animate-slideUp">
        Sistema integral de gestión financiera. Accede rápidamente a las funciones principales:
      </p>
      
      {/* Accesos Rápidos Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <button
          onClick={() => onNavigate('nuevoMovimiento')}
          className="text-center p-6 bg-white rounded-lg shadow-soft hover:shadow-medium transition-all duration-200 animate-scaleIn border-2 border-transparent hover:border-primary-200 group"
        >
          <Plus size={32} className="mx-auto mb-3 text-primary-500 group-hover:scale-110 transition-transform" />
          <span className="block font-semibold text-gray-800 mb-1">Nuevo Movimiento</span>
          <span className="text-sm text-gray-500">Crear operación financiera</span>
        </button>
        
        <button
          onClick={() => onNavigate('saldos')}
          className="text-center p-6 bg-white rounded-lg shadow-soft hover:shadow-medium transition-all duration-200 animate-scaleIn border-2 border-transparent hover:border-success-200 group"
          style={{animationDelay: '0.1s'}}
        >
          <Wallet size={32} className="mx-auto mb-3 text-success-500 group-hover:scale-110 transition-transform" />
          <span className="block font-semibold text-gray-800 mb-1">Saldos</span>
          <span className="text-sm text-gray-500">Ver estado de cuentas</span>
        </button>
        
        <button
          onClick={() => onNavigate('movimientos')}
          className="text-center p-6 bg-white rounded-lg shadow-soft hover:shadow-medium transition-all duration-200 animate-scaleIn border-2 border-transparent hover:border-blue-200 group"
          style={{animationDelay: '0.2s'}}
        >
          <List size={32} className="mx-auto mb-3 text-blue-500 group-hover:scale-110 transition-transform" />
          <span className="block font-semibold text-gray-800 mb-1">Movimientos</span>
          <span className="text-sm text-gray-500">Historial de transacciones</span>
        </button>
      </div>
      
      {/* Accesos Rápidos Secundarios */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        <button
          onClick={() => onNavigate('utilidad')}
          className="text-center p-4 bg-white rounded-lg shadow-soft hover:shadow-medium transition-all duration-200 animate-scaleIn border border-gray-100 hover:border-gray-200"
          style={{animationDelay: '0.3s'}}
        >
          <TrendingUp size={20} className="mx-auto mb-2 text-emerald-500" />
          <span className="block font-medium text-gray-700">Utilidad</span>
        </button>
        
        <button
          onClick={() => onNavigate('arbitraje')}
          className="text-center p-4 bg-white rounded-lg shadow-soft hover:shadow-medium transition-all duration-200 animate-scaleIn border border-gray-100 hover:border-gray-200"
          style={{animationDelay: '0.4s'}}
        >
          <ArrowUpDown size={20} className="mx-auto mb-2 text-indigo-500" />
          <span className="block font-medium text-gray-700">Arbitraje</span>
        </button>
        
        <button
          onClick={() => onNavigate('cuentas')}
          className="text-center p-4 bg-white rounded-lg shadow-soft hover:shadow-medium transition-all duration-200 animate-scaleIn border border-gray-100 hover:border-gray-200"
          style={{animationDelay: '0.5s'}}
        >
          <Building2 size={20} className="mx-auto mb-2 text-orange-500" />
          <span className="block font-medium text-gray-700">Cuentas Corrientes</span>
        </button>
        
        <button
          onClick={() => onNavigate('clientes')}
          className="text-center p-4 bg-white rounded-lg shadow-soft hover:shadow-medium transition-all duration-200 animate-scaleIn border border-gray-100 hover:border-gray-200"
          style={{animationDelay: '0.6s'}}
        >
          <UserCheck size={20} className="mx-auto mb-2 text-purple-500" />
          <span className="block font-medium text-gray-700">Clientes</span>
        </button>
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