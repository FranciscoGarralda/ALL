import React, { useMemo, useState, useEffect } from 'react';
import { Wallet, TrendingUp, TrendingDown, DollarSign, CreditCard, Banknote } from 'lucide-react';
import { formatAmountWithCurrency } from '../../shared/components/forms';
import { safeParseFloat } from '../../shared/services/safeOperations';
import { initialBalanceService } from '../../shared/services';
import { monedas } from '../../shared/constants';

function SaldosApp({ movements = [] }) {
  const [filterSocio, setFilterSocio] = useState('all'); // 'all', 'socio1', 'socio2', 'all_wallet'
  const [filterTipo, setFilterTipo] = useState('all'); // 'all', 'digital', 'efectivo'



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
      
      // Validar que cuenta es string
      if (typeof mov.cuenta !== 'string' || !mov.cuenta.includes('_')) return;
      
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
            // COMPRA: Casa de cambio compra (paga) = EGRESO
            // VENTA: Casa de cambio vende (cobra) = INGRESO
            if (mov.subOperacion === 'VENTA') {
              esIngreso = true;
            } else if (mov.subOperacion === 'ARBITRAJE') {
              // ARBITRAJE: Procesar las 4 cuentas involucradas
              // 1. Cuenta donde recibimos (walletCompra) - INGRESO de moneda
              if (mov.walletCompra && typeof mov.walletCompra === 'string') {
                const cuentaRecibeParts = mov.walletCompra.split('_');
                if (cuentaRecibeParts.length === 2) {
                  const [socioRecibe, tipoRecibe] = cuentaRecibeParts;
                  const keyRecibe = `${socioRecibe}-${tipoRecibe}-${mov.moneda}`;
                  const saldoRecibe = saldosMap.get(keyRecibe);
                  if (saldoRecibe) {
                    saldoRecibe.ingresos += monto;
                    saldoRecibe.saldo += monto;
                    saldoRecibe.movimientosCount++;
                  }
                }
              }
              
              // 2. Cuenta desde donde pagamos (walletTC) - EGRESO de monedaTC
              if (mov.walletTC && mov.totalCompra && typeof mov.walletTC === 'string') {
                const cuentaPagaParts = mov.walletTC.split('_');
                if (cuentaPagaParts.length === 2) {
                  const [socioPaga, tipoPaga] = cuentaPagaParts;
                  const keyPaga = `${socioPaga}-${tipoPaga}-${mov.monedaTC}`;
                  const saldoPaga = saldosMap.get(keyPaga);
                  if (saldoPaga) {
                    const totalCompra = safeParseFloat(mov.totalCompra);
                    saldoPaga.egresos += totalCompra;
                    saldoPaga.saldo -= totalCompra;
                    saldoPaga.movimientosCount++;
                  }
                }
              }
              
              // 3. Cuenta desde donde entregamos (walletCompraVenta) - EGRESO de monedaVenta
              if (mov.walletCompraVenta && mov.montoVenta && typeof mov.walletCompraVenta === 'string') {
                const cuentaEntregaParts = mov.walletCompraVenta.split('_');
                if (cuentaEntregaParts.length === 2) {
                  const [socioEntrega, tipoEntrega] = cuentaEntregaParts;
                  // monedaVenta es monedaTC en la lógica de arbitraje
                  const keyEntrega = `${socioEntrega}-${tipoEntrega}-${mov.monedaTC}`;
                  const saldoEntrega = saldosMap.get(keyEntrega);
                  if (saldoEntrega) {
                    const montoVenta = safeParseFloat(mov.montoVenta);
                    saldoEntrega.egresos += montoVenta;
                    saldoEntrega.saldo -= montoVenta;
                    saldoEntrega.movimientosCount++;
                  }
                }
              }
              
              // 4. Cuenta donde cobramos (walletTCVenta) - INGRESO de monedaTCVenta
              if (mov.walletTCVenta && mov.totalVenta && typeof mov.walletTCVenta === 'string') {
                const cuentaCobraParts = mov.walletTCVenta.split('_');
                if (cuentaCobraParts.length === 2) {
                  const [socioCobra, tipoCobra] = cuentaCobraParts;
                  // monedaTCVenta es moneda en la lógica de arbitraje
                  const keyCobra = `${socioCobra}-${tipoCobra}-${mov.moneda}`;
                  const saldoCobra = saldosMap.get(keyCobra);
                  if (saldoCobra) {
                    const totalVenta = safeParseFloat(mov.totalVenta);
                    saldoCobra.ingresos += totalVenta;
                    saldoCobra.saldo += totalVenta;
                    saldoCobra.movimientosCount++;
                  }
                }
              }
              
              // No procesar la cuenta principal para arbitraje
              return;
            } else {
              esIngreso = false;
            }
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
            if (mov.cuentaDestino && typeof mov.cuentaDestino === 'string') {
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
      
      // Procesar pagos mixtos si existen
      if (mov.walletTC === 'pago_mixto' && mov.mixedPayments && Array.isArray(mov.mixedPayments)) {
        mov.mixedPayments.forEach(payment => {
          if (!payment.socio || !payment.tipo || !payment.monto) return;
          
          const montoMixto = safeParseFloat(payment.monto);
          if (montoMixto <= 0) return;
          
          const keyMixto = `${payment.socio}-${payment.tipo}-${mov.monedaTC || mov.moneda}`;
          const saldoMixto = saldosMap.get(keyMixto);
          
          if (saldoMixto) {
            // Para pago mixto, siempre es egreso (estamos pagando)
            saldoMixto.egresos += montoMixto;
            saldoMixto.saldo -= montoMixto;
            saldoMixto.movimientosCount++;
          }
        });
      }
    });

    // Agregar saldos iniciales
    const saldosIniciales = initialBalanceService.getAllBalances();
    Object.entries(saldosIniciales).forEach(([key, monto]) => {
      // Validar que key es string
      if (typeof key !== 'string' || !key.includes('-')) return;
      
      const [cuenta, moneda] = key.split('-');
      if (!cuenta || !moneda) return;
      
      // Extraer socio y tipo de la cuenta
      if (typeof cuenta !== 'string' || !cuenta.includes('_')) return;
      
      const cuentaParts = cuenta.split('_');
      if (cuentaParts.length !== 2) return;
      
      const [socio, tipo] = cuentaParts;
      if (!['socio1', 'socio2', 'all'].includes(socio)) return;
      if (!['digital', 'efectivo'].includes(tipo)) return;
      
      const saldoKey = `${socio}-${tipo}-${moneda}`;
      const saldo = saldosMap.get(saldoKey);
      
      if (saldo) {
        const montoInicial = safeParseFloat(monto);
        saldo.saldo += montoInicial;
        // También agregamos a ingresos para que se refleje en el total
        saldo.ingresos += montoInicial;
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
                          total.total >= 0 ? 'border-gray-300 bg-gray-50' : 'border-gray-400 bg-gray-100'
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