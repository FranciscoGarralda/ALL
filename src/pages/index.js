import React, { useState, useEffect, lazy, Suspense } from 'react';
import Head from 'next/head';

// Import navigation components
import { 
  NavigationApp, 
  WelcomePage, 
  NotFoundPage, 
  ModuleInDevelopmentPage, 
  useNavigation 
} from '../components/ui/NavigationApp';

// Lazy load heavy components for better performance
const FinancialOperationsApp = lazy(() => import('../components/forms/FinancialOperationsApp'));
const ClientesApp = lazy(() => import('../components/modules/ClientesApp'));
const MovimientosApp = lazy(() => import('../components/modules/MovimientosApp'));
const PendientesRetiroApp = lazy(() => import('../components/modules/PendientesRetiroApp'));
const GastosApp = lazy(() => import('../components/modules/GastosApp'));
const CuentasCorrientesApp = lazy(() => import('../components/modules/CuentasCorrientesApp'));
const PrestamistasApp = lazy(() => import('../components/modules/PrestamistasApp'));
const ComisionesApp = lazy(() => import('../components/modules/ComisionesApp'));
const UtilidadApp = lazy(() => import('../components/modules/UtilidadApp'));
const ArbitrajeApp = lazy(() => import('../components/modules/ArbitrajeApp'));

// Loading component for better UX
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    <span className="ml-3 text-gray-600">Cargando módulo...</span>
  </div>
);

/**
 * Main application component with navigation and module management
 * Optimized with lazy loading and performance improvements
 */
export default function MainApp() {
  const { currentPage, navigateTo } = useNavigation('mainMenu');
  
  // Global state management with performance optimizations
  const [movements, setMovements] = useState([]);
  const [clients, setClients] = useState(() => {
    // Initialize with sample data only when needed
    return [
      // Sample clients data
      {
        id: 1,
        nombre: 'Juan',
        apellido: 'Pérez',
        tipoCliente: 'prestamistas',
        dni: '12.345.678',
        telefono: '+54 11 1234-5678',
        direccion: 'Av. Corrientes 1234, CABA',
        email: 'juan.perez@email.com',
        ultimaOperacion: '2024-01-15',
        totalOperaciones: 5,
        volumenTotal: 25000,
        operaciones: [
          { fecha: '2024-01-15', monto: 5000 },
          { fecha: '2024-01-01', monto: 8000 },
          { fecha: '2023-12-15', monto: 12000 }
        ]
      },
      {
        id: 2,
        nombre: 'María',
        apellido: 'González',
        tipoCliente: 'operaciones',
        dni: '23.456.789',
        telefono: '+54 11 8765-4321',
        direccion: 'Av. Santa Fe 5678, CABA',
        email: 'maria.gonzalez@email.com',
        ultimaOperacion: '2024-01-20',
        totalOperaciones: 8,
        volumenTotal: 45000,
        operaciones: [
          { fecha: '2024-01-20', monto: 15000 },
          { fecha: '2024-01-10', monto: 10000 },
          { fecha: '2023-12-28', monto: 20000 }
        ]
      },
      {
        id: 3,
        nombre: 'Carlos',
        apellido: 'Rodríguez',
        tipoCliente: 'operaciones',
        dni: '34.567.890',
        telefono: '+54 11 5555-0000',
        direccion: 'Av. Rivadavia 9012, CABA',
        email: 'carlos.rodriguez@email.com',
        ultimaOperacion: '2023-12-01',
        totalOperaciones: 3,
        volumenTotal: 18000,
        operaciones: [
          { fecha: '2023-12-01', monto: 8000 },
          { fecha: '2023-11-15', monto: 10000 }
        ]
      }
    ];
  });
  const [editingMovement, setEditingMovement] = useState(null);

  // Navigation state to track where user came from
  const [previousPage, setPreviousPage] = useState('movimientos');

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedMovements = localStorage.getItem('financial-movements');
      const savedClients = localStorage.getItem('financial-clients');
      
      if (savedMovements) {
        setMovements(JSON.parse(savedMovements));
      }
      
      if (savedClients) {
        setClients(JSON.parse(savedClients));
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  }, []);

  // Save data to localStorage when state changes
  useEffect(() => {
    try {
      localStorage.setItem('financial-movements', JSON.stringify(movements));
    } catch (error) {
      console.error('Error saving movements to localStorage:', error);
    }
  }, [movements]);

  useEffect(() => {
    try {
      localStorage.setItem('financial-clients', JSON.stringify(clients));
    } catch (error) {
      console.error('Error saving clients to localStorage:', error);
    }
  }, [clients]);

  // Movement management functions
  const handleSaveMovement = (movementData) => {
    const newMovement = {
      ...movementData,
      id: editingMovement ? editingMovement.id : Date.now(),
      createdAt: editingMovement ? editingMovement.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingMovement) {
      // Update existing movement
      setMovements(prev => prev.map(m => 
        m.id === editingMovement.id ? newMovement : m
      ));
      setEditingMovement(null);
      console.log('Movement updated:', newMovement);
    } else {
      // Add new movement
      setMovements(prev => [...prev, newMovement]);
      console.log('Movement saved:', newMovement);
    }

    // Navigate back to movements list after save
    navigateTo('movimientos');
  };

  const handleEditMovement = (movement) => {
    console.log('Editing movement:', movement);
    setEditingMovement(movement);
    setPreviousPage(currentPage); // Remember where we came from
    navigateTo('nuevoMovimiento');
  };

  const handleDeleteMovement = (movementId) => {
    if (window.confirm('¿Está seguro de que desea eliminar este movimiento?')) {
      setMovements(prev => prev.filter(m => m.id !== movementId));
      console.log('Movement deleted:', movementId);
    }
  };

  const handleCancelEdit = () => {
    setEditingMovement(null);
    navigateTo(previousPage); // Return to previous page instead of always movimientos
  };

  // Client management functions
  const handleSaveClient = (clientData) => {
    console.log('handleSaveClient called with:', clientData);
    console.log('Client has ID:', !!clientData.id);
    console.log('Current clients count:', clients.length);
    
    setClients(prev => {
      // Verificar duplicados usando el estado actual (prev)
      const existingClient = prev.find(c => c.id === clientData.id);
      console.log('Existing client found in current state:', !!existingClient);
      
      if (clientData.id && existingClient) {
        // Update existing client
        console.log('Client updated:', clientData);
        return prev.map(c => c.id === clientData.id ? clientData : c);
      } else if (clientData.id && !existingClient) {
        // Cliente con ID pero no existe, agregarlo como nuevo
        console.log('Client with ID added as new:', clientData);
        return [...prev, clientData];
      } else {
        // Add new client without ID
        const newClient = {
          ...clientData,
          id: Date.now(),
          createdAt: new Date().toISOString()
        };
        console.log('Client saved as new:', newClient);
        return [...prev, newClient];
      }
    });
  };

  const handleDeleteClient = (clientId) => {
    setClients(prev => prev.filter(c => c.id !== clientId));
    console.log('Client deleted:', clientId);
  };

  // Page rendering function
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'mainMenu':
        return <WelcomePage />;
      
      case 'nuevoMovimiento':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <FinancialOperationsApp
              onSaveMovement={handleSaveMovement}
              initialMovementData={editingMovement}
              onCancelEdit={handleCancelEdit}
              clients={clients}
              onSaveClient={handleSaveClient}
            />
          </Suspense>
        );
      
      case 'movimientos':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <MovimientosApp 
              movements={movements}
              clients={clients}
              onEditMovement={handleEditMovement}
              onDeleteMovement={handleDeleteMovement}
              onNavigate={navigateTo}
            />
          </Suspense>
        );
      
      case 'pendientesRetiro':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <PendientesRetiroApp 
              movements={movements}
              clients={clients}
              onEditMovement={handleEditMovement}
              onDeleteMovement={handleDeleteMovement}
              onNavigate={navigateTo}
            />
          </Suspense>
        );
      
      case 'clientes':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <ClientesApp 
              clientes={clients}
              onSaveClient={handleSaveClient}
              onDeleteClient={handleDeleteClient}
            />
          </Suspense>
        );
      
      case 'saldos':
        return <ModuleInDevelopmentPage moduleName="Saldos" onNavigate={navigateTo} />;
      
      case 'cuentas':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <CuentasCorrientesApp 
              movements={movements}
              onNavigate={navigateTo}
            />
          </Suspense>
        );
      
      case 'arbitraje':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <ArbitrajeApp 
              movements={movements}
              onNavigate={navigateTo}
            />
          </Suspense>
        );
      
      case 'utilidad':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <UtilidadApp 
              movements={movements}
              onNavigate={navigateTo}
            />
          </Suspense>
        );
      
      case 'comisiones':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <ComisionesApp 
              movements={movements}
              onNavigate={navigateTo}
            />
          </Suspense>
        );
      
      case 'prestamistas':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <PrestamistasApp 
              clients={clients}
              movements={movements}
              onNavigate={navigateTo}
            />
          </Suspense>
        );
      
      case 'gastos':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <GastosApp 
              movements={movements}
              onEditMovement={handleEditMovement}
              onDeleteMovement={handleDeleteMovement}
              onViewMovementDetail={(movement) => {
                // Usar el componente MovimientoDetail del módulo de movimientos
                setCurrentPage('movimientos');
                // Aquí podrías implementar una navegación más específica si es necesario
              }}
              onNavigate={navigateTo}
            />
          </Suspense>
        );
      
      default:
        return <NotFoundPage onNavigate={navigateTo} />;
    }
  };

  return (
    <>
      <Head>
        <title>Alliance F&R - Sistema Financiero</title>
        <meta name="description" content="Sistema integral de gestión financiera multiplataforma" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <NavigationApp currentPage={currentPage} onNavigate={navigateTo}>
        {renderCurrentPage()}
      </NavigationApp>
    </>
  );
}



