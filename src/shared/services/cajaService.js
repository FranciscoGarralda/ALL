import { safeLocalStorage } from './safeOperations';

/**
 * Servicio para manejar cierres de caja
 */
class CajaService {
  constructor() {
    this.STORAGE_KEY = 'financial-caja-cierres';
    this.cierres = this.loadCierres();
  }

  /**
   * Cargar cierres desde localStorage
   */
  loadCierres() {
    const result = safeLocalStorage.getItem(this.STORAGE_KEY);
    return result.success ? result.data : {};
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
   * Obtener el cierre de una fecha específica
   */
  getCierre(fecha) {
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
    this.cierres[fecha] = {
      fecha,
      conteos, // { "USD-efectivo": 1500, "PESO-efectivo": 50000, etc }
      resumen, // Resumen calculado del día
      usuario,
      fechaHora: new Date().toISOString(),
      timestamp: Date.now()
    };
    
    this.saveCierres();
    return this.cierres[fecha];
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
    const fechas = Object.keys(this.cierres).sort().reverse();
    return fechas.slice(0, cantidad).map(fecha => this.cierres[fecha]);
  }

  /**
   * Verificar si hay cierre para una fecha
   */
  hayCierre(fecha) {
    return !!this.cierres[fecha];
  }

  /**
   * Eliminar un cierre (solo para casos especiales)
   */
  eliminarCierre(fecha) {
    delete this.cierres[fecha];
    this.saveCierres();
  }
}

// Exportar instancia única
const cajaService = new CajaService();
export default cajaService;