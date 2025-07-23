import React, { useState, useEffect } from 'react';
import Head from 'next/head';

// Import navigation components
import { 
  NavigationApp, 
  WelcomePage, 
  NotFoundPage, 
  ModuleInDevelopmentPage, 
  useNavigation 
} from '../components/ui/NavigationApp';

// Import form component
import FinancialOperationsApp from '../components/forms/FinancialOperationsApp';

// Import modules
import ClientesApp from '../components/modules/ClientesApp';

/**
 * Main application component with navigation and module management
 */
export default function MainApp() {
  const { currentPage, navigateTo } = useNavigation('mainMenu');
  
  // Global state management
  const [movements, setMovements] = useState([]);
  const [clients, setClients] = useState([
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
  ]);
  const [editingMovement, setEditingMovement] = useState(null);

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
    setEditingMovement(movement);
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
    navigateTo('movimientos');
  };

  // Client management functions
  const handleSaveClient = (clientData) => {
    if (clientData.id) {
      // Update existing client
      setClients(prev => prev.map(c => 
        c.id === clientData.id ? clientData : c
      ));
      console.log('Client updated:', clientData);
    } else {
      // Add new client
      const newClient = {
        ...clientData,
        id: Date.now(),
        createdAt: new Date().toISOString()
      };
      
      setClients(prev => [...prev, newClient]);
      console.log('Client saved:', newClient);
    }
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
          <FinancialOperationsApp
            onSaveMovement={handleSaveMovement}
            initialMovementData={editingMovement}
            onCancelEdit={handleCancelEdit}
            clients={clients}
          />
        );
      
      case 'movimientos':
        return (
          <MovementsListPage 
            movements={movements}
            onEditMovement={handleEditMovement}
            onDeleteMovement={handleDeleteMovement}
            onNavigate={navigateTo}
          />
        );
      
      case 'clientes':
        return (
          <ClientesApp 
            clientes={clients}
            onSaveClient={handleSaveClient}
            onDeleteClient={handleDeleteClient}
          />
        );
      
      case 'saldos':
        return <ModuleInDevelopmentPage moduleName="Saldos" onNavigate={navigateTo} />;
      
      case 'cuentas':
        return <ModuleInDevelopmentPage moduleName="Cuentas Corrientes" onNavigate={navigateTo} />;
      
      case 'arbitraje':
        return <ModuleInDevelopmentPage moduleName="Arbitraje" onNavigate={navigateTo} />;
      
      case 'utilidad':
        return <ModuleInDevelopmentPage moduleName="Utilidad" onNavigate={navigateTo} />;
      
      case 'comisiones':
        return <ModuleInDevelopmentPage moduleName="Comisiones" onNavigate={navigateTo} />;
      
      case 'prestamistas':
        return <ModuleInDevelopmentPage moduleName="Prestamistas" onNavigate={navigateTo} />;
      
      case 'gastos':
        return <ModuleInDevelopmentPage moduleName="Gastos" onNavigate={navigateTo} />;
      
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

/**
 * Movements List Page Component
 */
function MovementsListPage({ movements, onEditMovement, onDeleteMovement, onNavigate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');

  const filteredMovements = movements.filter(movement => {
    const matchesSearch = movement.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movement.detalle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movement.operacion?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = !filterType || movement.operacion === filterType;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="container-responsive py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Movimientos</h1>
          <p className="text-gray-600">Gestión de operaciones financieras</p>
        </div>
        <button
          onClick={() => onNavigate('nuevoMovimiento')}
          className="btn-primary"
        >
          Nuevo Movimiento
        </button>
      </div>

      {/* Search and Filter */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Buscar por cliente, detalle u operación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Todos los tipos</option>
              <option value="TRANSACCIONES">Transacciones</option>
              <option value="CUENTAS_CORRIENTES">Cuentas Corrientes</option>
              <option value="SOCIOS">Socios</option>
              <option value="ADMINISTRATIVAS">Administrativas</option>
              <option value="PRESTAMISTAS">Prestamistas</option>
              <option value="INTERNAS">Internas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Movements List */}
      <div className="space-y-4">
        {filteredMovements.length === 0 ? (
          <div className="card">
            <div className="card-body text-center py-12">
              <p className="text-gray-500 mb-4">
                {movements.length === 0 
                  ? 'No hay movimientos registrados' 
                  : 'No se encontraron movimientos que coincidan con los filtros'
                }
              </p>
              <button
                onClick={() => onNavigate('nuevoMovimiento')}
                className="btn-primary"
              >
                Crear Primer Movimiento
              </button>
            </div>
          </div>
        ) : (
          filteredMovements.map((movement) => (
            <div key={movement.id} className="card">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="status-info">{movement.operacion}</span>
                      <span className="text-sm text-gray-500">
                        {movement.subOperacion}
                      </span>
                      {movement.estado && (
                        <span className={`status-${movement.estado === 'realizado' ? 'success' : 'warning'}`}>
                          {movement.estado}
                        </span>
                      )}
                    </div>
                    <h3 className="font-medium text-gray-900">
                      {movement.cliente || 'Sin cliente'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {movement.detalle || 'Sin detalle'}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>Fecha: {movement.fecha}</span>
                      {movement.total && (
                        <span className="font-medium text-primary-600">
                          Total: {movement.total} {movement.monedaTC || movement.moneda}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEditMovement(movement)}
                      className="btn-secondary text-sm"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onDeleteMovement(movement.id)}
                      className="btn-error text-sm"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      {movements.length > 0 && (
        <div className="card mt-6">
          <div className="card-body">
            <h3 className="font-medium text-gray-900 mb-2">Resumen</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total movimientos:</span>
                <div className="font-medium">{movements.length}</div>
              </div>
              <div>
                <span className="text-gray-600">Filtrados:</span>
                <div className="font-medium">{filteredMovements.length}</div>
              </div>
              <div>
                <span className="text-gray-600">Realizados:</span>
                <div className="font-medium text-success-600">
                  {movements.filter(m => m.estado === 'realizado').length}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Pendientes:</span>
                <div className="font-medium text-warning-600">
                  {movements.filter(m => m.estado === 'pendiente').length}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

