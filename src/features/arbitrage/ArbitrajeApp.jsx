import React, { useState, useMemo } from 'react';
import {
  ArrowUpDown,
  TrendingUp,
  Target,
  BarChart3,
  Search,
  Calendar,
  User,
  DollarSign,
  PieChart,
  Activity,
  TrendingDown,
  Calculator,
  Clock
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';
import { formatAmountWithCurrency } from '../../shared/components/forms';
import { safeParseFloat } from '../../shared/services/safeOperations';

/** COMPONENTE PRINCIPAL DE ANÁLISIS DE ARBITRAJE */
function ArbitrajeApp({ movements, onNavigate }) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar movimientos para mostrar solo arbitraje
  const arbitrageMovements = useMemo(() => {
    return movements.filter(mov => 
      mov.operacion === 'TRANSACCIONES' && 
      mov.subOperacion === 'ARBITRAJE'
    );
  }, [movements]);

  // Calcular ganancias totales de arbitraje por moneda TC (donde va la comisión)
  const totalArbitrageProfits = useMemo(() => {
    const totals = {};
    arbitrageMovements.forEach(mov => {
      if (mov.comision && safeParseFloat(mov.comision) !== 0) {
        // La comisión se calcula en la moneda del TC de venta (donde se deposita la ganancia)
        const currency = mov.monedaTCVenta || mov.monedaTC || 'ARS';
        totals[currency] = (totals[currency] || 0) + safeParseFloat(mov.comision);
      }
    });
    return totals;
  }, [arbitrageMovements]);

  // Calcular ganancias mensuales de arbitraje para gráficos
  const monthlyArbitrageProfits = useMemo(() => {
    const monthly = {};

    arbitrageMovements.forEach(mov => {
      if (mov.fecha) {
        const date = new Date(mov.fecha);
        const yearMonth = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        const currency = mov.moneda;

        if (!monthly[yearMonth]) {
          monthly[yearMonth] = {};
        }
        if (currency) {
          monthly[yearMonth][currency] = (monthly[yearMonth][currency] || 0) + safeParseFloat(mov.comision);
        }
      }
    });

    const chartData = Object.entries(monthly).map(([month, currencies]) => {
      const data = { name: month };
      for (const currency in currencies) {
        data[currency] = currencies[currency];
      }
      return data;
    }).sort((a, b) => a.name.localeCompare(b.name));

    return chartData;
  }, [arbitrageMovements]);

  // Calcular ganancias del mes actual
  const currentMonthArbitrageProfits = useMemo(() => {
    const currentYearMonth = new Date().toISOString().substring(0, 7);
    const monthly = {};

    arbitrageMovements.forEach(mov => {
      if (mov.fecha && mov.fecha.substring(0, 7) === currentYearMonth) {
        const currency = mov.moneda;
        if (currency) {
          monthly[currency] = (monthly[currency] || 0) + safeParseFloat(mov.comision);
        }
      }
    });
    return monthly;
  }, [arbitrageMovements]);

  // Calcular ganancias de hoy
  const todayArbitrageProfits = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const daily = {};

    arbitrageMovements.forEach(mov => {
      if (mov.fecha === today) {
        const currency = mov.moneda;
        if (currency) {
          daily[currency] = (daily[currency] || 0) + safeParseFloat(mov.comision);
        }
      }
    });
    return daily;
  }, [arbitrageMovements]);

  // Obtener todas las monedas en arbitraje
  const allCurrenciesInArbitrage = useMemo(() => {
    const currencies = new Set();
    arbitrageMovements.forEach(mov => {
      if (mov.moneda) {
        currencies.add(mov.moneda);
      }
    });
    return Array.from(currencies).sort();
  }, [arbitrageMovements]);

  // Filtrar movimientos de arbitraje por búsqueda
  const filteredArbitrageMovements = useMemo(() => {
    if (!searchTerm) {
      return arbitrageMovements.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }
    
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return arbitrageMovements.filter(mov =>
      (mov.cliente && mov.cliente.toLowerCase().includes(lowerCaseSearchTerm)) ||
      (mov.detalle && mov.detalle.toLowerCase().includes(lowerCaseSearchTerm)) ||
      (mov.moneda && mov.moneda.toLowerCase().includes(lowerCaseSearchTerm)) ||
      (mov.cuenta && mov.cuenta.toLowerCase().includes(lowerCaseSearchTerm))
    ).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [arbitrageMovements, searchTerm]);

  // Función para obtener colores para cada moneda
  const getArbitrageColor = (currency, index) => {
    const colors = [
      '#8B5CF6', // Violeta
      '#A855F7', // Púrpura
      '#9333EA', // Violeta oscuro
      '#7C3AED', // Índigo violeta
      '#6D28D9', // Púrpura oscuro
      '#5B21B6', // Violeta profundo
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
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6 safe-top safe-bottom pt-20">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="card">
          <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-100">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ArrowUpDown size={20} className="sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-indigo-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 truncate">
                    Análisis de Arbitraje
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Dashboard de operaciones de arbitraje • {arbitrageMovements.length} operacion{arbitrageMovements.length !== 1 ? 'es' : ''} registrada{arbitrageMovements.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => onNavigate('nuevoMovimiento')} 
                className="btn-primary flex items-center justify-center gap-2 touch-target w-full sm:w-auto"
              >
                <ArrowUpDown size={18} />
                <span>Nuevo Arbitraje</span>
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
                'Ganancias Totales por Arbitraje',
                totalArbitrageProfits,
                'bg-indigo-50',
                'text-indigo-700',
                'border-indigo-500',
                Target,
                'Acumulado histórico'
              )}
              
              {renderMetricCard(
                'Ganancias del Mes Actual',
                currentMonthArbitrageProfits,
                'bg-purple-50',
                'text-purple-700',
                'border-purple-500',
                Calendar,
                'Mes en curso'
              )}

              {renderMetricCard(
                'Ganancias de Hoy',
                todayArbitrageProfits,
                'bg-violet-50',
                'text-violet-700',
                'border-violet-500',
                Clock,
                'Día actual'
              )}
            </div>
          </div>
        </div>

        {/* Gráfico de ganancias mensuales por arbitraje */}
        <div className="card">
          <div className="p-3 sm:p-4 lg:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-4 sm:mb-6 flex items-center gap-2">
              <BarChart3 size={18} className="text-indigo-600 flex-shrink-0" />
              <span>Tendencia de Ganancias Mensuales por Arbitraje</span>
            </h2>
            
            {monthlyArbitrageProfits.length > 0 ? (
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyArbitrageProfits}
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
                    <Legend />
                    {allCurrenciesInArbitrage.map((currency, index) => (
                      <Bar 
                        key={currency} 
                        dataKey={currency} 
                        stackId="a" 
                        fill={getArbitrageColor(currency, index)}
                        name={currency}
                        radius={index === allCurrenciesInArbitrage.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <PieChart size={40} className="sm:w-12 sm:h-12 mx-auto text-gray-300 mb-3 sm:mb-4" />
                <p className="text-sm sm:text-base text-gray-500">No hay datos de ganancias mensuales por arbitraje para graficar.</p>
              </div>
            )}
          </div>
        </div>

        {/* Lista de movimientos de arbitraje */}
        <div className="card">
          <div className="p-3 sm:p-4 lg:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-4 sm:mb-6 flex items-center gap-2">
              <ArrowUpDown size={18} className="text-indigo-600 flex-shrink-0" />
              <span>Operaciones de Arbitraje</span>
            </h2>
            
            {/* Barra de búsqueda */}
            <div className="relative mb-4 sm:mb-6">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar operación de arbitraje por cliente, detalle, moneda o cuenta..."
                className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Indicador de búsqueda activa */}
            {searchTerm && (
              <div className="flex items-center gap-2 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b">
                <span className="text-xs sm:text-sm text-gray-600">Búsqueda activa:</span>
                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">
                  "{searchTerm}"
                </span>
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-xs text-gray-500 hover:text-gray-700 underline ml-2"
                >
                  Limpiar
                </button>
              </div>
            )}

            {/* Lista de operaciones */}
            <div className="space-y-3 sm:space-y-4">
              {filteredArbitrageMovements.length > 0 ? (
                filteredArbitrageMovements.map((mov) => (
                  <div key={mov.id} className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-3 sm:p-4 hover:shadow-medium transition-all duration-200">
                    {/* Header de la operación */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-xs text-indigo-600 mb-1">
                          <Calendar size={12} />
                          <span>
                            {mov.fecha ? new Date(mov.fecha + 'T12:00:00').toLocaleDateString('es-ES', { 
                              day: '2-digit', 
                              month: 'short', 
                              year: 'numeric',
                              weekday: 'short'
                            }) : 'Sin fecha'}
                          </span>
                        </div>
                        
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base flex items-center gap-2 truncate">
                          <User size={16} className="text-indigo-500 flex-shrink-0" />
                          <span className="truncate">{mov.cliente || 'Sin Cliente'}</span>
                        </h3>
                      </div>
                      
                      {/* Ganancia destacada */}
                      <div className="text-right flex-shrink-0 mt-2 sm:mt-0">
                        <p className="text-xs text-indigo-600 mb-1">Ganancia</p>
                        <p className="font-bold text-lg sm:text-xl text-indigo-700">
                          {formatAmountWithCurrency(safeParseFloat(mov.comision), mov.monedaTCVenta || mov.monedaTC || 'ARS')}
                        </p>
                      </div>
                    </div>

                    {/* Detalles de la operación */}
                    <div className="bg-white rounded-lg p-3 space-y-2">
                      {mov.detalle && (
                        <div>
                          <span className="text-xs font-medium text-gray-600">Detalle:</span>
                          <p className="text-sm text-gray-800 break-words">{mov.detalle}</p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 text-xs">
                        <div>
                          <span className="font-medium text-gray-600">Moneda Base:</span>
                          <p className="text-gray-800">{mov.moneda || 'N/A'}</p>
                        </div>
                        
                        {mov.monto && (
                          <div>
                            <span className="font-medium text-gray-600">Monto Compra:</span>
                            <p className="text-gray-800">{formatAmountWithCurrency(mov.monto, mov.moneda)}</p>
                          </div>
                        )}
                        
                        {mov.montoVenta && (
                          <div>
                            <span className="font-medium text-gray-600">Monto Venta:</span>
                            <p className="text-gray-800">{formatAmountWithCurrency(mov.montoVenta, mov.monedaVenta || mov.moneda)}</p>
                          </div>
                        )}
                        
                        <div>
                          <span className="font-medium text-gray-600">Cuenta Comisión:</span>
                          <p className="text-gray-800">{mov.cuenta || 'N/A'}</p>
                        </div>
                      </div>

                      {/* Información adicional de arbitraje */}
                      {(mov.tc || mov.tcVenta) && (
                        <div className="border-t pt-2 mt-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs">
                            {mov.tc && (
                              <div>
                                <span className="font-medium text-gray-600">TC Compra:</span>
                                <p className="text-gray-800">{mov.tc} {mov.monedaTCCompra && `(${mov.monedaTCCompra})`}</p>
                              </div>
                            )}
                            {mov.tcVenta && (
                              <div>
                                <span className="font-medium text-gray-600">TC Venta:</span>
                                <p className="text-gray-800">{mov.tcVenta} {mov.monedaTCVenta && `(${mov.monedaTCVenta})`}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Estado de la operación */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-3 pt-3 border-t border-indigo-200 gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        mov.estado === 'realizado' 
                          ? 'bg-success-100 text-success-700' 
                          : mov.estado === 'pendiente'
                          ? 'bg-warning-100 text-warning-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {mov.estado || 'Sin estado'}
                      </span>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>Por: {mov.por || 'N/A'}</span>
                        {mov.nombreOtro && <span>({mov.nombreOtro})</span>}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <ArrowUpDown size={40} className="sm:w-12 sm:h-12 mx-auto text-gray-300 mb-3 sm:mb-4" />
                  {searchTerm ? (
                    <div>
                      <p className="text-sm sm:text-base text-gray-500 mb-2">
                        No se encontraron operaciones de arbitraje que coincidan con "{searchTerm}"
                      </p>
                      <button
                        onClick={() => setSearchTerm('')}
                        className="text-indigo-600 hover:text-indigo-700 text-sm underline"
                      >
                        Limpiar búsqueda
                      </button>
                    </div>
                  ) : arbitrageMovements.length === 0 ? (
                    <div>
                      <p className="text-sm sm:text-base text-gray-500 mb-4">No hay operaciones de arbitraje registradas</p>
                      <p className="text-xs sm:text-sm text-gray-400 mb-4">
                        Las operaciones de arbitraje aparecerán aquí cuando se registren transacciones de tipo "ARBITRAJE"
                      </p>
                      <button
                        onClick={() => onNavigate('nuevoMovimiento')}
                        className="btn-primary touch-target"
                      >
                        Registrar arbitraje
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm sm:text-base text-gray-500">Todas las operaciones de arbitraje están ocultas por el filtro actual</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Información adicional y KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="card">
            <div className="p-3 sm:p-4 lg:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 sm:mb-4 flex items-center gap-2">
                <Target size={16} className="text-indigo-600" />
                Resumen de Arbitraje
              </h3>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600">Total de operaciones:</span>
                  <span className="font-semibold text-gray-900 text-sm sm:text-base">{arbitrageMovements.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600">Monedas operadas:</span>
                  <span className="font-semibold text-gray-900 text-sm sm:text-base">{allCurrenciesInArbitrage.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600">Operaciones este mes:</span>
                  <span className="font-semibold text-gray-900 text-sm sm:text-base">
                    {arbitrageMovements.filter(mov => 
                      mov.fecha && mov.fecha.substring(0, 7) === new Date().toISOString().substring(0, 7)
                    ).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600">Meses con actividad:</span>
                  <span className="font-semibold text-gray-900 text-sm sm:text-base">{monthlyArbitrageProfits.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600">Promedio ganancia/operación:</span>
                  <span className="font-semibold text-gray-900 text-sm sm:text-base">
                    {arbitrageMovements.length > 0 
                      ? (Object.values(totalArbitrageProfits).reduce((a, b) => a + b, 0) / arbitrageMovements.length).toFixed(2)
                      : '0'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="p-3 sm:p-4 lg:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 sm:mb-4 flex items-center gap-2">
                <Calculator size={16} className="text-emerald-600" />
                Optimización de Arbitraje
              </h3>
              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                <p>• Identificar oportunidades frecuentes de arbitraje</p>
                <p>• Analizar márgenes de ganancia por par de monedas</p>
                <p>• Optimizar timing de operaciones</p>
                <p>• Evaluar costos de transacción vs beneficios</p>
                <p>• Monitorear tendencias de volatilidad</p>
                <p>• Diversificar entre diferentes mercados</p>
              </div>
            </div>
          </div>
        </div>

        {/* Estado vacío si no hay arbitrajes */}
        {arbitrageMovements.length === 0 && (
          <div className="card">
            <div className="p-6 sm:p-8 lg:p-12 text-center">
              <TrendingDown size={48} className="sm:w-16 sm:h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
                No hay operaciones de arbitraje registradas
              </h3>
              <p className="text-sm sm:text-base text-gray-500 mb-6">
                Las operaciones de arbitraje aparecerán aquí cuando se registren transacciones que generen ganancias por diferencias de precios.
              </p>
              <button
                onClick={() => onNavigate('nuevoMovimiento')}
                className="btn-primary touch-target"
              >
                Registrar nueva operación de arbitraje
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ArbitrajeApp;