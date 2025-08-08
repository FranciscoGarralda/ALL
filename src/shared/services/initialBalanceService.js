import { safeLocalStorage, safeParseFloat } from './safeOperations';

/**
 * Servicio para manejar saldos iniciales por cuenta
 */
class InitialBalanceService {
  constructor() {
    this.BALANCE_KEY = 'financial-initial-balances';
    this.balances = {};
    // Solo cargar datos si estamos en el cliente
    if (typeof window !== 'undefined') {
      this.loadBalances();
    }
  }

  /**
   * Cargar saldos desde localStorage
   */
  loadBalances() {
    const result = safeLocalStorage.getItem(this.BALANCE_KEY);
    this.balances = (result && result.success) ? result.data : {};
  }

  /**
   * Guardar saldos en localStorage
   */
  saveBalances() {
    const result = safeLocalStorage.setItem(this.BALANCE_KEY, this.balances);
    if (!result.success) {
      console.error('Error saving initial balances:', result.error);
    }
  }

  /**
   * Obtiene el saldo inicial de una cuenta específica
   */
  getBalance(cuenta, moneda) {
    const key = `${cuenta}-${moneda}`;
    return safeParseFloat(this.balances[key], 0);
  }

  /**
   * Establece el saldo inicial de una cuenta
   */
  setBalance(cuenta, moneda, monto) {
    const key = `${cuenta}-${moneda}`;
    this.balances[key] = safeParseFloat(monto, 0);
    this.saveBalances();
  }

  /**
   * Obtiene todos los saldos agrupados por cuenta
   */
  getAllBalancesByCuenta() {
    const result = {};
    
    if (!this.balances || typeof this.balances !== 'object') {
      return result;
    }
    
    Object.entries(this.balances).forEach(([key, value]) => {
      const [cuenta, moneda] = key.split('-');
      if (!result[cuenta]) {
        result[cuenta] = {};
      }
      result[cuenta][moneda] = value;
    });
    
    return result;
  }

  /**
   * Obtiene todos los saldos iniciales
   */
  getAllBalances() {
    return this.balances || {};
  }

  /**
   * Limpia todos los saldos iniciales
   */
  clearAllBalances() {
    this.balances = {};
    this.saveBalances();
  }
}

// Exportar instancia única
const initialBalanceService = new InitialBalanceService();
export default initialBalanceService;