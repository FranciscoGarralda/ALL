import React, { useState, useEffect } from 'react';
import { Package, TrendingUp, RefreshCw } from 'lucide-react';
import { formatAmountWithCurrency } from '../../shared/components/forms';
import { stockService } from '../../shared/services/stockService';
import { monedas } from '../../shared/constants';

function StockApp() {
  const [stock, setStock] = useState({});
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Cargar stock al montar
  useEffect(() => {
    loadStock();
  }, []);

  const loadStock = () => {
    const currentStock = stockService.getAllStock();
    setStock(currentStock);
    setLastUpdate(new Date());
  };

  // Obtener lista de monedas con stock
  const stockList = Object.entries(stock)
    .filter(([moneda, data]) => data.cantidad > 0 || data.costoPromedio > 0)
    .map(([moneda, data]) => ({
      moneda,
      ...data
    }))
    .sort((a, b) => a.moneda.localeCompare(b.moneda));

  // Calcular valor total del stock
  const valorTotal = stockList.reduce((total, item) => {
    return total + (item.cantidad * item.costoPromedio);
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-1 sm:p-2 lg:p-3 safe-top safe-bottom pt-24">
      <div className="w-full px-2 sm:px-3 lg:px-4 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-gray-800" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Stock de Divisas</h1>
                  <p className="text-sm text-gray-600">Inventario actual con costo promedio ponderado</p>
                </div>
              </div>
              <button
                onClick={loadStock}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Actualizar"
              >
                <RefreshCw size={20} />
              </button>
            </div>
          </div>

          {/* Resumen */}
          <div className="p-3 sm:p-4 lg:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Monedas en Stock</p>
                <p className="text-2xl font-bold text-gray-900">{stockList.length}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Valor Total (en pesos)</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatAmountWithCurrency(valorTotal, 'PESO')}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Última actualización</p>
                <p className="text-sm font-medium text-gray-900">
                  {lastUpdate.toLocaleString('es-AR')}
                </p>
              </div>
            </div>

            {/* Tabla de stock */}
            {stockList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                        Moneda
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                        Cantidad
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                        Costo Promedio
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                        Valor Total
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">
                        Última Operación
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockList.map((item) => {
                      const monedaInfo = monedas.find(m => m.value === item.moneda);
                      const valorItem = item.cantidad * item.costoPromedio;
                      
                      return (
                        <tr key={item.moneda} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{monedaInfo?.emoji || '💰'}</span>
                              <div>
                                <p className="font-medium text-gray-900">{item.moneda}</p>
                                <p className="text-xs text-gray-500">{monedaInfo?.label || item.moneda}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <p className="font-medium text-gray-900">
                              {item.cantidad.toLocaleString('es-AR', { 
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 4 
                              })}
                            </p>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <p className="font-medium text-gray-900">
                              {formatAmountWithCurrency(item.costoPromedio, 'PESO')}
                            </p>
                            <p className="text-xs text-gray-500">por unidad</p>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <p className="font-bold text-gray-900">
                              {formatAmountWithCurrency(valorItem, 'PESO')}
                            </p>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <p className="text-xs text-gray-500">
                              {item.ultimaActualizacion 
                                ? new Date(item.ultimaActualizacion).toLocaleDateString('es-AR')
                                : '-'
                              }
                            </p>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Package size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600">No hay stock registrado</p>
                <p className="text-sm text-gray-500 mt-2">
                  El stock se actualizará automáticamente con las operaciones de compra y venta
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Nota informativa */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <TrendingUp className="text-blue-600 mt-0.5" size={20} />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">¿Cómo funciona el Costo Promedio Ponderado?</p>
              <p>
                Cada vez que comprás divisas, el sistema recalcula automáticamente el costo promedio 
                considerando el stock anterior y la nueva compra. Cuando vendés, la utilidad se 
                calcula usando este costo promedio, dándote la ganancia real de la operación.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StockApp;