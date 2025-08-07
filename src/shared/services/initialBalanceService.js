import { safeParseFloat } from './safeOperations';

/**
 * Servicio para manejar saldos iniciales por cuenta
 */
class InitialBalanceService {
  constructor() {
    this.BALANCE_KEY = 'saldos_iniciales';
    this.loadBalances();
  }

  /**
   * Carga los saldos iniciales desde localStorage
   */
  loadBalances() {
    try {
      const saved = localStorage.getItem(this.BALANCE_KEY);
      this.balances = saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('Error loading initial balances:', error);
      this.balances = {};
    }
  }

  /**
   * Guarda los saldos en localStorage
   */
  saveBalances() {
    try {
      localStorage.setItem(this.BALANCE_KEY, JSON.stringify(this.balances));
    } catch (error) {
      console.error('Error saving initial balances:', error);
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
   * Obtiene todos los saldos iniciales agrupados por cuenta
   */
  getAllBalancesByCuenta() {
    const result = {};
    
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
    return this.balances;
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
export const initialBalanceService = new InitialBalanceService();