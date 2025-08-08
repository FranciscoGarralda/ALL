import { safeLocalStorage, safeParseFloat } from './safeOperations';

/**
 * Servicio para manejar saldos iniciales de Cuentas Corrientes
 * IMPORTANTE: Estos saldos NO afectan el stock, solo las deudas
 */
class CCInitialBalanceService {
  constructor() {
    this.STORAGE_KEY = 'financial-cc-initial-balances';
    this.balances = {};
    this.loadBalances();
  }

  /**
   * Cargar saldos desde localStorage
   */
  loadBalances() {
    const result = safeLocalStorage.getItem(this.STORAGE_KEY);
    this.balances = (result && result.success) ? result.data : {};
  }

  /**
   * Guardar saldos en localStorage
   */
  saveBalances() {
    const result = safeLocalStorage.setItem(this.STORAGE_KEY, this.balances);
    if (!result.success) {
      console.error('Error guardando saldos CC:', result.error);
    }
  }

  /**
   * Obtener saldo inicial de un proveedor y moneda
   */
  getBalance(proveedor, moneda) {
    if (!this.balances || typeof this.balances !== 'object') {
      return 0;
    }
    const key = `${proveedor}-${moneda}`;
    return safeParseFloat(this.balances[key], 0);
  }

  /**
   * Establecer saldo inicial
   * Negativo = les debemos, Positivo = nos deben
   */
  setBalance(proveedor, moneda, monto) {
    const key = `${proveedor}-${moneda}`;
    const amount = safeParseFloat(monto, 0);
    
    if (amount === 0) {
      delete this.balances[key];
    } else {
      this.balances[key] = amount;
    }
    
    this.saveBalances();
  }

  /**
   * Obtener todos los saldos agrupados por proveedor
   */
  getAllBalancesByProveedor() {
    const grouped = {};
    
    if (!this.balances || typeof this.balances !== 'object') {
      return grouped;
    }
    
    Object.entries(this.balances).forEach(([key, monto]) => {
      const [proveedor, moneda] = key.split('-');
      if (!grouped[proveedor]) {
        grouped[proveedor] = {};
      }
      grouped[proveedor][moneda] = monto;
    });
    
    return grouped;
  }

  /**
   * Obtener todos los saldos
   */
  getAllBalances() {
    return { ...this.balances };
  }

  /**
   * Limpiar todos los saldos
   */
  clearAllBalances() {
    this.balances = {};
    this.saveBalances();
  }
}

// Exportar instancia única
const ccInitialBalanceService = new CCInitialBalanceService();
export default ccInitialBalanceService;