import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  CalendarDays,
  Search,
  Building2,
  PieChart,
  BarChart3,
  Target,
  TrendingDown,
  Calculator,
  Clock,
  ArrowUpDown
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';
import { FormInput, formatAmountWithCurrency } from '../../shared/components/forms';
import { safeParseFloat } from '../../shared/services/safeOperations';

/** COMPONENTE PRINCIPAL DE ANÁLISIS DE COMISIONES */
function ComisionesApp({ movements, onNavigate }) {
  const [selectedDate, setSelectedDate] = useState('');

  // Filtrar movimientos que tienen comisión - SOLO COMISIONES (SIN ARBITRAJES)
  const commissionMovements = useMemo(() => {
    return movements.filter(mov => 
      mov.comision && 
      safeParseFloat(mov.comision) > 0 &&
      !(mov.operacion === 'TRANSACCIONES' && mov.subOperacion === 'ARBITRAJE') // EXCLUIR arbitrajes
    );
  }, [movements]);

  // Comisiones de PROVEEDORES CC
  const providerCommissions = useMemo(() => {
    return commissionMovements.filter(mov => 
      mov.operacion === 'CUENTAS_CORRIENTES'
    );
  }, [commissionMovements]);

  // Calcular comisiones totales por moneda - SOLO PROVEEDORES CC
  const totalProviderCommissions = useMemo(() => {
    const totals = {};
    providerCommissions.forEach(mov => {
      const currency = mov.monedaComision || mov.moneda;
      if (currency) {
        totals[currency] = (totals[currency] || 0) + safeParseFloat(mov.comision);
      }
    });
    return totals;
  }, [providerCommissions]);

  // Calcular comisiones totales - SOLO COMISIONES REALES
  const totalCommissions = useMemo(() => {
    const totals = {};
    commissionMovements.forEach(mov => {
      const currency = mov.monedaComision || mov.moneda;
      if (currency) {
        totals[currency] = (totals[currency] || 0) + safeParseFloat(mov.comision);
      }
    });
    return totals;
  }, [commissionMovements]);

  // Calcular comisiones mensuales para gráficos
  const monthlyCommissions = useMemo(() => {
    const monthly = {};
    commissionMovements.forEach(mov => {
      if (mov.fecha) {
        const date = new Date(mov.fecha);
        const yearMonth = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        const currency = mov.monedaComision || mov.moneda;

        if (!monthly[yearMonth]) {
          monthly[yearMonth] = {};
        }
        if (currency) {
          monthly[yearMonth][currency] = (monthly[yearMonth][currency] || 0) + safeParseFloat(mov.comision);
        }
      }
    });

    // Formatear para Recharts
    const chartData = Object.entries(monthly).map(([month, currencies]) => {
      const data = { name: month };
      for (const currency in currencies) {
        data[currency] = currencies[currency];
      }
      return data;
    }).sort((a, b) => a.name.localeCompare(b.name));

    return chartData;
  }, [commissionMovements]);

  // Calcular comisiones diarias para fecha seleccionada
  const dailyCommissionsForSelectedDate = useMemo(() => {
    if (!selectedDate) return {};
    const daily = {};
    commissionMovements.forEach(mov => {
      if (mov.fecha === selectedDate) {
        const currency = mov.monedaComision || mov.moneda;
        if (currency) {
          daily[currency] = (daily[currency] || 0) + safeParseFloat(mov.comision);
        }
      }
    });
    return daily;
  }, [commissionMovements, selectedDate]);

  // Calcular comisiones de hoy
  const todayCommissions = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const daily = {};
    commissionMovements.forEach(mov => {
      if (mov.fecha === today) {
        const currency = mov.monedaComision || mov.moneda;
        if (currency) {
          daily[currency] = (daily[currency] || 0) + safeParseFloat(mov.comision);
        }
      }
    });
    return daily;
  }, [commissionMovements]);

  // Calcular comisiones del mes actual
  const currentMonthCommissions = useMemo(() => {
    const currentYearMonth = new Date().toISOString().substring(0, 7);
    const monthly = {};
    commissionMovements.forEach(mov => {
      if (mov.fecha && mov.fecha.substring(0, 7) === currentYearMonth) {
        const currency = mov.monedaComision || mov.moneda;
        if (currency) {
          monthly[currency] = (monthly[currency] || 0) + safeParseFloat(mov.comision);
        }
      }
    });
    return monthly;
  }, [commissionMovements]);

  // Calcular comisiones por proveedor
  const commissionsByProvider = useMemo(() => {
    const providerTotals = {};
    commissionMovements.forEach(mov => {
      const provider = mov.proveedorCC || 'Operaciones Directas';
      const currency = mov.monedaComision || mov.moneda;

      if (!providerTotals[provider]) {
        providerTotals[provider] = {};
      }
      if (currency) {
                  providerTotals[provider][currency] = (providerTotals[provider][currency] || 0) + safeParseFloat(mov.comision);
      }
    });
    return providerTotals;
  }, [commissionMovements]);

  // Obtener todas las monedas presentes en comisiones
  const allCurrenciesInCommissions = useMemo(() => {
    const currencies = new Set();
    commissionMovements.forEach(mov => {
      const currency = mov.monedaComision || mov.moneda;
      if (currency) {
        currencies.add(currency);
      }
    });
    return Array.from(currencies).sort();
  }, [commissionMovements]);

  // Función para obtener colores para cada moneda
  const getCurrencyColor = (currency, index) => {
    const colors = [
      '#3B82F6', // Azul
      '#10B981', // Verde
      '#F59E0B', // Amarillo
      '#EF4444', // Rojo
      '#8B5CF6', // Violeta
      '#F97316', // Naranja
      '#06B6D4', // Cian
      '#84CC16', // Lima
    ];
    return colors[index % colors.length];
  };

  // Función para renderizar cards de métricas
  const renderMetricCard = (title, data, bgColor, textColor, borderColor, icon) => (
    <div className={`card ${bgColor} border-l-4 ${borderColor} p-4 sm:p-6`}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            {React.createElement(icon, { size: 20, className: `${textColor} opacity-80 flex-shrink-0` })}
            <h3 className={`text-sm font-semibold ${textColor} truncate`}>{title}</h3>
          </div>
          {Object.entries(data).length > 0 ? (
            <div className="space-y-1">
              {Object.entries(data).map(([currency, amount]) => (
                <p key={currency} className={`text-lg sm:text-xl font-bold ${textColor} truncate`}>
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
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6 safe-top safe-bottom pt-28">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="card">
          <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-100">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-success-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <DollarSign size={20} className="sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-success-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 truncate">
                    Análisis de Comisiones
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Dashboard completo de ingresos por comisiones • {commissionMovements.length} movimiento{commissionMovements.length !== 1 ? 's' : ''} con comisión
                  </p>
                </div>
              </div>
              <button 
                onClick={() => onNavigate('nuevoMovimiento')} 
                className="btn-primary flex items-center justify-center gap-2 touch-target w-full sm:w-auto"
              >
                <Calculator size={18} />
                <span>Nueva Operación</span>
              </button>
            </div>
          </div>

          {/* Métricas principales */}
          <div className="p-3 sm:p-4 lg:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-4 sm:mb-6">
              Métricas Principales
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6">
              {renderMetricCard(
                'Comisión Total Histórica',
                totalCommissions,
                'bg-primary-50',
                'text-primary-700',
                'border-primary-500',
                Target
              )}
              
              {renderMetricCard(
                'Comisión del Mes Actual',
                currentMonthCommissions,
                'bg-success-50',
                'text-success-700',
                'border-success-500',
                CalendarDays
              )}

              {renderMetricCard(
                'Comisión de Hoy',
                todayCommissions,
                'bg-warning-50',
                'text-warning-700',
                'border-warning-500',
                Clock
              )}
            </div>

            {/* Métricas por tipo */}
            <h3 className="text-sm font-semibold text-gray-600 mb-4">Comisiones por Tipo</h3>
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              {renderMetricCard(
                'Proveedores CC',
                totalProviderCommissions,
                'bg-purple-50',
                'text-purple-700',
                'border-purple-500',
                Building2
              )}
            </div>
          </div>
        </div>

        {/* Buscador de comisiones por día */}
        <div className="card">
          <div className="p-3 sm:p-4 lg:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-4 sm:mb-6 flex items-center gap-2">
              <Search size={18} className="text-indigo-600 flex-shrink-0" />
              <span>Buscar Comisiones por Fecha</span>
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
                {selectedDate && Object.entries(dailyCommissionsForSelectedDate).length > 0 ? (
                  <div className="bg-indigo-50 p-3 sm:p-4 rounded-lg w-full">
                    <p className="text-xs sm:text-sm font-medium text-indigo-700 mb-2">
                      Comisiones para {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-ES', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}:
                    </p>
                    <div className="space-y-1">
                      {Object.entries(dailyCommissionsForSelectedDate).map(([currency, amount]) => (
                        <p key={currency} className="text-sm sm:text-base lg:text-lg font-bold text-indigo-800">
                          {formatAmountWithCurrency(amount, currency)}
                        </p>
                      ))}
                    </div>
                  </div>
                ) : selectedDate ? (
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg w-full text-center">
                    <p className="text-xs sm:text-sm text-gray-500">No hay comisiones para la fecha seleccionada</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg w-full text-center">
                    <p className="text-xs sm:text-sm text-gray-400">Selecciona una fecha para ver las comisiones</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Comisiones por proveedor */}
        <div className="card">
          <div className="p-3 sm:p-4 lg:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-4 sm:mb-6 flex items-center gap-2">
              <Building2 size={18} className="text-purple-600 flex-shrink-0" />
              <span>Comisiones por Proveedor</span>
            </h2>
            
            {Object.entries(commissionsByProvider).length > 0 ? (
              <>
                {/* Tabla para desktop */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Proveedor
                        </th>
                        {allCurrenciesInCommissions.map(currency => (
                          <th key={currency} className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {currency}
                          </th>
                        ))}
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Operaciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Object.entries(commissionsByProvider).map(([provider, currencies]) => {
                        const operationsCount = commissionMovements.filter(mov => 
                          (mov.proveedorCC || 'Operaciones Directas') === provider
                        ).length;
                        
                        return (
                          <tr key={provider} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                                  <Building2 size={16} className="text-purple-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-900 truncate">{provider}</span>
                              </div>
                            </td>
                            {allCurrenciesInCommissions.map(currency => (
                              <td key={`${provider}-${currency}`} className="px-4 py-4 whitespace-nowrap text-right text-sm">
                                {currencies[currency] ? (
                                  <span className="font-medium text-gray-900">
                                    {formatAmountWithCurrency(currencies[currency], currency)}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                            ))}
                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium text-purple-600">
                              {operationsCount}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Cards para mobile */}
                <div className="sm:hidden space-y-3">
                  {Object.entries(commissionsByProvider).map(([provider, currencies]) => {
                    const operationsCount = commissionMovements.filter(mov => 
                      (mov.proveedorCC || 'Operaciones Directas') === provider
                    ).length;
                    
                    return (
                      <div key={provider} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Building2 size={14} className="text-purple-600" />
                          </div>
                          <h3 className="font-medium text-gray-900 text-sm truncate flex-1">{provider}</h3>
                          <span className="text-xs text-purple-600 font-medium bg-purple-100 px-2 py-1 rounded-full">
                            {operationsCount} op.
                          </span>
                        </div>
                        
                        <div className="space-y-1">
                          {Object.entries(currencies).map(([currency, amount]) => (
                            <div key={currency} className="flex justify-between items-center">
                              <span className="text-xs text-gray-600">{currency}</span>
                              <span className="text-sm font-medium text-gray-900">
                                {formatAmountWithCurrency(amount, currency)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <Building2 size={40} className="sm:w-12 sm:h-12 mx-auto text-gray-300 mb-3 sm:mb-4" />
                <p className="text-sm sm:text-base text-gray-500">No hay datos de comisiones por proveedor.</p>
              </div>
            )}
          </div>
        </div>

        {/* Gráfico de comisiones mensuales */}
        <div className="card">
          <div className="p-3 sm:p-4 lg:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-4 sm:mb-6 flex items-center gap-2">
              <BarChart3 size={18} className="text-emerald-600 flex-shrink-0" />
              <span>Tendencia de Comisiones Mensuales</span>
            </h2>
            
            {monthlyCommissions.length > 0 ? (
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyCommissions}
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
                    {allCurrenciesInCommissions.map((currency, index) => (
                      <Bar 
                        key={currency} 
                        dataKey={currency} 
                        stackId="a" 
                        fill={getCurrencyColor(currency, index)}
                        name={currency}
                        radius={index === allCurrenciesInCommissions.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <PieChart size={40} className="sm:w-12 sm:h-12 mx-auto text-gray-300 mb-3 sm:mb-4" />
                <p className="text-sm sm:text-base text-gray-500">No hay datos de comisiones mensuales para graficar.</p>
              </div>
            )}
          </div>
        </div>

        {/* Estadísticas adicionales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="card">
            <div className="p-3 sm:p-4 lg:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 sm:mb-4 flex items-center gap-2">
                <TrendingUp size={16} className="text-emerald-600" />
                Resumen Ejecutivo
              </h3>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600">Total de operaciones con comisión:</span>
                  <span className="font-semibold text-gray-900 text-sm sm:text-base">{commissionMovements.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600">Monedas operadas:</span>
                  <span className="font-semibold text-gray-900 text-sm sm:text-base">{allCurrenciesInCommissions.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600">Proveedores activos:</span>
                  <span className="font-semibold text-gray-900 text-sm sm:text-base">{Object.keys(commissionsByProvider).length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600">Meses con actividad:</span>
                  <span className="font-semibold text-gray-900 text-sm sm:text-base">{monthlyCommissions.length}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="p-3 sm:p-4 lg:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 sm:mb-4 flex items-center gap-2">
                <Target size={16} className="text-primary-600" />
                Próximos Pasos
              </h3>
              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                <p>• Revisar comisiones por proveedor para optimizar acuerdos</p>
                <p>• Analizar tendencias mensuales para proyecciones</p>
                <p>• Evaluar rentabilidad por tipo de operación</p>
                <p>• Planificar estrategias de crecimiento en comisiones</p>
                <p>• Comparar rendimiento entre diferentes monedas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Estado vacío si no hay comisiones */}
        {commissionMovements.length === 0 && (
          <div className="card">
            <div className="p-6 sm:p-8 lg:p-12 text-center">
              <TrendingDown size={48} className="sm:w-16 sm:h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
                No hay comisiones registradas
              </h3>
              <p className="text-sm sm:text-base text-gray-500 mb-6">
                Las comisiones aparecerán aquí cuando se registren operaciones que generen ingresos por comisiones.
              </p>
              <button
                onClick={() => onNavigate('nuevoMovimiento')}
                className="btn-primary touch-target"
              >
                Registrar nueva operación
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ComisionesApp;