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
  Home,
  Calculator,
  BarChart3,
  Package,
  Settings,
  Shield
} from 'lucide-react';
import FixedHeader from './FixedHeader';
import Footer from './Footer';
import SidebarTooltip from './SidebarTooltip';



/** COMPONENTE DE ELEMENTO DEL MENÚ MEJORADO */
const MenuItem = memo(({ icon: Icon, title, onClick, isActive, isSidebarOpen }) => {

  return (
    <SidebarTooltip content={title} disabled={isSidebarOpen}>
      <button
        className={`
          w-full flex items-center gap-3 p-3 rounded-lg transition-colors duration-200
          ${!isSidebarOpen ? 'justify-center' : ''}
          ${isActive 
            ? 'bg-gray-900 text-white' 
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }
          touch-manipulation select-none
          focus:outline-none focus:ring-2 focus:ring-gray-400/20
        `}
        onClick={onClick}
        aria-current={isActive ? 'page' : undefined}
      >
        <Icon size={20} className="flex-shrink-0" />
        {isSidebarOpen && (
          <span className={`text-sm font-medium truncate ${isActive ? 'text-white' : ''}`}>
            {title}
          </span>
        )}
        
        {/* Indicador activo más sutil */}
        {isActive && isSidebarOpen && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gray-900 rounded-r-full"></div>
        )}
      </button>
    </SidebarTooltip>
  );
});

MenuItem.displayName = 'MenuItem';

/** COMPONENTE DEL MENÚ PRINCIPAL OPTIMIZADO */
const MainMenu = memo(({ onNavigate, activeItem, isSidebarOpen, toggleSidebar, isMobile = false, currentUser }) => {
  const menuItems = useMemo(() => [
    // OPERACIONES PRINCIPALES (arriba - más usadas)
    { id: 'inicio', icon: Home, title: 'Inicio', category: 'main' },
    { id: 'nuevoMovimiento', icon: Plus, title: 'Nuevo Movimiento', category: 'main' },
    { id: 'pendientesRetiro', icon: Clock, title: 'Pendientes', category: 'main' },
    
    // OPERACIONES (acciones que modifican datos)
    { id: 'arbitraje', icon: ArrowUpDown, title: 'Arbitraje', category: 'operations' },
    { id: 'caja', icon: Calculator, title: 'Caja Diaria', category: 'operations' },
    { id: 'gastos', icon: Receipt, title: 'Gastos', category: 'operations' },
    { id: 'stock', icon: Package, title: 'Stock', category: 'operations' },
    
    // GESTIÓN (administración de entidades)
    { id: 'clientes', icon: UserCheck, title: 'Clientes', category: 'management' },
    { id: 'prestamistas', icon: CreditCard, title: 'Prestamistas', category: 'management' },
    { id: 'cuentas', icon: Building2, title: 'Cuentas Corrientes', category: 'management' },
    
    // REPORTES E INFORMACIÓN (solo consulta - abajo)
    { id: 'movimientos', icon: List, title: 'Movimientos', category: 'reports' },
    { id: 'saldos', icon: Wallet, title: 'Saldos', category: 'reports' },
    { id: 'utilidad', icon: TrendingUp, title: 'Utilidad', category: 'reports' },
    { id: 'comisiones', icon: DollarSign, title: 'Comisiones', category: 'reports' },
    { id: 'rentabilidad', icon: BarChart3, title: 'Rentabilidad', category: 'reports' },
    
    // CONFIGURACIÓN
    { id: 'saldosIniciales', icon: Settings, title: 'Saldos Iniciales', category: 'config' },
    { id: 'usuarios', icon: Users, title: 'Gestión de Usuarios', adminOnly: true, category: 'config' }
  ], []);

  // Mapeo inverso para determinar qué item está activo
  const reversePageMap = useMemo(() => ({
    'operaciones': 'nuevoMovimiento',
    'pendientes': 'pendientesRetiro',
    'cuentas-corrientes': 'cuentas',
    'saldos-iniciales': 'saldosIniciales'
  }), []);

  const getActiveItemId = useCallback((currentPage) => {
    return reversePageMap[currentPage] || currentPage;
  }, [reversePageMap]);

  const handleItemClick = useCallback((itemId) => {
    onNavigate(itemId);
    // En móvil, cerrar el menú después de navegar
    if (isMobile && toggleSidebar) {
      toggleSidebar();
    }
  }, [onNavigate, isMobile, toggleSidebar]);

  // Filtrar items según el rol del usuario y permisos
  const visibleMenuItems = useMemo(() => {
    return menuItems.filter(item => {
      // Inicio siempre es visible para todos
      if (item.id === 'inicio') {
        return true;
      }
      
      // Si el item es solo para admin y el usuario no es admin, no mostrarlo
      if (item.adminOnly && (!currentUser || currentUser.role !== 'admin')) {
        return false;
      }
      
      // Si el usuario no es admin, verificar permisos
      if (currentUser && currentUser.role !== 'admin' && currentUser.permissions && Array.isArray(currentUser.permissions) && currentUser.permissions.length > 0) {
        // Mapear IDs de menú a IDs de permisos
        const permissionMap = {
          'nuevoMovimiento': 'operaciones',
          'pendientesRetiro': 'pendientes',
          'cuentas': 'cuentas-corrientes',
          'saldosIniciales': 'saldos-iniciales'
        };
        
        const permissionId = permissionMap[item.id] || item.id;
        
        // Si el usuario tiene permisos definidos, verificar si tiene acceso a este módulo
        if (!currentUser.permissions.includes(permissionId)) {
          return false;
        }
      }
      
      return true;
    });
  }, [menuItems, currentUser]);

  return (
    <div className={`
      ${isMobile 
        ? `fixed top-0 left-0 h-screen z-[60] w-64 ${!isSidebarOpen ? '-translate-x-full' : ''}`
        : `h-full z-30 ${isSidebarOpen ? 'w-64' : 'w-16'}`
      }
      bg-white shadow-xl flex flex-col border-r border-gray-200
      transition-all duration-300 ease-in-out
    `}>
      {/* Toggle button for desktop */}
      {!isMobile && (
        <div className={`flex ${isSidebarOpen ? 'justify-end p-3' : 'justify-center p-2'}`}>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400/20"
            aria-label={isSidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {isSidebarOpen ? (
              <ChevronLeft size={18} className="text-gray-500" />
            ) : (
              <ChevronRight size={18} className="text-gray-500" />
            )}
          </button>
        </div>
      )}
      
      {/* Menú de navegación - ocupa todo el espacio */}
      <nav className={`flex-1 ${isSidebarOpen || isMobile ? 'px-3 py-4' : 'p-2'} overflow-y-auto ${isMobile ? 'pt-20' : 'pt-4'}`}>
        {/* Renderizar items por categoría */}
        {['main', 'operations', 'management', 'reports', 'config'].map((category, categoryIndex) => {
          const categoryItems = visibleMenuItems.filter(item => item.category === category);
          if (categoryItems.length === 0) return null;
          
          return (
            <div key={category} className={categoryIndex > 0 ? 'mt-6' : ''}>
              {/* Separador entre categorías */}
              {categoryIndex > 0 && isSidebarOpen && (
                <div className="mx-3 mb-3 border-t border-gray-200"></div>
              )}
              
              {/* Items de la categoría */}
              <div className="space-y-1">
                {categoryItems.map((item) => (
                  <MenuItem
                    key={item.id}
                    icon={item.icon}
                    title={item.title}
                    isActive={getActiveItemId(activeItem) === item.id}
                    onClick={() => handleItemClick(item.id)}
                    isSidebarOpen={isSidebarOpen}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </nav>
    </div>
  );
});

MainMenu.displayName = 'MainMenu';

/** COMPONENTE PRINCIPAL DE NAVEGACIÓN OPTIMIZADO */
const NavigationApp = memo(({ children, currentPage, onNavigate, currentUser, onLogout, isSidebarOpen: propIsSidebarOpen, toggleSidebar: propToggleSidebar }) => {
  // Use props if provided, otherwise use internal state
  const [internalIsSidebarOpen, setInternalIsSidebarOpen] = useState(false);
  const isSidebarOpen = propIsSidebarOpen !== undefined ? propIsSidebarOpen : internalIsSidebarOpen;
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
    if (propToggleSidebar) {
      propToggleSidebar();
    } else {
      setInternalIsSidebarOpen(prev => !prev);
    }
  }, [propToggleSidebar]);

  // Optimized navigation handler with useCallback
  const handleNavigate = useCallback((page) => {
    onNavigate(page);
    // En móvil, cerrar el sidebar después de navegar
    if (isMobile) {
      if (propToggleSidebar && propIsSidebarOpen) {
        propToggleSidebar();
      } else {
        setInternalIsSidebarOpen(false);
      }
    }
  }, [onNavigate, isMobile, propToggleSidebar, propIsSidebarOpen]);

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isSidebarOpen) {
        if (propToggleSidebar) {
          propToggleSidebar();
        } else {
          setInternalIsSidebarOpen(false);
        }
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
        currentUser={currentUser}
        onLogout={onLogout}


      />

      {/* Layout principal con altura fija */}
      <div className="flex flex-1 overflow-hidden pt-20">
        {/* Sidebar - Solo desktop (lg+), siempre fija */}
        <div className="hidden lg:block">
          <MainMenu 
            onNavigate={handleNavigate} 
            activeItem={currentPage} 
            isSidebarOpen={isSidebarOpen} 
            toggleSidebar={toggleSidebar}
            isMobile={false}
            currentUser={currentUser}
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
            currentUser={currentUser}
          />
        )}
        
        {/* Contenido principal con flex-1 y scroll */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Overlay para móvil cuando el sidebar está abierto */}
          {isSidebarOpen && isMobile && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-[55] lg:hidden"
              onClick={toggleSidebar}
              role="button"
              tabIndex={0}
              aria-label="Cerrar menú"
            />
          )}
          
          {/* Contenido de la página - Solo esta área hace scroll */}
          <main className="flex-1 content-scrollable main-content-scroll">
            <div className="p-0">
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
    <div className="text-center w-full px-2 sm:px-3 lg:px-4">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
        <DollarSign size={32} className="text-gray-800" />
      </div>
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-800 animate-fadeIn">
        Bienvenido a Alliance F&R
      </h2>
      <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-8 animate-fadeIn">
        Sistema integral de gestión financiera. Accede rápidamente a las funciones principales:
      </p>
      
      {/* Accesos Rápidos Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <button
          onClick={() => onNavigate('nuevoMovimiento')}
          className="text-center p-6 bg-white rounded-lg shadow-soft hover:shadow-medium transition-all duration-200 animate-scaleIn border-2 border-transparent hover:border-gray-200 group"
        >
          <Plus size={32} className="mx-auto mb-3 text-gray-500 group-hover:scale-110 transition-transform" />
          <span className="block font-semibold text-gray-800 mb-1">Nuevo Movimiento</span>
          <span className="text-sm text-gray-700">Crear operación financiera</span>
        </button>
        
        <button
          onClick={() => onNavigate('saldos')}
          className="text-center p-6 bg-white rounded-lg shadow-soft hover:shadow-medium transition-all duration-200 animate-scaleIn border-2 border-transparent hover:border-success-200 group"
          style={{animationDelay: '0.1s'}}
        >
          <Wallet size={32} className="mx-auto mb-3 text-success-500 group-hover:scale-110 transition-transform" />
          <span className="block font-semibold text-gray-800 mb-1">Saldos</span>
          <span className="text-sm text-gray-700">Ver estado de cuentas</span>
        </button>
        
        <button
          onClick={() => onNavigate('movimientos')}
          className="text-center p-6 bg-white rounded-lg shadow-soft hover:shadow-medium transition-all duration-200 animate-scaleIn border-2 border-transparent hover:border-gray-200 group"
          style={{animationDelay: '0.2s'}}
        >
          <List size={32} className="mx-auto mb-3 text-gray-500 group-hover:scale-110 transition-transform" />
          <span className="block font-semibold text-gray-800 mb-1">Movimientos</span>
          <span className="text-sm text-gray-700">Historial de transacciones</span>
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
          <ArrowUpDown size={20} className="mx-auto mb-2 text-gray-500" />
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
      <p className="mb-6 text-sm text-gray-700">
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
  const [navigationParams, setNavigationParams] = useState(null);
  const [isClient, setIsClient] = useState(false);

  // Efecto para detectar que estamos en el cliente y restaurar página
  useEffect(() => {
    setIsClient(true);
    
    try {
      const savedPage = localStorage.getItem('financial-current-page');
      if (savedPage) {
        setCurrentPage(savedPage);
      }
      
      const savedParams = localStorage.getItem('financial-navigation-params');
      if (savedParams) {
        setNavigationParams(JSON.parse(savedParams));
      }
    } catch (error) {
      console.error('Error loading current page from localStorage:', error);
    }
  }, []);

  const navigateTo = (page, params = null) => {
    setCurrentPage(page);
    setNavigationParams(params);
    
    // Guardar página actual en localStorage (solo en el cliente)
    if (isClient) {
      try {
        localStorage.setItem('financial-current-page', page);
        if (params) {
          localStorage.setItem('financial-navigation-params', JSON.stringify(params));
        } else {
          localStorage.removeItem('financial-navigation-params');
        }
      } catch (error) {
        console.error('Error saving current page to localStorage:', error);
      }
    }
  };

  return { currentPage, navigateTo, navigationParams };
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