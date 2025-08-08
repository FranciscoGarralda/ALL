import { safeLocalStorage } from './safeOperations';

/**
 * Servicio para manejar cierres de caja
 */
class CajaService {
  constructor() {
    this.STORAGE_KEY = 'financial-caja-cierres';
    this.cierres = {};
    // Solo cargar datos si estamos en el cliente
    if (typeof window !== 'undefined') {
      this.loadCierres();
    }
  }

  /**
   * Cargar cierres desde localStorage
   */
  loadCierres() {
    const result = safeLocalStorage.getItem(this.STORAGE_KEY);
    this.cierres = (result && result.success) ? result.data : {};
  }

  /**
   * Guardar cierres en localStorage
   */
  saveCierres() {
    const result = safeLocalStorage.setItem(this.STORAGE_KEY, this.cierres);
    if (!result.success) {
      console.error('Error guardando cierres:', result.error);
    }
  }

  /**
   * Asegurar que los datos estén cargados
   */
  ensureLoaded() {
    if (typeof window !== 'undefined' && (!this.cierres || Object.keys(this.cierres).length === 0)) {
      this.loadCierres();
    }
  }

  /**
   * Obtener el cierre de una fecha específica
   */
  getCierre(fecha) {
    this.ensureLoaded();
    if (!this.cierres || typeof this.cierres !== 'object') {
      return null;
    }
    return this.cierres[fecha] || null;
  }

  /**
   * Obtener la apertura para una fecha (cierre del día anterior)
   */
  getApertura(fecha) {
    const fechaAnterior = this.getFechaAnterior(fecha);
    const cierreAnterior = this.getCierre(fechaAnterior);
    
    if (!cierreAnterior) return {};
    
    // La apertura es el conteo del cierre anterior
    const apertura = {};
    Object.entries(cierreAnterior.conteos || {}).forEach(([key, valor]) => {
      apertura[key] = valor;
    });
    
    return apertura;
  }

  /**
   * Guardar un cierre de caja
   */
  guardarCierre(fecha, conteos, resumen, usuario = 'Sistema') {
    if (!this.cierres || typeof this.cierres !== 'object') {
      this.cierres = {};
    }
    
    this.cierres[fecha] = {
      fecha,
      conteos, // { "USD-efectivo": 1500, "PESO-efectivo": 50000, etc }
      resumen,  // { totalEfectivo, totalDigital, diferencias, etc }
      usuario,
      timestamp: new Date().toISOString()
    };
    
    this.saveCierres();
  }

  /**
   * Obtener fecha anterior
   */
  getFechaAnterior(fecha) {
    const date = new Date(fecha);
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0];
  }

  /**
   * Obtener últimos N cierres
   */
  getUltimosCierres(cantidad = 7) {
    if (!this.cierres || typeof this.cierres !== 'object') {
      return [];
    }
    const fechas = Object.keys(this.cierres).sort().reverse();
    return fechas.slice(0, cantidad).map(fecha => this.cierres[fecha]);
  }

  /**
   * Verificar si hay cierre para una fecha
   */
  hayCierre(fecha) {
    if (!this.cierres || typeof this.cierres !== 'object') {
      return false;
    }
    return !!this.cierres[fecha];
  }

  /**
   * Eliminar un cierre (solo para casos especiales)
   */
  eliminarCierre(fecha) {
    if (!this.cierres || typeof this.cierres !== 'object') {
      return;
    }
    delete this.cierres[fecha];
    this.saveCierres();
  }
}

// Exportar instancia única
const cajaService = new CajaService();
export default cajaService;