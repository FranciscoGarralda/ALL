import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  Target,
  Wallet,
  BarChart3,
  PieChart,
  Calculator,
  Calendar,
  Search,
  Package,
  TrendingDown,
  Activity,
  Clock
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FormInput, formatAmountWithCurrency } from '../base';

/** COMPONENTE PRINCIPAL DE ANÁLISIS DE UTILIDAD */
function UtilidadApp({ movements, onNavigate }) {
  const [selectedDate, setSelectedDate] = useState('');

  // Procesar movimientos para calcular WAC histórico y utilidad
  const processedMovements = useMemo(() => {
    const tempStockData = {}; // { currency: { cantidad, totalCostoEnMonedaTC, costoPromedio } }
    
    return movements
      .filter(mov => mov.operacion === 'TRANSACCIONES')
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
      .map(mov => {
        let gananciaCalculada = 0;

        const currency = mov.moneda; // Activo siendo comprado/vendido
        const currencyTC = mov.monedaTC; // Moneda del valor total de la transacción

        if (!tempStockData[currency]) {
          tempStockData[currency] = { 
            cantidad: 0, 
            totalCostoEnMonedaTC: 0, 
            costoPromedio: 0,
            monedaTCAsociada: currencyTC 
          };
        }

        const amount = parseFloat(mov.monto) || 0;
        const total = parseFloat(mov.total) || 0;

        if (mov.subOperacion === 'COMPRA') {
          // Acumular costo total y cantidad
          tempStockData[currency].totalCostoEnMonedaTC += total;
          tempStockData[currency].cantidad += amount;
          tempStockData[currency].monedaTCAsociada = currencyTC;
          
          // Actualizar costo promedio
          if (tempStockData[currency].cantidad > 0) {
            tempStockData[currency].costoPromedio = 
              tempStockData[currency].totalCostoEnMonedaTC / tempStockData[currency].cantidad;
          }
        } else if (mov.subOperacion === 'VENTA') {
          if (amount > tempStockData[currency].cantidad) {
            console.warn(`Stock insuficiente para vender ${amount} de ${currency} en ${mov.fecha}`);
          }

          const costoUnitarioEnMonedaTC = tempStockData[currency].costoPromedio;
          const costoTotalVenta = amount * costoUnitarioEnMonedaTC;

          // Utilidad = Ingreso - Costo
          gananciaCalculada = total - costoTotalVenta;

          // Actualizar stock
          tempStockData[currency].cantidad -= amount;
          tempStockData[currency].totalCostoEnMonedaTC -= costoTotalVenta;
          
          if (tempStockData[currency].cantidad <= 0) {
            tempStockData[currency].cantidad = 0;
            tempStockData[currency].totalCostoEnMonedaTC = 0;
            tempStockData[currency].costoPromedio = 0;
          }
        } else if (mov.subOperacion === 'ARBITRAJE' && mov.comision) {
          // Arbitraje: la utilidad es directamente la comisión
          gananciaCalculada = parseFloat(mov.comision);
        }

        return { ...mov, gananciaCalculada };
      });
  }, [movements]);

  // Calcular datos finales de stock después de todos los movimientos
  const finalStockData = useMemo(() => {
    const stockData = {};
    
    processedMovements.forEach(mov => {
      if (mov.operacion === 'TRANSACCIONES') {
        const currency = mov.moneda;
        const currencyTC = mov.monedaTC;

        if (!stockData[currency]) {
          stockData[currency] = { 
            cantidad: 0, 
            totalCostoEnMonedaTC: 0, 
            costoPromedio: 0, 
            utilidadPorVenta: 0,
            utilidadPorArbitraje: 0,
            monedaTCAsociada: currencyTC 
          };
        }

        const amount = parseFloat(mov.monto) || 0;
        const total = parseFloat(mov.total) || 0;

        if (mov.subOperacion === 'COMPRA') {
          stockData[currency].totalCostoEnMonedaTC += total;
          stockData[currency].cantidad += amount;
          stockData[currency].monedaTCAsociada = currencyTC;
          
          if (stockData[currency].cantidad > 0) {
            stockData[currency].costoPromedio = 
              stockData[currency].totalCostoEnMonedaTC / stockData[currency].cantidad;
          }
        } else if (mov.subOperacion === 'VENTA') {
          stockData[currency].utilidadPorVenta += mov.gananciaCalculada;

          const costoUnitarioEnMonedaTC = stockData[currency].costoPromedio;
          const costoTotalVenta = amount * costoUnitarioEnMonedaTC;

          stockData[currency].cantidad -= amount;
          stockData[currency].totalCostoEnMonedaTC -= costoTotalVenta;
          
          if (stockData[currency].cantidad <= 0) {
            stockData[currency].cantidad = 0;
            stockData[currency].totalCostoEnMonedaTC = 0;
            stockData[currency].costoPromedio = 0;
          }
        } else if (mov.subOperacion === 'ARBITRAJE') {
          stockData[currency].utilidadPorArbitraje += mov.gananciaCalculada;
        }
      }
    });
    
    return stockData;
  }, [processedMovements]);

  // Calcular utilidad total de arbitraje
  const arbitrageProfitData = useMemo(() => {
    const data = {};
    processedMovements.forEach(mov => {
      if (mov.operacion === 'TRANSACCIONES' && mov.subOperacion === 'ARBITRAJE' && mov.gananciaCalculada !== 0) {
        const currency = mov.moneda;
        data[currency] = (data[currency] || 0) + mov.gananciaCalculada;
      }
    });
    return data;
  }, [processedMovements]);

  // Utilidad total combinada
  const totalUtilityCombined = useMemo(() => {
    const totals = {};
    
    // Agregar utilidades por venta
    for (const currency in finalStockData) {
      const associatedMonedaTC = finalStockData[currency].monedaTCAsociada || currency;
      if (finalStockData[currency].utilidadPorVenta !== 0) {
        totals[associatedMonedaTC] = (totals[associatedMonedaTC] || 0) + finalStockData[currency].utilidadPorVenta;
      }
    }
    
    // Agregar utilidades por arbitraje
    for (const currency in arbitrageProfitData) {
      totals[currency] = (totals[currency] || 0) + arbitrageProfitData[currency];
    }
    
    return totals;
  }, [finalStockData, arbitrageProfitData]);

  // Calcular utilidad mensual para gráficos
  const monthlyUtilityCombined = useMemo(() => {
    const monthly = {};

    processedMovements.forEach(mov => {
      if (mov.gananciaCalculada !== 0) {
        const date = new Date(mov.fecha);
        const yearMonth = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        const currencyForUtility = mov.subOperacion === 'VENTA' ? (mov.monedaTC || mov.moneda) : mov.moneda;
        
        let key = '';
        if (mov.subOperacion === 'VENTA') {
          key = `${currencyForUtility}_VENTA`;
        } else if (mov.subOperacion === 'ARBITRAJE') {
          key = `${currencyForUtility}_ARBITRAJE`;
        }

        if (key) {
          if (!monthly[yearMonth]) {
            monthly[yearMonth] = {};
          }
          monthly[yearMonth][key] = (monthly[yearMonth][key] || 0) + mov.gananciaCalculada;
        }
      }
    });

    const chartData = Object.entries(monthly).map(([month, currencies]) => {
      const data = { name: month };
      for (const currencyKey in currencies) {
        data[currencyKey] = currencies[currencyKey];
      }
      return data;
    }).sort((a, b) => a.name.localeCompare(b.name));

    return chartData;
  }, [processedMovements]);

  // Utilidad para fecha seleccionada
  const dailyUtilityForSelectedDate = useMemo(() => {
    if (!selectedDate) return { venta: {}, arbitraje: {} };
    const dailyVenta = {};
    const dailyArbitraje = {};

    processedMovements
      .filter(mov => mov.fecha === selectedDate && mov.gananciaCalculada !== 0)
      .forEach(mov => {
        const currencyForUtility = mov.subOperacion === 'VENTA' ? (mov.monedaTC || mov.moneda) : mov.moneda;
        if (mov.subOperacion === 'VENTA') {
          dailyVenta[currencyForUtility] = (dailyVenta[currencyForUtility] || 0) + mov.gananciaCalculada;
        } else if (mov.subOperacion === 'ARBITRAJE') {
          dailyArbitraje[currencyForUtility] = (dailyArbitraje[currencyForUtility] || 0) + mov.gananciaCalculada;
        }
      });
    
    return { venta: dailyVenta, arbitraje: dailyArbitraje };
  }, [processedMovements, selectedDate]);

  // Utilidad del mes actual
  const currentMonthUtility = useMemo(() => {
    const currentYearMonth = new Date().toISOString().substring(0, 7);
    const monthlyVenta = {};
    const monthlyArbitraje = {};

    processedMovements
      .filter(mov => mov.fecha && mov.fecha.substring(0, 7) === currentYearMonth && mov.gananciaCalculada !== 0)
      .forEach(mov => {
        const currencyForUtility = mov.subOperacion === 'VENTA' ? (mov.monedaTC || mov.moneda) : mov.moneda;
        if (mov.subOperacion === 'VENTA') {
          monthlyVenta[currencyForUtility] = (monthlyVenta[currencyForUtility] || 0) + mov.gananciaCalculada;
        } else if (mov.subOperacion === 'ARBITRAJE') {
          monthlyArbitraje[currencyForUtility] = (monthlyArbitraje[currencyForUtility] || 0) + mov.gananciaCalculada;
        }
      });
    
    return { venta: monthlyVenta, arbitraje: monthlyArbitraje };
  }, [processedMovements]);

  // Utilidad de hoy
  const todayUtility = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const dailyVenta = {};
    const dailyArbitraje = {};

    processedMovements
      .filter(mov => mov.fecha === today && mov.gananciaCalculada !== 0)
      .forEach(mov => {
        const currencyForUtility = mov.subOperacion === 'VENTA' ? (mov.monedaTC || mov.moneda) : mov.moneda;
        if (mov.subOperacion === 'VENTA') {
          dailyVenta[currencyForUtility] = (dailyVenta[currencyForUtility] || 0) + mov.gananciaCalculada;
        } else if (mov.subOperacion === 'ARBITRAJE') {
          dailyArbitraje[currencyForUtility] = (dailyArbitraje[currencyForUtility] || 0) + mov.gananciaCalculada;
        }
      });
    
    return { venta: dailyVenta, arbitraje: dailyArbitraje };
  }, [processedMovements]);

  // Obtener todas las monedas en utilidad
  const allCurrenciesInUtility = useMemo(() => {
    const currencies = new Set();
    processedMovements.forEach(mov => {
      if (mov.gananciaCalculada !== 0) {
        currencies.add(mov.subOperacion === 'VENTA' ? (mov.monedaTC || mov.moneda) : mov.moneda);
      }
    });
    return Array.from(currencies).sort();
  }, [processedMovements]);

  // Función para obtener colores para cada moneda/tipo
  const getUtilityColor = (currencyType, index) => {
    const colors = [
      '#10B981', // Verde para VENTA
      '#3B82F6', // Azul para ARBITRAJE
      '#F59E0B', // Amarillo
      '#EF4444', // Rojo
      '#8B5CF6', // Violeta
      '#F97316', // Naranja
    ];
    return colors[index % colors.length];
  };

  // Función para renderizar cards de métricas
  const renderMetricCard = (title, data, bgColor, textColor, borderColor, icon, subtitle = '') => (
    <div className={`card ${bgColor} border-l-4 ${borderColor} p-4 sm:p-6`}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {React.createElement(icon, { size: 20, className: `${textColor} opacity-80 flex-shrink-0` })}
            <h3 className={`text-sm font-semibold ${textColor} truncate`}>{title}</h3>
          </div>
          {subtitle && (
            <p className={`text-xs ${textColor} opacity-75 mb-2`}>{subtitle}</p>
          )}
          {Object.entries(data).length > 0 ? (
            <div className="space-y-1">
              {Object.entries(data).map(([currency, amount]) => (
                <p key={currency} className={`text-lg sm:text-xl font-bold ${amount < 0 ? 'text-error-600' : textColor} truncate`}>
                  {formatAmountWithCurrency(amount, currency)}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-base sm:text-lg text-gray-500 font-medium">Sin datos</p>
          )}
        </div>
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${bgColor} bg-opacity-20 flex items-center justify-center flex-shrink-0`}>
          {React.createElement(icon, { size: 20, className: `sm:w-6 sm:h-6 ${textColor} opacity-40` })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6 safe-top safe-bottom lg:pt-6 pt-16">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="card">
          <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-100">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <TrendingUp size={20} className="sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-emerald-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 truncate">
                    Análisis de Utilidad
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Dashboard completo con sistema WAC • {processedMovements.length} transaccion{processedMovements.length !== 1 ? 'es' : ''} procesada{processedMovements.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => onNavigate('nuevoMovimiento')} 
                className="btn-primary flex items-center justify-center gap-2 touch-target w-full sm:w-auto"
              >
                <Activity size={18} />
                <span>Nueva Transacción</span>
              </button>
            </div>
          </div>

          {/* Métricas principales */}
          <div className="p-3 sm:p-4 lg:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-4 sm:mb-6">
              Métricas Principales
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {renderMetricCard(
                'Utilidad Total Histórica',
                totalUtilityCombined,
                'bg-emerald-50',
                'text-emerald-700',
                'border-emerald-500',
                Target,
                'Ventas + Arbitraje acumulado'
              )}
              
              {renderMetricCard(
                'Utilidad del Mes Actual',
                Object.keys(currentMonthUtility.venta).length > 0 || Object.keys(currentMonthUtility.arbitraje).length > 0 
                  ? { ...currentMonthUtility.venta, ...currentMonthUtility.arbitraje }
                  : {},
                'bg-primary-50',
                'text-primary-700',
                'border-primary-500',
                Calendar,
                'Mes en curso'
              )}

              {renderMetricCard(
                'Utilidad de Hoy',
                Object.keys(todayUtility.venta).length > 0 || Object.keys(todayUtility.arbitraje).length > 0 
                  ? { ...todayUtility.venta, ...todayUtility.arbitraje }
                  : {},
                'bg-indigo-50',
                'text-indigo-700',
                'border-indigo-500',
                Clock,
                'Día actual'
              )}
            </div>
          </div>
        </div>

        {/* Buscador de utilidad por día */}
        <div className="card">
          <div className="p-3 sm:p-4 lg:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-4 sm:mb-6 flex items-center gap-2">
              <Search size={18} className="text-purple-600 flex-shrink-0" />
              <span>Buscar Utilidad por Fecha</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <FormInput
                  label="Seleccionar Fecha"
                  type="date"
                  value={selectedDate}
                  onChange={setSelectedDate}
                  name="searchDate"
                />
              </div>
              
              <div className="flex items-end">
                {selectedDate && (Object.entries(dailyUtilityForSelectedDate.venta).length > 0 || Object.entries(dailyUtilityForSelectedDate.arbitraje).length > 0) ? (
                  <div className="bg-purple-50 p-3 sm:p-4 rounded-lg w-full">
                    <p className="text-xs sm:text-sm font-medium text-purple-700 mb-2">
                      Utilidad para {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-ES', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}:
                    </p>
                    <div className="space-y-1">
                      {Object.entries(dailyUtilityForSelectedDate.venta).map(([currency, amount]) => (
                        <p key={`${currency}-venta`} className={`text-xs sm:text-sm font-bold ${amount >= 0 ? 'text-emerald-800' : 'text-error-800'}`}>
                          {currency} (Venta): {formatAmountWithCurrency(amount, currency)}
                        </p>
                      ))}
                      {Object.entries(dailyUtilityForSelectedDate.arbitraje).map(([currency, amount]) => (
                        <p key={`${currency}-arbitraje`} className={`text-xs sm:text-sm font-bold ${amount >= 0 ? 'text-emerald-800' : 'text-error-800'}`}>
                          {currency} (Arbitraje): {formatAmountWithCurrency(amount, currency)}
                        </p>
                      ))}
                    </div>
                  </div>
                ) : selectedDate ? (
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg w-full text-center">
                    <p className="text-xs sm:text-sm text-gray-500">No hay utilidad para la fecha seleccionada</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg w-full text-center">
                    <p className="text-xs sm:text-sm text-gray-400">Selecciona una fecha para ver la utilidad</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stock y valuación actual */}
        <div className="card">
          <div className="p-3 sm:p-4 lg:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-4 sm:mb-6 flex items-center gap-2">
              <Package size={18} className="text-warning-600 flex-shrink-0" />
              <span>Stock Actual y Valuación (Sistema WAC)</span>
            </h2>
            
            {Object.keys(finalStockData).length > 0 ? (
              <>
                {/* Tabla para desktop */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Activo
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cantidad en Stock
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Costo Promedio (WAC)
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Valuación Total
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Utilidad Realizada
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Object.entries(finalStockData).map(([currency, data]) => (
                        <tr key={currency} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                                <Wallet size={16} className="text-warning-600" />
                              </div>
                              <span className="text-sm font-medium text-gray-900">{currency}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                            {formatAmountWithCurrency(data.cantidad, currency)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-700">
                            {data.costoPromedio > 0 ? formatAmountWithCurrency(data.costoPromedio, data.monedaTCAsociada || currency) : '-'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium text-primary-600">
                            {data.cantidad > 0 ? formatAmountWithCurrency(data.cantidad * data.costoPromedio, data.monedaTCAsociada || currency) : '-'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="space-y-1">
                              {data.utilidadPorVenta !== 0 && (
                                <div className="text-emerald-600">
                                  V: {formatAmountWithCurrency(data.utilidadPorVenta, data.monedaTCAsociada || currency)}
                                </div>
                              )}
                              {data.utilidadPorArbitraje !== 0 && (
                                <div className="text-primary-600">
                                  A: {formatAmountWithCurrency(data.utilidadPorArbitraje, currency)}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Cards para mobile */}
                <div className="sm:hidden space-y-3">
                  {Object.entries(finalStockData).map(([currency, data]) => (
                    <div key={currency} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 bg-warning-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Wallet size={14} className="text-warning-600" />
                        </div>
                        <h3 className="font-medium text-gray-900 text-sm truncate flex-1">{currency}</h3>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-500 text-xs">Stock</p>
                          <p className="font-medium">{formatAmountWithCurrency(data.cantidad, currency)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Costo WAC</p>
                          <p className="font-medium">
                            {data.costoPromedio > 0 ? formatAmountWithCurrency(data.costoPromedio, data.monedaTCAsociada || currency) : '-'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t border-gray-200 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">Valuación</span>
                          <span className="font-medium text-primary-600 text-sm">
                            {data.cantidad > 0 ? formatAmountWithCurrency(data.cantidad * data.costoPromedio, data.monedaTCAsociada || currency) : '-'}
                          </span>
                        </div>
                        {(data.utilidadPorVenta !== 0 || data.utilidadPorArbitraje !== 0) && (
                          <div className="mt-1 space-y-1">
                            {data.utilidadPorVenta !== 0 && (
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Util. Venta</span>
                                <span className="text-emerald-600 font-medium">
                                  {formatAmountWithCurrency(data.utilidadPorVenta, data.monedaTCAsociada || currency)}
                                </span>
                              </div>
                            )}
                            {data.utilidadPorArbitraje !== 0 && (
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Util. Arbitraje</span>
                                <span className="text-primary-600 font-medium">
                                  {formatAmountWithCurrency(data.utilidadPorArbitraje, currency)}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <Package size={40} className="sm:w-12 sm:h-12 mx-auto text-gray-300 mb-3 sm:mb-4" />
                <p className="text-sm sm:text-base text-gray-500">No hay stock para mostrar</p>
              </div>
            )}
          </div>
        </div>

        {/* Gráfico de utilidad mensual */}
        <div className="card">
          <div className="p-3 sm:p-4 lg:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-4 sm:mb-6 flex items-center gap-2">
              <BarChart3 size={18} className="text-teal-600 flex-shrink-0" />
              <span>Tendencia de Utilidad Mensual</span>
            </h2>
            
            {monthlyUtilityCombined.length > 0 ? (
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyUtilityCombined}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => {
                        const [year, month] = value.split('-');
                        return `${month}/${year.substring(2)}`;
                      }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value, name) => [
                        formatAmountWithCurrency(value, name.split('_')[0]), 
                        name.split('_')[1]
                      ]}
                      labelFormatter={(label) => {
                        const [year, month] = label.split('-');
                        const date = new Date(year, month - 1);
                        return date.toLocaleDateString('es-ES', { 
                          year: 'numeric', 
                          month: 'long' 
                        });
                      }}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Legend />
                    {allCurrenciesInUtility.map((currency, index) => (
                      <React.Fragment key={currency}>
                        <Bar 
                          dataKey={`${currency}_VENTA`} 
                          stackId="a" 
                          fill={getUtilityColor(`${currency}_VENTA`, index * 2)}
                          name={`${currency} (Venta)`}
                        />
                        <Bar 
                          dataKey={`${currency}_ARBITRAJE`} 
                          stackId="a" 
                          fill={getUtilityColor(`${currency}_ARBITRAJE`, index * 2 + 1)}
                          name={`${currency} (Arbitraje)`}
                        />
                      </React.Fragment>
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <PieChart size={40} className="sm:w-12 sm:h-12 mx-auto text-gray-300 mb-3 sm:mb-4" />
                <p className="text-sm sm:text-base text-gray-500">No hay datos de utilidad mensuales para graficar.</p>
              </div>
            )}
          </div>
        </div>

        {/* Información adicional */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="card">
            <div className="p-3 sm:p-4 lg:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 sm:mb-4 flex items-center gap-2">
                <Calculator size={16} className="text-primary-600" />
                Metodología WAC
              </h3>
              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                <p>• <strong>Costo Promedio Ponderado:</strong> Se actualiza con cada compra</p>
                <p>• <strong>Ganancia en Ventas:</strong> Precio venta - Costo promedio actual</p>
                <p>• <strong>Arbitraje:</strong> Utilidad directa de comisiones</p>
                <p>• <strong>Stock Actual:</strong> Valuado a costo promedio histórico</p>
                <p>• <strong>Procesamiento:</strong> Cronológico para precisión contable</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="p-3 sm:p-4 lg:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 sm:mb-4 flex items-center gap-2">
                <Target size={16} className="text-emerald-600" />
                KPIs Principales
              </h3>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600">Transacciones procesadas:</span>
                  <span className="font-semibold text-gray-900 text-sm sm:text-base">{processedMovements.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600">Activos en portfolio:</span>
                  <span className="font-semibold text-gray-900 text-sm sm:text-base">{Object.keys(finalStockData).length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600">Monedas operadas:</span>
                  <span className="font-semibold text-gray-900 text-sm sm:text-base">{allCurrenciesInUtility.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600">Meses con actividad:</span>
                  <span className="font-semibold text-gray-900 text-sm sm:text-base">{monthlyUtilityCombined.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estado vacío si no hay transacciones */}
        {processedMovements.length === 0 && (
          <div className="card">
            <div className="p-6 sm:p-8 lg:p-12 text-center">
              <TrendingDown size={48} className="sm:w-16 sm:h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
                No hay transacciones para analizar
              </h3>
              <p className="text-sm sm:text-base text-gray-500 mb-6">
                Las utilidades aparecerán aquí cuando se registren operaciones de compra, venta o arbitraje.
              </p>
              <button
                onClick={() => onNavigate('nuevoMovimiento')}
                className="btn-primary touch-target"
              >
                Registrar nueva transacción
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UtilidadApp;