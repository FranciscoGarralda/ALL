import { safeLocalStorage } from './safeOperations';

/**
 * Servicio para manejar movimientos financieros
 */
class MovementService {
  constructor() {
    this.STORAGE_KEY = 'financial-movements';
  }

  /**
   * Obtener todos los movimientos
   */
  getMovements() {
    const result = safeLocalStorage.getItem(this.STORAGE_KEY);
    return result.success ? result.data : [];
  }

  /**
   * Guardar movimientos
   */
  saveMovements(movements) {
    const result = safeLocalStorage.setItem(this.STORAGE_KEY, movements);
    if (!result.success) {
      console.error('Error guardando movimientos:', result.error);
    }
    return result.success;
  }

  /**
   * Agregar un movimiento
   */
  addMovement(movement) {
    const movements = this.getMovements();
    const newMovement = {
      ...movement,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    movements.push(newMovement);
    this.saveMovements(movements);
    return newMovement;
  }

  /**
   * Actualizar un movimiento
   */
  updateMovement(id, updates) {
    const movements = this.getMovements();
    const index = movements.findIndex(m => m.id === id);
    if (index !== -1) {
      movements[index] = { ...movements[index], ...updates };
      this.saveMovements(movements);
      return movements[index];
    }
    return null;
  }

  /**
   * Eliminar un movimiento
   */
  deleteMovement(id) {
    const movements = this.getMovements();
    const filtered = movements.filter(m => m.id !== id);
    this.saveMovements(filtered);
    return filtered.length < movements.length;
  }

  /**
   * Buscar un movimiento por ID
   */
  getMovementById(id) {
    const movements = this.getMovements();
    return movements.find(m => m.id === id);
  }

  /**
   * Obtener movimientos por cliente
   */
  getMovementsByClient(clientId) {
    const movements = this.getMovements();
    return movements.filter(m => m.cliente === clientId);
  }

  /**
   * Obtener movimientos por rango de fechas
   */
  getMovementsByDateRange(startDate, endDate) {
    const movements = this.getMovements();
    return movements.filter(m => {
      const movDate = new Date(m.fecha);
      return movDate >= startDate && movDate <= endDate;
    });
  }
}

// Exportar instancia única
const movementService = new MovementService();
export default movementService;