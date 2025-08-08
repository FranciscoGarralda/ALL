import { safeLocalStorage, safeParseFloat } from './safeOperations';

/**
 * Servicio para manejar el stock global de monedas y su costo promedio ponderado
 */
class StockService {
  constructor() {
    this.STOCK_KEY = 'financial-stock';
    this.stock = {};
    // Solo cargar datos si estamos en el cliente
    if (typeof window !== 'undefined') {
      this.loadStock();
    }
  }

  /**
   * Cargar stock desde localStorage
   */
  loadStock() {
    const result = safeLocalStorage.getItem(this.STOCK_KEY);
    this.stock = (result && result.success) ? result.data : {};
  }

  /**
   * Guardar stock en localStorage
   */
  saveStock() {
    const result = safeLocalStorage.setItem(this.STOCK_KEY, this.stock);
    if (!result.success) {
      console.error('Error saving stock:', result.error);
    }
  }

  /**
   * Obtiene el stock actual de una moneda
   */
  getStock(moneda) {
    if (!this.stock[moneda]) {
      this.stock[moneda] = {
        cantidad: 0,
        costoPromedio: 0,
        ultimaActualizacion: null
      };
    }
    return this.stock[moneda];
  }

  /**
   * Actualiza el stock después de una compra
   * Recalcula el costo promedio ponderado
   */
  registrarCompra(moneda, cantidad, costoUnitario) {
    const stockActual = this.getStock(moneda);
    const cantidadAnterior = safeParseFloat(stockActual.cantidad);
    const costoAnterior = safeParseFloat(stockActual.costoPromedio);
    const nuevaCantidad = safeParseFloat(cantidad);
    const nuevoCosto = safeParseFloat(costoUnitario);

    // Calcular nuevo costo promedio ponderado
    const totalAnterior = cantidadAnterior * costoAnterior;
    const totalNuevo = nuevaCantidad * nuevoCosto;
    const cantidadTotal = cantidadAnterior + nuevaCantidad;
    
    const nuevoCostoPromedio = cantidadTotal > 0 
      ? (totalAnterior + totalNuevo) / cantidadTotal 
      : nuevoCosto;

    // Actualizar stock
    this.stock[moneda] = {
      cantidad: cantidadTotal,
      costoPromedio: nuevoCostoPromedio,
      ultimaActualizacion: new Date().toISOString()
    };

    this.saveStock();
    return this.stock[moneda];
  }

  /**
   * Registra una venta y calcula la utilidad
   * Retorna la utilidad calculada
   */
  registrarVenta(moneda, cantidad, precioVenta) {
    const stockActual = this.getStock(moneda);
    const cantidadVendida = safeParseFloat(cantidad);
    const precio = safeParseFloat(precioVenta);
    const costoPromedio = safeParseFloat(stockActual.costoPromedio);
    
    // Calcular utilidad
    const utilidadPorUnidad = precio - costoPromedio;
    const utilidadTotal = utilidadPorUnidad * cantidadVendida;
    const utilidadPorcentaje = costoPromedio > 0 
      ? (utilidadPorUnidad / costoPromedio) * 100 
      : 0;

    // Actualizar cantidad en stock
    const nuevaCantidad = safeParseFloat(stockActual.cantidad) - cantidadVendida;
    
    this.stock[moneda] = {
      ...stockActual,
      cantidad: Math.max(0, nuevaCantidad),
      ultimaActualizacion: new Date().toISOString()
    };

    this.saveStock();

    return {
      utilidadTotal,
      utilidadPorUnidad,
      utilidadPorcentaje,
      costoPromedio,
      cantidadVendida
    };
  }

  /**
   * Obtiene todo el stock actual
   */
  getAllStock() {
    return this.stock || {};
  }

  /**
   * Limpia todo el stock (usar con cuidado)
   */
  clearAllStock() {
    this.stock = {};
    this.saveStock();
  }
}

// Exportar instancia única
const stockService = new StockService();
export default stockService;