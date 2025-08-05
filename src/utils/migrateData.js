// Script para migrar datos del localStorage al backend
// Este script es opcional y se puede ejecutar desde la consola del navegador

import { apiService } from '../shared/services/api';

export async function migrateDataToBackend() {
  try {
    console.log('🚀 Iniciando migración de datos...');
    
    // Verificar que el usuario esté autenticado
    const user = await apiService.getMe();
    if (!user.success) {
      throw new Error('Debes iniciar sesión primero');
    }
    
    // Obtener datos del localStorage
    const localMovements = JSON.parse(localStorage.getItem('financial-movements') || '[]');
    const localClients = JSON.parse(localStorage.getItem('financial-clients') || '[]');
    
    console.log(`📊 Encontrados: ${localMovements.length} movimientos y ${localClients.length} clientes`);
    
    // Migrar clientes primero
    const clientsMap = new Map();
    let clientsSuccess = 0;
    let clientsError = 0;
    
    for (const client of localClients) {
      try {
        // Preparar datos del cliente
        const clientData = {
          nombre: client.nombre || '',
          apellido: client.apellido || '',
          tipoCliente: client.tipoCliente || 'operaciones',
          telefono: client.telefono || '',
          email: client.email || '',
          direccion: client.direccion || '',
          notas: client.notas || ''
        };
        
        const response = await apiService.createClient(clientData);
        if (response.success) {
          clientsMap.set(client.id, response.data);
          clientsSuccess++;
          console.log(`✅ Cliente migrado: ${client.nombre} ${client.apellido}`);
        }
      } catch (error) {
        clientsError++;
        console.error(`❌ Error migrando cliente ${client.nombre}:`, error);
      }
    }
    
    console.log(`👥 Clientes: ${clientsSuccess} exitosos, ${clientsError} errores`);
    
    // Migrar movimientos
    let movementsSuccess = 0;
    let movementsError = 0;
    
    for (const movement of localMovements) {
      try {
        // Preparar datos del movimiento
        const movementData = {
          ...movement,
          fecha: new Date(movement.fecha),
          // Remover campos que no necesitamos
          id: undefined,
          createdAt: undefined,
          updatedAt: undefined
        };
        
        // Si el cliente era un ID local, buscar el nombre completo
        if (movement.cliente && typeof movement.cliente === 'number') {
          const localClient = localClients.find(c => c.id === movement.cliente);
          if (localClient) {
            movementData.cliente = `${localClient.nombre} ${localClient.apellido}`;
          }
        }
        
        const response = await apiService.createMovement(movementData);
        if (response.success) {
          movementsSuccess++;
          console.log(`✅ Movimiento migrado: ${movement.operacion} - ${movement.subOperacion}`);
        }
      } catch (error) {
        movementsError++;
        console.error(`❌ Error migrando movimiento:`, error);
      }
    }
    
    console.log(`💰 Movimientos: ${movementsSuccess} exitosos, ${movementsError} errores`);
    
    // Resumen final
    console.log('✨ Migración completada:');
    console.log(`   - Clientes: ${clientsSuccess}/${localClients.length}`);
    console.log(`   - Movimientos: ${movementsSuccess}/${localMovements.length}`);
    
    if (clientsSuccess > 0 || movementsSuccess > 0) {
      console.log('🎉 ¡Datos migrados exitosamente!');
      console.log('💡 Puedes eliminar los datos locales con: localStorage.clear()');
    }
    
    return {
      clients: { success: clientsSuccess, error: clientsError },
      movements: { success: movementsSuccess, error: movementsError }
    };
    
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    throw error;
  }
}

// Función para limpiar datos locales después de migrar
export function clearLocalData() {
  const confirm = window.confirm('¿Estás seguro de que quieres eliminar todos los datos locales? Asegúrate de haberlos migrado primero.');
  
  if (confirm) {
    localStorage.removeItem('financial-movements');
    localStorage.removeItem('financial-clients');
    console.log('🗑️ Datos locales eliminados');
  }
}

// Exportar para uso global en la consola
if (typeof window !== 'undefined') {
  window.migrateDataToBackend = migrateDataToBackend;
  window.clearLocalData = clearLocalData;
}