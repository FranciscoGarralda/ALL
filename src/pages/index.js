import React, { useState, useEffect, lazy, Suspense } from 'react';
import Head from 'next/head';
import { safeLocalStorage } from '../utils/safeOperations';

// Import navigation components
import { 
  NavigationApp, 
  WelcomePage, 
  NotFoundPage, 
  ModuleInDevelopmentPage, 
  useNavigation 
} from '../components/ui/NavigationApp';

// Intelligent lazy loading with performance tracking
import { createLazyComponent, useIntelligentPreloading, AdvancedLoadingFallback } from '../utils/lazyLoader';

const FinancialOperationsApp = createLazyComponent(
  () => import('../components/forms/FinancialOperationsApp'),
  'FinancialOperationsApp',
  { 
    preloadDelay: 1000,
    fallback: <AdvancedLoadingFallback componentName="Operaciones Financieras" estimatedLoadTime={800} />
  }
);

const ClientesApp = createLazyComponent(
  () => import('../components/modules/ClientesApp'),
  'ClientesApp',
  { 
    preloadDelay: 1200,
    fallback: <AdvancedLoadingFallback componentName="Clientes" estimatedLoadTime={600} />
  }
);

const MovimientosApp = createLazyComponent(
  () => import('../components/modules/MovimientosApp'),
  'MovimientosApp',
  { 
    preloadDelay: 1500,
    fallback: <AdvancedLoadingFallback componentName="Movimientos" estimatedLoadTime={600} />
  }
);

const PendientesRetiroApp = createLazyComponent(
  () => import('../components/modules/PendientesRetiroApp'),
  'PendientesRetiroApp',
  { 
    preloadDelay: 2500,
    fallback: <AdvancedLoadingFallback componentName="Pendientes de Retiro" estimatedLoadTime={400} />
  }
);

const GastosApp = createLazyComponent(
  () => import('../components/modules/GastosApp'),
  'GastosApp',
  { 
    preloadDelay: 3000,
    fallback: <AdvancedLoadingFallback componentName="Gastos" estimatedLoadTime={500} />
  }
);

const CuentasCorrientesApp = createLazyComponent(
  () => import('../components/modules/CuentasCorrientesApp'),
  'CuentasCorrientesApp',
  { 
    preloadDelay: 3500,
    fallback: <AdvancedLoadingFallback componentName="Cuentas Corrientes" estimatedLoadTime={600} />
  }
);

const PrestamistasApp = createLazyComponent(
  () => import('../components/modules/PrestamistasApp'),
  'PrestamistasApp',
  { 
    preloadDelay: 4000,
    fallback: <AdvancedLoadingFallback componentName="Prestamistas" estimatedLoadTime={500} />
  }
);

const ComisionesApp = createLazyComponent(
  () => import('../components/modules/ComisionesApp'),
  'ComisionesApp',
  { 
    preloadDelay: 4500,
    fallback: <AdvancedLoadingFallback componentName="Comisiones" estimatedLoadTime={400} />
  }
);

const UtilidadApp = createLazyComponent(
  () => import('../components/modules/UtilidadApp'),
  'UtilidadApp',
  { 
    preloadDelay: 2000,
    fallback: <AdvancedLoadingFallback componentName="Utilidades" estimatedLoadTime={500} />
  }
);

const ArbitrajeApp = createLazyComponent(
  () => import('../components/modules/ArbitrajeApp'),
  'ArbitrajeApp',
  { 
    preloadDelay: 5000,
    fallback: <AdvancedLoadingFallback componentName="Arbitraje" estimatedLoadTime={700} />
  }
);

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
  
  // Component map for intelligent preloading
  const componentMap = {
    'operaciones': FinancialOperationsApp,
    'clientes': ClientesApp,
    'movimientos': MovimientosApp,
    'pendientesRetiro': PendientesRetiroApp,
    'gastos': GastosApp,
    'cuentasCorrientes': CuentasCorrientesApp,
    'prestamistas': PrestamistasApp,
    'comisiones': ComisionesApp,
    'utilidad': UtilidadApp,
    'arbitraje': ArbitrajeApp
  };
  
  // Enable intelligent preloading based on user behavior
  useIntelligentPreloading(componentMap, {
    enablePredictive: true,
    preloadThreshold: 0.2 // Preload if 20% probability
  });
  
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

  // Load data from localStorage on mount - VERSIÓN SEGURA
  useEffect(() => {
    const savedMovements = safeLocalStorage.getItem('financial-movements', []);
    const savedClients = safeLocalStorage.getItem('financial-clients', []);
    
    if (Array.isArray(savedMovements) && savedMovements.length > 0) {
      setMovements(savedMovements);
    }
    
    if (Array.isArray(savedClients) && savedClients.length > 0) {
      setClients(savedClients);
    }
  }, []);

  // Save data to localStorage when state changes - VERSIÓN SEGURA
  useEffect(() => {
    if (movements.length > 0) {
      const result = safeLocalStorage.setItem('financial-movements', movements);
      if (!result.success) {
        console.warn('Failed to save movements:', result.error);
      }
    }
  }, [movements]);

  useEffect(() => {
    if (clients.length > 0) {
      const result = safeLocalStorage.setItem('financial-clients', clients);
      if (!result.success) {
        console.warn('Failed to save clients:', result.error);
      }
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
      
    } else {
      // Add new movement
      setMovements(prev => [...prev, newMovement]);
      
    }

    // Navigate back to movements list after save
    navigateTo('movimientos');
  };

  const handleEditMovement = (movement) => {

    setEditingMovement(movement);
    setPreviousPage(currentPage); // Remember where we came from
    navigateTo('nuevoMovimiento');
  };

  const handleDeleteMovement = (movementId) => {
    if (window.confirm('¿Está seguro de que desea eliminar este movimiento?')) {
      setMovements(prev => prev.filter(m => m.id !== movementId));

    }
  };

  const handleCancelEdit = () => {
    setEditingMovement(null);
    navigateTo(previousPage); // Return to previous page instead of always movimientos
  };

  // Client management functions
  const handleSaveClient = (clientData) => {

    
    setClients(prev => {
      // Verificar duplicados usando el estado actual (prev)
      const existingClient = prev.find(c => c.id === clientData.id);
      
      
      if (clientData.id && existingClient) {
        // Update existing client
        
        return prev.map(c => c.id === clientData.id ? clientData : c);
      } else if (clientData.id && !existingClient) {
        // Cliente con ID pero no existe, agregarlo como nuevo
        
        return [...prev, clientData];
      } else {
        // Add new client without ID
        const newClient = {
          ...clientData,
          id: Date.now(),
          createdAt: new Date().toISOString()
        };
        
        return [...prev, newClient];
      }
    });
  };

  const handleDeleteClient = (clientId) => {
    setClients(prev => prev.filter(c => c.id !== clientId));
    
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



