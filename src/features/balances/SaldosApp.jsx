import React, { useMemo, useState, useEffect } from 'react';
import { Wallet, TrendingUp, TrendingDown, DollarSign, CreditCard, Banknote } from 'lucide-react';
import { formatAmountWithCurrency } from '../../shared/components/forms';
import { safeParseFloat } from '../../shared/services/safeOperations';
// import { apiService } from '../../shared/services/api'; // TEMPORAL: Comentado
import { monedas } from '../../shared/constants';

function SaldosApp({ movements = [] }) { // TEMPORAL: Vuelvo a recibir movements como prop
  const [filterSocio, setFilterSocio] = useState('all'); // 'all', 'socio1', 'socio2', 'all_wallet'
  const [filterTipo, setFilterTipo] = useState('all'); // 'all', 'digital', 'efectivo'
  // TEMPORAL: Comentado para no usar API
  // const [movements, setMovements] = useState([]);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);

  // TEMPORAL: Comentado para no cargar desde API
  /*
  // Cargar movimientos desde la API
  useEffect(() => {
    loadMovements();
  }, []);

  const loadMovements = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getMovements({ limit: 1000 });
      if (response.success) {
        setMovements(response.data);
      }
    } catch (err) {
      setError(err.message || 'Error al cargar los movimientos');
      console.error('Error loading movements:', err);
    } finally {
      setLoading(false);
    }
  };
  */

  // Calcular saldos por socio, tipo y moneda
  const saldos = useMemo(() => {
    const saldosMap = new Map();

    // Inicializar estructura para cada combinación
    const socios = ['socio1', 'socio2', 'all'];
    const tipos = ['digital', 'efectivo'];
    
    socios.forEach(socio => {
      tipos.forEach(tipo => {
        monedas.forEach(moneda => {
          // USDT solo existe en digital
          if (moneda.value === 'USDT' && tipo === 'efectivo') return;
          
          const key = `${socio}-${tipo}-${moneda.value}`;
          saldosMap.set(key, {
            socio,
            tipo,
            moneda: moneda.value,
            monedaLabel: moneda.label,
            ingresos: 0,
            egresos: 0,
            saldo: 0,
            movimientosCount: 0
          });
        });
      });
    });

    // Procesar movimientos
    movements.forEach(mov => {
      if (!mov.cuenta || !mov.moneda || !mov.monto) return;
      
      // Extraer socio y tipo de la cuenta
      const cuentaParts = mov.cuenta.split('_');
      if (cuentaParts.length !== 2) return;
      
      const [socio, tipo] = cuentaParts;
      if (!['socio1', 'socio2', 'all'].includes(socio)) return;
      if (!['digital', 'efectivo'].includes(tipo)) return;
      
      const key = `${socio}-${tipo}-${mov.moneda}`;
      const saldo = saldosMap.get(key);
      
      if (saldo) {
        const monto = safeParseFloat(mov.monto);
        saldo.movimientosCount++;
        
        // Lógica mejorada para determinar si es ingreso o egreso
        let esIngreso = false;
        
        switch (mov.operacion) {
          case 'TRANSACCIONES':
            esIngreso = mov.subOperacion === 'VENTA';
            break;
          case 'CUENTAS_CORRIENTES':
            esIngreso = mov.subOperacion === 'INGRESO';
            break;
          case 'SOCIOS':
            esIngreso = ['INGRESO', 'PRESTAMO'].includes(mov.subOperacion);
            break;
          case 'ADMINISTRATIVAS':
            // AJUSTE puede ser ingreso o egreso, GASTO siempre es egreso
            esIngreso = mov.subOperacion === 'AJUSTE' && monto > 0;
            break;
          case 'PRESTAMISTAS':
            esIngreso = mov.subOperacion === 'PRESTAMO';
            break;
          case 'INTERNAS':
            // Para movimientos internos, es egreso de una cuenta
            esIngreso = false;
            // También procesar la cuenta destino como ingreso
            if (mov.cuentaDestino) {
              const cuentaDestParts = mov.cuentaDestino.split('_');
              if (cuentaDestParts.length === 2) {
                const [socioDest, tipoDest] = cuentaDestParts;
                const keyDest = `${socioDest}-${tipoDest}-${mov.moneda}`;
                const saldoDest = saldosMap.get(keyDest);
                if (saldoDest) {
                  saldoDest.ingresos += monto;
                  saldoDest.saldo += monto;
                  saldoDest.movimientosCount++;
                }
              }
            }
            break;
        }
        
        if (esIngreso) {
          saldo.ingresos += monto;
          saldo.saldo += monto;
        } else {
          saldo.egresos += monto;
          saldo.saldo -= monto;
        }
      }
    });

    return Array.from(saldosMap.values());
  }, [movements]);

  // Filtrar saldos según selección
  const filteredSaldos = useMemo(() => {
    return saldos.filter(saldo => {
      const matchSocio = filterSocio === 'all' || 
                        (filterSocio === 'all_wallet' && saldo.socio === 'all') ||
                        saldo.socio === filterSocio;
      const matchTipo = filterTipo === 'all' || saldo.tipo === filterTipo;
      
      return matchSocio && matchTipo && (saldo.ingresos > 0 || saldo.egresos > 0);
    });
  }, [saldos, filterSocio, filterTipo]);

  // Agrupar por moneda para totales
  const totalesPorMoneda = useMemo(() => {
    const totales = new Map();
    
    filteredSaldos.forEach(saldo => {
      const current = totales.get(saldo.moneda) || {
        moneda: saldo.moneda,
        monedaLabel: saldo.monedaLabel,
        total: 0,
        ingresos: 0,
        egresos: 0
      };
      
      current.total += saldo.saldo;
      current.ingresos += saldo.ingresos;
      current.egresos += saldo.egresos;
      
      totales.set(saldo.moneda, current);
    });
    
    return Array.from(totales.values()).filter(t => t.total !== 0);
  }, [filteredSaldos]);

  return (
    <div className="min-h-screen bg-gray-50 p-1 sm:p-2 lg:p-3 safe-top safe-bottom pt-24">
      <div className="w-full px-2 sm:px-3 lg:px-4 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6 text-gray-800" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Saldos</h1>
                <p className="text-sm text-gray-600">Control de efectivo y digital por socio</p>
              </div>
            </div>
          </div>

          {/* Content - TEMPORAL: Sin loading ni error states */}
          <>
            {/* Filtros */}
            <div className="p-3 sm:p-4 space-y-4">
                {/* Filtro por Socio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Socio</label>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={() => setFilterSocio('all')}
                      className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                        filterSocio === 'all'
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      Todos
                    </button>
                    <button
                      onClick={() => setFilterSocio('socio1')}
                      className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                        filterSocio === 'socio1'
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      Socio 1
                    </button>
                    <button
                      onClick={() => setFilterSocio('socio2')}
                      className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                        filterSocio === 'socio2'
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      Socio 2
                    </button>
                    <button
                      onClick={() => setFilterSocio('all_wallet')}
                      className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                        filterSocio === 'all_wallet'
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      ALL
                    </button>
                  </div>
                </div>

                {/* Filtro por Tipo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setFilterTipo('all')}
                      className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                        filterTipo === 'all'
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      Todos
                    </button>
                    <button
                      onClick={() => setFilterTipo('digital')}
                      className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors flex items-center justify-center gap-2 ${
                        filterTipo === 'digital'
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <CreditCard size={16} />
                      Digital
                    </button>
                    <button
                      onClick={() => setFilterTipo('efectivo')}
                      className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors flex items-center justify-center gap-2 ${
                        filterTipo === 'efectivo'
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <Banknote size={16} />
                      Efectivo
                    </button>
                  </div>
                </div>
              </div>

              {/* Resumen de Totales */}
              {totalesPorMoneda.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Totales por Moneda</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {totalesPorMoneda.map(total => (
                      <div 
                        key={total.moneda}
                        className={`p-4 rounded-lg border-2 ${
                          total.total >= 0 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                        }`}
                      >
                        <div className="text-lg font-bold mb-1">
                          {total.monedaLabel}
                        </div>
                        <div className={`text-2xl font-bold ${
                          total.total >= 0 ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {formatAmountWithCurrency(Math.abs(total.total), total.moneda)}
                        </div>
                        <div className="text-xs text-gray-600 mt-2 space-y-1">
                          <div className="flex items-center gap-1">
                            <TrendingUp size={12} className="text-green-600" />
                            <span>Ingresos: {formatAmountWithCurrency(total.ingresos, total.moneda)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingDown size={12} className="text-red-600" />
                            <span>Egresos: {formatAmountWithCurrency(total.egresos, total.moneda)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Detalle de Saldos */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">Detalle de Saldos</h2>
                </div>
                
                {filteredSaldos.length === 0 ? (
                  <div className="p-8 text-center">
                    <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No hay saldos para mostrar con los filtros seleccionados</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase">Socio</th>
                          <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase">Tipo</th>
                          <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase">Moneda</th>
                          <th className="px-2 py-2 text-right text-xs font-medium text-gray-700 uppercase">Ingresos</th>
                          <th className="px-2 py-2 text-right text-xs font-medium text-gray-700 uppercase">Egresos</th>
                          <th className="px-2 py-2 text-right text-xs font-medium text-gray-700 uppercase">Saldo</th>
                          <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 uppercase">Movs</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredSaldos.map(saldo => (
                          <tr key={`${saldo.socio}-${saldo.tipo}-${saldo.moneda}`} className="hover:bg-gray-50">
                            <td className="px-2 py-3 text-sm font-medium text-gray-900">
                              {saldo.socio === 'all' ? 'ALL' : saldo.socio === 'socio1' ? 'Socio 1' : 'Socio 2'}
                            </td>
                            <td className="px-2 py-3 text-sm text-gray-700">
                              <div className="flex items-center gap-1">
                                {saldo.tipo === 'digital' ? <CreditCard size={14} /> : <Banknote size={14} />}
                                {saldo.tipo === 'digital' ? 'Digital' : 'Efectivo'}
                              </div>
                            </td>
                            <td className="px-2 py-3 text-sm text-gray-700">{saldo.monedaLabel}</td>
                            <td className="px-2 py-3 text-sm text-right text-green-600 font-medium">
                              {formatAmountWithCurrency(saldo.ingresos, saldo.moneda)}
                            </td>
                            <td className="px-2 py-3 text-sm text-right text-red-600 font-medium">
                              {formatAmountWithCurrency(saldo.egresos, saldo.moneda)}
                            </td>
                            <td className={`px-2 py-3 text-sm text-right font-bold ${
                              saldo.saldo >= 0 ? 'text-green-700' : 'text-red-700'
                            }`}>
                              {formatAmountWithCurrency(saldo.saldo, saldo.moneda)}
                            </td>
                            <td className="px-2 py-3 text-sm text-center text-gray-600">
                              {saldo.movimientosCount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          </div>
        </div>
      </div>
  );
}

export default SaldosApp;