import React, { useState, useMemo } from 'react';
import { TrendingUp, Calendar, DollarSign, Percent, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatAmountWithCurrency } from '../../shared/components/forms';
import { safeParseFloat } from '../../shared/services/safeOperations';
import { monedas } from '../../shared/constants';

function RentabilidadApp({ movements = [] }) {
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [selectedMoneda, setSelectedMoneda] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('mensual');

  // Función para calcular rangos de fecha según el período
  const calculateDateRange = (period) => {
    const today = new Date();
    const endDate = today.toISOString().split('T')[0];
    let startDate;

    switch (period) {
      case 'diario':
        startDate = endDate;
        break;
      case 'semanal':
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        startDate = weekAgo.toISOString().split('T')[0];
        break;
      case 'mensual':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        break;
      case 'anual':
        startDate = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
        break;
      default:
        return { start: dateRange.start, end: dateRange.end };
    }

    return { start: startDate, end: endDate };
  };

  // Manejar cambio de período
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    if (period !== 'personalizado') {
      const newRange = calculateDateRange(period);
      setDateRange(newRange);
    }
  };

  // Filtrar movimientos por fecha
  const filteredMovements = useMemo(() => {
    return movements.filter(mov => {
      const movDate = new Date(mov.fecha).toISOString().split('T')[0];
      return movDate >= dateRange.start && movDate <= dateRange.end;
    });
  }, [movements, dateRange]);

  // Calcular movimientos del período anterior para comparación
  const previousPeriodMovements = useMemo(() => {
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    const prevEnd = new Date(start);
    prevEnd.setDate(prevEnd.getDate() - 1);
    const prevStart = new Date(prevEnd);
    prevStart.setDate(prevStart.getDate() - daysDiff);
    
    return movements.filter(mov => {
      const movDate = new Date(mov.fecha).toISOString().split('T')[0];
      return movDate >= prevStart.toISOString().split('T')[0] && 
             movDate <= prevEnd.toISOString().split('T')[0];
    });
  }, [movements, dateRange]);

  // Función para calcular rentabilidad de un conjunto de movimientos
  const calculateProfitability = (movementsList) => {
    const data = {
      porTipo: {},
      porMoneda: {},
      porCliente: {},
      general: {
        totalOperaciones: 0,
        operacionesRentables: 0,
        gananciaTotal: 0,
        margenPromedio: 0
      }
    };

    // Analizar operaciones de arbitraje
    const arbitrajes = movementsList.filter(mov => 
      mov.operacion === 'TRANSACCIONES' && mov.subOperacion === 'ARBITRAJE'
    );

    arbitrajes.forEach(arb => {
      // Calcular ganancia del arbitraje
      const montoCompra = safeParseFloat(arb.monto);
      const tcCompra = safeParseFloat(arb.tc);
      const montoVenta = safeParseFloat(arb.montoVenta || 0);
      const tcVenta = safeParseFloat(arb.tcVenta || 0);
      
      const totalCompra = montoCompra * tcCompra;
      const totalVenta = montoVenta * tcVenta;
      const ganancia = totalVenta - totalCompra;

      // Actualizar estadísticas generales
      data.general.totalOperaciones++;
      if (ganancia > 0) data.general.operacionesRentables++;
      data.general.gananciaTotal += ganancia;

      // Por moneda
      const monedaKey = arb.monedaTCCmpra || 'PESO';
      if (!data.porMoneda[monedaKey]) {
        data.porMoneda[monedaKey] = {
          operaciones: 0,
          gananciaTotal: 0,
          margenPromedio: 0,
          volumen: 0
        };
      }
      data.porMoneda[monedaKey].operaciones++;
      data.porMoneda[monedaKey].gananciaTotal += ganancia;
      data.porMoneda[monedaKey].volumen += totalCompra;

      // Por cliente
      if (arb.cliente) {
        if (!data.porCliente[arb.cliente]) {
          data.porCliente[arb.cliente] = {
            operaciones: 0,
            gananciaTotal: 0,
            volumen: 0
          };
        }
        data.porCliente[arb.cliente].operaciones++;
        data.porCliente[arb.cliente].gananciaTotal += ganancia;
        data.porCliente[arb.cliente].volumen += totalCompra;
      }
    });

    // Analizar operaciones de CUENTAS_CORRIENTES
    const operacionesCC = movementsList.filter(mov => 
      mov.operacion === 'CUENTAS_CORRIENTES' && 
      ['COMPRA', 'VENTA', 'ARBITRAJE'].includes(mov.subOperacion)
    );

    operacionesCC.forEach(op => {
      let ganancia = 0;
      let volumen = 0;
      let monedaKey = 'PESO';

      if (op.subOperacion === 'COMPRA') {
        const monto = safeParseFloat(op.monto);
        const tc = safeParseFloat(op.tc);
        volumen = monto * tc;
        
        if (op.comision) {
          const comision = safeParseFloat(op.comision);
          ganancia = op.tipoComision === 'percentage' 
            ? (monto * comision / 100)
            : comision;
        } else {
          ganancia = volumen * 0.015;
        }
        monedaKey = op.monedaTC || 'PESO';
      } else if (op.subOperacion === 'VENTA') {
        const monto = safeParseFloat(op.monto);
        const tc = safeParseFloat(op.tc);
        volumen = monto * tc;
        
        if (op.comision) {
          const comision = safeParseFloat(op.comision);
          ganancia = op.tipoComision === 'percentage' 
            ? (monto * comision / 100)
            : comision;
        } else {
          ganancia = volumen * 0.015;
        }
        monedaKey = op.monedaTC || 'PESO';
      } else if (op.subOperacion === 'ARBITRAJE') {
        const montoCompra = safeParseFloat(op.montoCompra);
        const tcCompra = safeParseFloat(op.tcCompra);
        const montoVenta = safeParseFloat(op.montoVenta || 0);
        const tcVenta = safeParseFloat(op.tcVenta || 0);
        
        const totalCompra = montoCompra * tcCompra;
        const totalVenta = montoVenta * tcVenta;
        ganancia = totalVenta - totalCompra;
        volumen = totalCompra;
        monedaKey = op.monedaTCCompra || 'PESO';
      }

      if (ganancia !== 0) {
        data.general.totalOperaciones++;
        if (ganancia > 0) data.general.operacionesRentables++;
        data.general.gananciaTotal += ganancia;

        if (!data.porMoneda[monedaKey]) {
          data.porMoneda[monedaKey] = {
            operaciones: 0,
            gananciaTotal: 0,
            margenPromedio: 0,
            volumen: 0
          };
        }
        data.porMoneda[monedaKey].operaciones++;
        data.porMoneda[monedaKey].gananciaTotal += ganancia;
        data.porMoneda[monedaKey].volumen += volumen;

        if (op.proveedorCC) {
          const proveedorKey = `CC-${op.proveedorCC}`;
          if (!data.porCliente[proveedorKey]) {
            data.porCliente[proveedorKey] = {
              operaciones: 0,
              gananciaTotal: 0,
              volumen: 0
            };
          }
          data.porCliente[proveedorKey].operaciones++;
          data.porCliente[proveedorKey].gananciaTotal += ganancia;
          data.porCliente[proveedorKey].volumen += volumen;
        }
      }
    });

    // Analizar comisiones de otras operaciones
    movementsList.forEach(mov => {
      if (mov.comision && safeParseFloat(mov.comision) > 0) {
        const comision = safeParseFloat(mov.comision);
        const monto = safeParseFloat(mov.monto);
        
        const gananciaComision = mov.tipoComision === 'percentage' 
          ? (monto * comision / 100)
          : comision;

        data.general.gananciaTotal += gananciaComision;
        
        if (!data.porTipo[mov.operacion]) {
          data.porTipo[mov.operacion] = {
            operaciones: 0,
            comisionTotal: 0,
            volumen: 0
          };
        }
        data.porTipo[mov.operacion].operaciones++;
        data.porTipo[mov.operacion].comisionTotal += gananciaComision;
        data.porTipo[mov.operacion].volumen += monto;
      }
    });

    // Calcular promedios
    if (data.general.totalOperaciones > 0) {
      data.general.margenPromedio = data.general.gananciaTotal / data.general.totalOperaciones;
    }

    Object.keys(data.porMoneda).forEach(moneda => {
      if (data.porMoneda[moneda].volumen > 0) {
        data.porMoneda[moneda].margenPromedio = 
          (data.porMoneda[moneda].gananciaTotal / data.porMoneda[moneda].volumen) * 100;
      }
    });

    return data;
  };

  // Calcular rentabilidad del período actual
  const profitabilityData = useMemo(() => {
    return calculateProfitability(filteredMovements);
  }, [filteredMovements]);

  // Calcular rentabilidad del período anterior
  const previousProfitabilityData = useMemo(() => {
    return calculateProfitability(previousPeriodMovements);
  }, [previousPeriodMovements]);

  // Top clientes por rentabilidad
  const topClientes = useMemo(() => {
    return Object.entries(profitabilityData.porCliente)
      .map(([cliente, data]) => ({ cliente, ...data }))
      .sort((a, b) => b.gananciaTotal - a.gananciaTotal)
      .slice(0, 10);
  }, [profitabilityData]);

  return (
    <div className="min-h-screen bg-gray-50 p-1 sm:p-2 lg:p-3 safe-top safe-bottom pt-24">
      <div className="w-full px-2 sm:px-3 lg:px-4 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-gray-800" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Rentabilidad</h1>
                <p className="text-sm text-gray-600">Análisis de ganancias y márgenes</p>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="p-3 sm:p-4 space-y-4">
            {/* Botones de período */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handlePeriodChange('diario')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedPeriod === 'diario'
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Hoy
              </button>
              <button
                onClick={() => handlePeriodChange('semanal')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedPeriod === 'semanal'
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Semana
              </button>
              <button
                onClick={() => handlePeriodChange('mensual')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedPeriod === 'mensual'
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Mes
              </button>
              <button
                onClick={() => handlePeriodChange('anual')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedPeriod === 'anual'
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Año
              </button>
              <button
                onClick={() => handlePeriodChange('personalizado')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedPeriod === 'personalizado'
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Personalizado
              </button>
            </div>

            {/* Selector de fechas personalizado */}
            {selectedPeriod === 'personalizado' && (
              <div className="flex flex-wrap items-center gap-2">
                <Calendar size={20} className="text-gray-500" />
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
                <span className="text-gray-500">hasta</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
              </div>
            )}

            {/* Información del período */}
            <div className="text-sm text-gray-600">
              Mostrando datos desde <span className="font-medium">{new Date(dateRange.start).toLocaleDateString('es-AR')}</span> hasta <span className="font-medium">{new Date(dateRange.end).toLocaleDateString('es-AR')}</span>
            </div>
          </div>
        </div>

        {/* KPIs principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Ganancia Total</span>
              <DollarSign size={20} className="text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatAmountWithCurrency(profitabilityData.general.gananciaTotal, 'PESO')}
            </p>
            {previousProfitabilityData.general.gananciaTotal > 0 && (
              <div className="flex items-center gap-1 mt-1">
                {profitabilityData.general.gananciaTotal > previousProfitabilityData.general.gananciaTotal ? (
                  <>
                    <ArrowUpRight size={16} className="text-green-600" />
                    <span className="text-xs text-green-600">
                      +{((profitabilityData.general.gananciaTotal - previousProfitabilityData.general.gananciaTotal) / previousProfitabilityData.general.gananciaTotal * 100).toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight size={16} className="text-red-600" />
                    <span className="text-xs text-red-600">
                      {((profitabilityData.general.gananciaTotal - previousProfitabilityData.general.gananciaTotal) / previousProfitabilityData.general.gananciaTotal * 100).toFixed(1)}%
                    </span>
                  </>
                )}
                <span className="text-xs text-gray-500">vs período anterior</span>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Operaciones Rentables</span>
              <Percent size={20} className="text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {profitabilityData.general.totalOperaciones > 0 
                ? `${((profitabilityData.general.operacionesRentables / profitabilityData.general.totalOperaciones) * 100).toFixed(1)}%`
                : '0%'
              }
            </p>
            <p className="text-xs text-gray-500">
              {profitabilityData.general.operacionesRentables} de {profitabilityData.general.totalOperaciones}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Ganancia Promedio</span>
              <BarChart3 size={20} className="text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatAmountWithCurrency(profitabilityData.general.margenPromedio, 'PESO')}
            </p>
            <p className="text-xs text-gray-500">Por operación</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Operaciones</span>
              <ArrowUpRight size={20} className="text-gray-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {filteredMovements.length}
            </p>
            <p className="text-xs text-gray-500">En el período</p>
          </div>
        </div>

        {/* Rentabilidad por moneda */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="font-semibold text-gray-800 mb-4">Rentabilidad por Moneda</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-sm font-medium text-gray-700">Moneda</th>
                  <th className="text-right py-2 text-sm font-medium text-gray-700">Operaciones</th>
                  <th className="text-right py-2 text-sm font-medium text-gray-700">Volumen</th>
                  <th className="text-right py-2 text-sm font-medium text-gray-700">Ganancia</th>
                  <th className="text-right py-2 text-sm font-medium text-gray-700">Margen %</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(profitabilityData.porMoneda).map(([moneda, data]) => (
                  <tr key={moneda} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 text-sm font-medium text-gray-900">
                      {monedas.find(m => m.value === moneda)?.label || moneda}
                    </td>
                    <td className="py-3 text-sm text-right text-gray-700">{data.operaciones}</td>
                    <td className="py-3 text-sm text-right text-gray-700">
                      {formatAmountWithCurrency(data.volumen, moneda)}
                    </td>
                    <td className="py-3 text-sm text-right font-medium text-green-600">
                      {formatAmountWithCurrency(data.gananciaTotal, moneda)}
                    </td>
                    <td className="py-3 text-sm text-right text-gray-700">
                      {data.margenPromedio.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top clientes */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="font-semibold text-gray-800 mb-4">Top 10 Clientes por Rentabilidad</h3>
          <div className="space-y-3">
            {topClientes.map((cliente, idx) => (
              <div key={cliente.cliente} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-400">#{idx + 1}</span>
                  <div>
                    <p className="font-medium text-gray-900">{cliente.cliente}</p>
                    <p className="text-sm text-gray-600">{cliente.operaciones} operaciones</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">
                    {formatAmountWithCurrency(cliente.gananciaTotal, 'PESO')}
                  </p>
                  <p className="text-sm text-gray-600">
                    Vol: {formatAmountWithCurrency(cliente.volumen, 'PESO')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comisiones por tipo */}
        {Object.keys(profitabilityData.porTipo).length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Comisiones por Tipo de Operación</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(profitabilityData.porTipo).map(([tipo, data]) => (
                <div key={tipo} className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">{tipo}</h4>
                  <p className="text-2xl font-bold text-green-600">
                    {formatAmountWithCurrency(data.comisionTotal, 'PESO')}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {data.operaciones} operaciones
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RentabilidadApp;