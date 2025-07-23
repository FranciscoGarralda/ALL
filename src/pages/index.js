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
import MovimientosApp from '../components/modules/MovimientosApp';
import GastosApp from '../components/modules/GastosApp';
import CuentasCorrientesApp from '../components/modules/CuentasCorrientesApp';
import PrestamistasApp from '../components/modules/PrestamistasApp';
import ComisionesApp from '../components/modules/ComisionesApp';
import UtilidadApp from '../components/modules/UtilidadApp';
import ArbitrajeApp from '../components/modules/ArbitrajeApp';

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
          <MovimientosApp 
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
        return (
          <CuentasCorrientesApp 
            movements={movements}
            onNavigate={navigateTo}
          />
        );
      
      case 'arbitraje':
        return (
          <ArbitrajeApp 
            movements={movements}
            onNavigate={navigateTo}
          />
        );
      
      case 'utilidad':
        return (
          <UtilidadApp 
            movements={movements}
            onNavigate={navigateTo}
          />
        );
      
      case 'comisiones':
        return (
          <ComisionesApp 
            movements={movements}
            onNavigate={navigateTo}
          />
        );
      
      case 'prestamistas':
        return (
          <PrestamistasApp 
            clients={clients}
            movements={movements}
            onNavigate={navigateTo}
          />
        );
      
      case 'gastos':
        return (
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



