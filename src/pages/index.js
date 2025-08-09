import { useState, useEffect, lazy, Suspense } from 'react';
import Head from 'next/head';
import { clientService, movementService, apiService } from '../shared/services';
import { safeLocalStorage } from '../shared/services/safeOperations';
import LoginPage from '../features/auth/LoginPage';

// Force rebuild Wed Jul 31 2024 18:00:00 GMT-0300 (Argentina Standard Time)

// Lazy load components for better performance
const NavigationApp = lazy(() => 
  import('../shared/components/ui/NavigationApp').then(module => ({
    default: module.NavigationApp
  }))
);
const FinancialOperationsApp = lazy(() => import('../features/financial-operations/FinancialOperationsApp'));
const ClientesApp = lazy(() => import('../features/clients/ClientesApp'));
const MovimientosApp = lazy(() => import('../features/movements/MovimientosApp'));
const PendientesRetiroApp = lazy(() => import('../features/pending-withdrawals/PendientesRetiroApp'));
const GastosApp = lazy(() => import('../features/expenses/GastosApp'));
const CuentasCorrientesApp = lazy(() => import('../features/current-accounts/CuentasCorrientesApp'));
const PrestamistasApp = lazy(() => import('../features/lenders/PrestamistasApp'));
const ComisionesApp = lazy(() => import('../features/commissions/ComisionesApp'));
const UtilidadApp = lazy(() => import('../features/utility/UtilidadApp'));
const ArbitrajeApp = lazy(() => import('../features/arbitrage/ArbitrajeApp'));
const SaldosApp = lazy(() => import('../features/balances/SaldosApp'));
const CajaApp = lazy(() => import('../features/cash-register/CajaApp'));
const RentabilidadApp = lazy(() => import('../features/profitability/RentabilidadApp'));
const StockApp = lazy(() => import('../features/stock/StockApp'));
const SaldosInicialesApp = lazy(() => import('../features/initial-balances/SaldosInicialesApp'));

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
  'saldos-iniciales': SaldosInicialesApp
};

export default function Home() {
  // Navigation state
  const [currentPage, setCurrentPage] = useState('operaciones');
  
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
    // TEMPORAL: Bypass auth para debug
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('bypass') === 'true') {
      setIsAuthenticated(true);
      setCurrentUser({
        id: 1,
        name: 'Francisco Garralda',
        username: 'FranciscoGarralda',
        role: 'admin'
      });
      setCheckingAuth(false);
      loadLocalData();
      return;
    }
    
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await apiService.getMe();
      if (response.success && response.user) {
        setIsAuthenticated(true);
        setCurrentUser(response.user);
        // Load data from backend after authentication
        loadDataFromBackend();
      }
    } catch (error) {
      console.log('No authenticated session');
      // Load data from localStorage for now
      loadLocalData();
    } finally {
      setCheckingAuth(false);
    }
  };

  const loadDataFromBackend = async () => {
    try {
      // Load movements from backend
      const backendMovements = await apiService.getMovements();
      setMovements(backendMovements);
      
      // Load clients from backend
      const backendClients = await apiService.getClients();
      setClients(backendClients);
    } catch (error) {
      console.error('Error loading data from backend:', error);
      // Fallback to localStorage
      loadLocalData();
    }
  };

  const loadLocalData = () => {
    // Load movements from localStorage
    const savedMovements = movementService.getMovements();
    setMovements(savedMovements);
    
    // Load clients from localStorage
    const savedClients = clientService.getClients();
    setClients(savedClients);
  };

  // Handle login success
  const handleLoginSuccess = (user) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    loadDataFromBackend();
  };

  // Handle logout
  const handleLogout = async () => {
    await apiService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setMovements([]);
    setClients([]);
  };

  // Save movements to localStorage when they change (backup)
  useEffect(() => {
    if (movements.length > 0) {
      const result = movementService.saveMovements(movements);
      if (!result.success) {
        console.warn('Failed to save movements:', result.error);
      }
    }
  }, [movements]);

  // Save clients to localStorage when they change (backup)
  useEffect(() => {
    if (clients.length > 0) {
      const result = clientService.saveClients(clients);
      if (!result.success) {
        console.warn('Failed to save clients:', result.error);
      }
    }
  }, [clients]);

  // Movement management functions
  const handleSaveMovement = async (movementData) => {
    try {
      if (isAuthenticated) {
        // Save to backend
        let savedMovement;
        if (editingMovement) {
          savedMovement = await apiService.updateMovement(editingMovement.id, movementData);
        } else {
          savedMovement = await apiService.createMovement(movementData);
        }
        
        // Reload movements from backend
        await loadDataFromBackend();
      } else {
        // Save to localStorage
        const newMovement = {
          ...movementData,
          id: editingMovement ? editingMovement.id : Date.now(),
          createdAt: editingMovement ? editingMovement.createdAt : new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        if (editingMovement) {
          setMovements(prev => prev.map(m => 
            m.id === editingMovement.id ? newMovement : m
          ));
        } else {
          setMovements(prev => [...prev, newMovement]);
        }
      }
      
      setEditingMovement(null);
      navigateTo('movimientos');
    } catch (error) {
      console.error('Error saving movement:', error);
      alert('Error al guardar el movimiento');
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
      if (isAuthenticated) {
        // Save to backend
        const existingClient = clients.find(c => 
          c.nombre.toLowerCase() === clientData.nombre.toLowerCase() && c.id !== clientData.id
        );

        if (existingClient) {
          alert('Ya existe un cliente con ese nombre');
          return;
        }

        if (clientData.id) {
          await apiService.updateClient(clientData.id, clientData);
        } else {
          await apiService.createClient(clientData);
        }
        
        await loadDataFromBackend();
      } else {
        // Save to localStorage
        const existingClient = clients.find(c => 
          c.nombre.toLowerCase() === clientData.nombre.toLowerCase() && c.id !== clientData.id
        );

        if (existingClient) {
          alert('Ya existe un cliente con ese nombre');
          return;
        }

        if (clientData.id) {
          setClients(prev => prev.map(c => 
            c.id === clientData.id ? clientData : c
          ));
        } else {
          const newClient = {
            ...clientData,
            id: Date.now(),
            fechaRegistro: new Date().toISOString(),
            totalOperaciones: 0,
            volumenTotal: 0,
            estado: 'activo'
          };
          setClients(prev => [...prev, newClient]);
        }
      }
    } catch (error) {
      console.error('Error saving client:', error);
      alert('Error al guardar el cliente');
    }
  };

  const handleDeleteClient = async (id) => {
    const client = clients.find(c => c.id === id);
    if (!client) return;

    const clientMovements = movements.filter(m => m.cliente === client.nombre);
    
    if (clientMovements.length > 0) {
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
    setCurrentPage(page);
  };

  // Render current page component
  const renderCurrentPage = () => {
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
        onCancelEdit: handleCancelEdit
      },
      'clientes': {
        clients,
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
      'saldos': {
        movements
      },
      'caja': {
        movements
      },
      'rentabilidad': {
        movements
      }
    };

    const props = componentProps[currentPage] || commonProps;
    
    return <Component {...props} />;
  };

  // Show loading while checking auth
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
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
      >
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-gray-600">Cargando módulo...</div>
          </div>
        }>
          {renderCurrentPage()}
        </Suspense>
      </NavigationApp>
    </>
  );
}



// Force rebuild Fri Aug  8 01:55:15 AM UTC 2025
