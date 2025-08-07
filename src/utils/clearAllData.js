// Función para limpiar TODOS los datos locales
// ADVERTENCIA: Esto borrará TODO permanentemente

export const clearAllLocalData = () => {
  if (confirm('¿Estás seguro? Esto borrará TODOS los datos permanentemente.')) {
    // Limpiar movements
    localStorage.removeItem('movements');
    
    // Limpiar clientes
    localStorage.removeItem('clients');
    
    // Limpiar cualquier otro dato
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Mensaje de confirmación
    alert('Todos los datos han sido borrados. La página se recargará.');
    
    // Recargar la página
    window.location.reload();
  }
};

// Para ejecutar desde la consola del navegador:
// clearAllLocalData();