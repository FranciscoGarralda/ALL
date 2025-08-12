import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { apiService } from '../shared/services';
import LoginPage from '../features/auth/LoginPage';

// Import components directly (no lazy loading for Next.js production)
import { NavigationApp, WelcomePage } from '../shared/components/ui/NavigationApp';
import FinancialOperationsApp from '../features/financial-operations/FinancialOperationsApp';
import ClientesApp from '../features/clients/ClientesApp';
import MovimientosApp from '../features/movements/MovimientosApp';
import PendientesRetiroApp from '../features/pending-withdrawals/PendientesRetiroApp';
import GastosApp from '../features/expenses/GastosApp';
import CuentasCorrientesApp from '../features/current-accounts/CuentasCorrientesApp';
import PrestamistasApp from '../features/lenders/PrestamistasApp';
import ComisionesApp from '../features/commissions/ComisionesApp';
import UtilidadApp from '../features/utility/UtilidadApp';
import ArbitrajeApp from '../features/arbitrage/ArbitrajeApp';
import SaldosApp from '../features/balances/SaldosApp';
import CajaApp from '../features/cash-register/CajaApp';
import RentabilidadApp from '../features/profitability/RentabilidadApp';
import StockApp from '../features/stock/StockApp';
import SaldosInicialesApp from '../features/initial-balances/SaldosInicialesApp';
import UserManagementApp from '../features/user-management/UserManagementApp';

// Component map for dynamic rendering
const componentMap = {
  'operaciones': FinancialOperationsApp,
  'clientes': ClientesApp,
  'movimientos': MovimientosApp,
  'pendientes': PendientesRetiroApp,
  'gastos': GastosApp,
  'cuentas-corrientes': CuentasCorrientesApp,
  'prestamistas': PrestamistasApp,
  'comisiones': ComisionesApp,
  'utilidad': UtilidadApp,
  'arbitraje': ArbitrajeApp,
  'saldos': SaldosApp,
  'caja': CajaApp,
  'rentabilidad': RentabilidadApp,
  'stock': StockApp,
  'saldos-iniciales': SaldosInicialesApp,
  'usuarios': UserManagementApp
};

export default function Home() {
  // Navigation state
  const [currentPage, setCurrentPage] = useState('inicio');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Data state
  const [movements, setMovements] = useState([]);
  const [clients, setClients] = useState([]);
  const [editingMovement, setEditingMovement] = useState(null);
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Verificar si hay token guardado localmente
      const token = localStorage.getItem('authToken');
      
      if (token) {
        // Si hay token, intentar validarlo (pero con timeout corto)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // Solo 2 segundos
        
        try {
          const response = await apiService.getMe();
          clearTimeout(timeoutId);
          
          if (response.success && response.user) {
            setIsAuthenticated(true);
            setCurrentUser(response.user);
            loadDataFromBackend();
          }
        } catch (error) {
          clearTimeout(timeoutId);
          // Si falla, limpiar token y mostrar login
          localStorage.removeItem('authToken');
          setIsAuthenticated(false);
        }
      } else {
        // No hay token, ir directo al login
        setIsAuthenticated(false);
      }
    } catch (error) {
      // Cualquier error, ir al login
      setIsAuthenticated(false);
    } finally {
      // Reducir tiempo de espera
      setTimeout(() => {
        setCheckingAuth(false);
      }, 500); // Solo medio segundo
    }
  };

  const loadDataFromBackend = async () => {
    try {
      // Cargar datos en paralelo para mejor rendimiento
      const [backendMovements, backendClients] = await Promise.all([
        apiService.getMovements().catch(() => []),
        apiService.getClients().catch(() => [])
      ]);
      
      setMovements(Array.isArray(backendMovements) ? backendMovements : []);
      setClients(Array.isArray(backendClients) ? backendClients : []);
    } catch (error) {
      console.error('Error loading data from backend:', error);
    }
  };

  // Handle login success
  const handleLoginSuccess = (response) => {
    if (response && response.success) {
      setIsAuthenticated(true);
      setCurrentUser(response.user);
      if (response.token) {
        apiService.setToken(response.token);
      }
      loadDataFromBackend();
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await apiService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setMovements([]);
    setClients([]);
  };

  // Movement management functions
  const handleSaveMovement = async (movementData) => {
    try {
      let savedMovement;
      
      // Solo guardar en backend
      if (editingMovement) {
        savedMovement = await apiService.updateMovement(editingMovement.id, movementData);
      } else {
        savedMovement = await apiService.createMovement(movementData);
      }
      
      // Si se guardó en backend exitosamente, recargar datos
      if (savedMovement) {
        await loadDataFromBackend();
      }
      
      setEditingMovement(null);
      navigateTo('movimientos');
      return savedMovement;
    } catch (error) {
      console.error('Error saving movement:', error);
      alert(`Error al guardar el movimiento: ${error.message}`);
      return null;
    }
  };

  const handleDeleteMovement = async (id) => {
    if (confirm('¿Estás seguro de eliminar este movimiento?')) {
      try {
        if (isAuthenticated) {
          await apiService.deleteMovement(id);
          await loadDataFromBackend();
        } else {
          setMovements(prev => prev.filter(m => m.id !== id));
        }
      } catch (error) {
        console.error('Error deleting movement:', error);
        alert('Error al eliminar el movimiento');
      }
    }
  };

  const handleEditMovement = (movement) => {
    setEditingMovement(movement);
    setCurrentPage('operaciones');
  };

  const handleCancelEdit = () => {
    setEditingMovement(null);
    setCurrentPage('movimientos');
  };

  // Client management functions
  const handleSaveClient = async (clientData) => {
    try {
      // Verificar duplicados solo si estamos editando
      if (clientData.id) {
        const existingClient = clients.find(c => 
          c.nombre.toLowerCase() === clientData.nombre.toLowerCase() && c.id !== clientData.id
        );

        if (existingClient) {
          alert('Ya existe un cliente con ese nombre');
          return null;
        }
      }

      let savedClient;
      
      // Solo guardar en backend
      if (clientData.id && typeof clientData.id === 'number') {
        savedClient = await apiService.updateClient(clientData.id, clientData);
      } else {
        savedClient = await apiService.createClient(clientData);
      }
      
      // Si se guardó en backend exitosamente
      if (savedClient && savedClient.id) {
        setClients(prevClients => {
          if (!Array.isArray(prevClients)) return [savedClient];
          
          const updatedClients = [...prevClients];
          const existingIndex = updatedClients.findIndex(c => c.id === savedClient.id);
          
          if (existingIndex >= 0) {
            updatedClients[existingIndex] = savedClient;
          } else {
            updatedClients.push(savedClient);
          }
          
          return updatedClients;
        });
        
        return savedClient;
      }
      
      return null;
    } catch (error) {
      console.error('Error saving client:', error);
      alert(`Error al guardar el cliente: ${error.message}`);
      // No hacer throw del error para evitar que ErrorBoundary lo capture
      return null;
    }
  };

  const handleDeleteClient = async (id) => {
    const client = clients.find(c => c.id === id);
    if (!client) return;

    const clientMovements = movements && Array.isArray(movements) 
      ? movements.filter(m => m.cliente === client.nombre)
      : [];
    
    if (clientMovements && clientMovements.length > 0) {
      alert(`No se puede eliminar el cliente "${client.nombre}" porque tiene ${clientMovements.length} movimientos asociados.`);
      return;
    }

    if (confirm(`¿Estás seguro de eliminar al cliente "${client.nombre}"?`)) {
      try {
        if (isAuthenticated) {
          await apiService.deleteClient(id);
          await loadDataFromBackend();
        } else {
          setClients(prev => prev.filter(c => c.id !== id));
        }
      } catch (error) {
        console.error('Error deleting client:', error);
        alert('Error al eliminar el cliente');
      }
    }
  };

  // Navigation
  const navigateTo = (page) => {
    // Map navigation IDs to component IDs
    const pageMap = {
      'inicio': 'inicio',  // Mostrar la página de bienvenida
      'nuevoMovimiento': 'operaciones',
      'pendientesRetiro': 'pendientes',
      'cuentas': 'cuentas-corrientes',
      'saldosIniciales': 'saldos-iniciales'
    };
    
    const mappedPage = pageMap[page] || page;
    setCurrentPage(mappedPage);
    
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  // Render current page component
  const renderCurrentPage = () => {
    // Show welcome page for inicio
    if (currentPage === 'inicio') {
      return <WelcomePage onNavigate={navigateTo} />;
    }
    
    // Verificar permisos del usuario
    if (currentUser && currentUser.role !== 'admin') {
      // Mapear páginas a permisos
      const permissionMap = {
        'operaciones': 'operaciones',
        'pendientes': 'pendientes',
        'cuentas-corrientes': 'cuentas-corrientes',
        'saldos-iniciales': 'saldos-iniciales',
        'movimientos': 'movimientos',
        'saldos': 'saldos',
        'clientes': 'clientes',
        'prestamistas': 'prestamistas',
        'gastos': 'gastos',
        'comisiones': 'comisiones',
        'utilidad': 'utilidad',
        'arbitraje': 'arbitraje',
        'caja': 'caja',
        'rentabilidad': 'rentabilidad',
        'stock': 'stock'
      };
      
      const requiredPermission = permissionMap[currentPage];
      
      // Si el usuario no tiene permisos o no tiene acceso a esta página
      if (requiredPermission && (!currentUser.permissions || 
          !Array.isArray(currentUser.permissions) || 
          !currentUser.permissions.includes(requiredPermission))) {
        return (
          <div className="flex flex-col items-center justify-center min-h-screen text-gray-600 p-4">
            <div className="text-center max-w-md mx-auto">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🚫</span>
              </div>
              <h2 className="text-xl font-bold mb-4 text-gray-800">Acceso Denegado</h2>
              <p className="mb-6 text-gray-600">No tienes permisos para acceder a este módulo.</p>
              <button 
                onClick={() => navigateTo('inicio')} 
                className="btn-primary"
              >
                Volver al inicio
              </button>
            </div>
          </div>
        );
      }
    }
    
    const Component = componentMap[currentPage];
    
    if (!Component) {
      return <div>Página no encontrada</div>;
    }

    // Props for different components
    const commonProps = {
      movements,
      onNavigate: navigateTo
    };

    const componentProps = {
      'operaciones': {
        onSaveMovement: handleSaveMovement,
        clients,
        initialMovementData: editingMovement,
        onCancelEdit: handleCancelEdit,
        onSaveClient: handleSaveClient
      },
      'clientes': {
        clientes: clients,
        onSaveClient: handleSaveClient,
        onDeleteClient: handleDeleteClient,
        movements
      },
      'movimientos': {
        ...commonProps,
        onEdit: handleEditMovement,
        onDelete: handleDeleteMovement,
        clients
      },
      'pendientes': {
        ...commonProps,
        clients,
        onEditMovement: handleEditMovement,
        onDeleteMovement: handleDeleteMovement
      },
      'gastos': {
        ...commonProps,
        onEditMovement: handleEditMovement,
        onDeleteMovement: handleDeleteMovement,
        onViewMovementDetail: null // Add if needed
      },
      'cuentas-corrientes': {
        ...commonProps
      },
      'prestamistas': {
        ...commonProps,
        clients
      },
      'comisiones': {
        ...commonProps
      },
      'utilidad': {
        ...commonProps
      },
      'arbitraje': {
        ...commonProps
      },
      'saldos': {
        movements
      },
      'caja': {
        movements
      },
      'rentabilidad': {
        movements
      },
      'stock': {
        // StockApp no necesita props
      },
      'saldos-iniciales': {
        // SaldosInicialesApp no necesita props
      }
    };

    const props = componentProps[currentPage] || commonProps;
    
    return <Component {...props} />;
  };

  // Show loading while checking auth
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700 font-medium">Iniciando sistema...</p>
          <p className="mt-2 text-sm text-gray-500">Verificando autenticación</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLoginSuccess} />;
  }

  return (
    <>
      <Head>
        <title>Sistema Financiero</title>
        <meta name="description" content="Sistema de gestión financiera" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <NavigationApp 
        currentPage={currentPage} 
        onNavigate={navigateTo}
        currentUser={currentUser}
        onLogout={handleLogout}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      >
        {renderCurrentPage()}
      </NavigationApp>
    </>
  );
}


