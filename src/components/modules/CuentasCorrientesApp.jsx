import React, { useState, useMemo } from 'react';
import {
  Building2,
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  Eye
} from 'lucide-react';
import { formatAmountWithCurrency, proveedoresCC } from '../base';
import { safeParseFloat } from '../../utils/safeOperations';

/** COMPONENTE PRINCIPAL DE CUENTAS CORRIENTES */
function CuentasCorrientesApp({ movements, onNavigate }) {
  const [currentView, setCurrentView] = useState('summary'); // 'summary' o 'detail'
  const [selectedProviderForDetail, setSelectedProviderForDetail] = useState(null);

  // Calcular las cuentas corrientes y sus saldos
  const allCalculatedAccounts = useMemo(() => {
    const accountsMap = new Map();

    // Inicializar todas las combinaciones posibles de proveedor-moneda
    proveedoresCC.forEach(p => {
      if (p.value !== '') {
        p.allowedCurrencies.forEach(currency => {
          const key = `${p.value}-${currency}`;
          accountsMap.set(key, {
            proveedor: p.value,
            proveedorLabel: p.label,
            moneda: currency,
            ingresos: 0,
            egresos: 0,
            saldo: 0,
            debeUsuario: 0,
            debeProveedor: 0,
            movimientosCount: 0,
          });
        });
      }
    });

    // Procesar movimientos de cuentas corrientes
    movements.forEach(mov => {
      if (mov.operacion === 'CUENTAS_CORRIENTES' && mov.proveedorCC && mov.moneda && mov.monto) {
        const key = `${mov.proveedorCC}-${mov.moneda}`;
        const account = accountsMap.get(key);

        if (account) {
          const amount = safeParseFloat(mov.monto);
          account.movimientosCount++;
          
          if (mov.subOperacion === 'INGRESO') {
            account.ingresos += amount;
            account.saldo += amount;
          } else if (mov.subOperacion === 'EGRESO') {
            account.egresos += amount;
            account.saldo -= amount;
          }
        }
      }
    });

    // Calcular quién debe a quién
    accountsMap.forEach(account => {
      if (account.saldo < 0) {
        account.debeUsuario = Math.abs(account.saldo);
        account.debeProveedor = 0;
      } else {
        account.debeProveedor = account.saldo;
        account.debeUsuario = 0;
      }
    });

    return Array.from(accountsMap.values()).filter(account => 
      account.ingresos > 0 || account.egresos > 0 || account.saldo !== 0
    );
  }, [movements]);

  // Calcular los totales por proveedor para la vista de resumen
  const summaryTotals = useMemo(() => {
    const totalsByProvider = new Map();

    allCalculatedAccounts.forEach(account => {
      if (!totalsByProvider.has(account.proveedor)) {
        totalsByProvider.set(account.proveedor, {
          proveedor: account.proveedor,
          proveedorLabel: account.proveedorLabel,
          ingresos: 0,
          egresos: 0,
          saldo: 0,
          debeUsuario: 0,
          debeProveedor: 0,
          cantidadMonedas: 0,
          monedas: new Set(),
          movimientosCount: 0,
        });
      }
      
      const providerTotal = totalsByProvider.get(account.proveedor);
      providerTotal.ingresos += account.ingresos;
      providerTotal.egresos += account.egresos;
      providerTotal.saldo += account.saldo;
      providerTotal.debeUsuario += account.debeUsuario;
      providerTotal.debeProveedor += account.debeProveedor;
      providerTotal.monedas.add(account.moneda);
      providerTotal.cantidadMonedas = providerTotal.monedas.size;
      providerTotal.movimientosCount += account.movimientosCount;
    });

    return Array.from(totalsByProvider.values()).sort((a, b) => 
      a.proveedor.localeCompare(b.proveedor)
    );
  }, [allCalculatedAccounts]);

  // Cuentas a mostrar en la vista de detalle
  const detailedAccounts = useMemo(() => {
    if (!selectedProviderForDetail) return [];
    return allCalculatedAccounts
      .filter(acc => acc.proveedor === selectedProviderForDetail)
      .sort((a, b) => a.moneda.localeCompare(b.moneda));
  }, [allCalculatedAccounts, selectedProviderForDetail]);

  // Totales para la vista de detalle
  const detailedViewTotals = useMemo(() => {
    const totals = {
      ingresos: 0,
      egresos: 0,
      saldo: 0,
      debeUsuario: 0,
      debeProveedor: 0,
      movimientosCount: 0,
    };

    detailedAccounts.forEach(account => {
      totals.ingresos += account.ingresos;
      totals.egresos += account.egresos;
      totals.saldo += account.saldo;
      totals.debeUsuario += account.debeUsuario;
      totals.debeProveedor += account.debeProveedor;
      totals.movimientosCount += account.movimientosCount;
    });
    
    return totals;
  }, [detailedAccounts]);

  const handleSelectProvider = (provider) => {
    setSelectedProviderForDetail(provider);
    setCurrentView('detail');
  };

  const handleBackToSummary = () => {
    setCurrentView('summary');
    setSelectedProviderForDetail(null);
  };

  const getProviderLabel = (providerCode) => {
    const provider = proveedoresCC.find(p => p.value === providerCode);
    return provider ? provider.label : providerCode;
  };

  // Vista de resumen
  if (currentView === 'summary') {
    return (
      <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6 safe-top safe-bottom lg:pt-6 pt-16">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="card mb-4 sm:mb-6">
            <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-100">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 size={20} className="sm:w-6 sm:h-6 text-primary-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                      Cuentas Corrientes
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Resumen por proveedor • {summaryTotals.length} proveedor{summaryTotals.length !== 1 ? 'es' : ''} activo{summaryTotals.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => onNavigate('nuevoMovimiento')} 
                  className="btn-primary flex items-center justify-center gap-2 touch-target w-full sm:w-auto"
                >
                  <Building2 size={18} />
                  <span>Nueva Cuenta</span>
                </button>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-3 sm:p-4 lg:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-4 sm:mb-6">
                Resumen por Proveedor
              </h2>
              
              {summaryTotals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {summaryTotals.map((providerSummary) => (
                    <div
                      key={providerSummary.proveedor}
                      className="bg-gradient-to-br from-primary-50 to-warning-50 border border-primary-200 rounded-xl p-4 sm:p-6 cursor-pointer hover:from-primary-100 hover:to-warning-100 transition-all duration-200 hover:scale-102 hover:shadow-medium"
                      onClick={() => handleSelectProvider(providerSummary.proveedor)}
                    >
                      {/* Header del proveedor */}
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <h3 className="font-bold text-primary-800 text-sm sm:text-base truncate">
                          {getProviderLabel(providerSummary.proveedor)}
                        </h3>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className="text-xs text-primary-600 bg-primary-100 px-2 py-1 rounded-full">
                            {providerSummary.cantidadMonedas} moneda{providerSummary.cantidadMonedas !== 1 ? 's' : ''}
                          </span>
                          <ChevronRight size={16} className="text-primary-600" />
                        </div>
                      </div>

                      {/* Métricas principales */}
                      <div className="space-y-2 sm:space-y-3 text-sm">
                        {/* Ingresos y Egresos */}
                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                          <div className="bg-white rounded-lg p-2 sm:p-3 text-center">
                            <TrendingUp size={14} className="text-success-500 mx-auto mb-1" />
                            <p className="text-xs text-gray-500">Ingresos</p>
                            <p className="font-semibold text-success-600 text-xs sm:text-sm">
                              {providerSummary.ingresos.toLocaleString('es-AR', { 
                                minimumFractionDigits: 0, 
                                maximumFractionDigits: 0 
                              })}
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-2 sm:p-3 text-center">
                            <TrendingDown size={14} className="text-error-500 mx-auto mb-1" />
                            <p className="text-xs text-gray-500">Egresos</p>
                            <p className="font-semibold text-error-600 text-xs sm:text-sm">
                              {providerSummary.egresos.toLocaleString('es-AR', { 
                                minimumFractionDigits: 0, 
                                maximumFractionDigits: 0 
                              })}
                            </p>
                          </div>
                        </div>

                        {/* Saldo consolidado */}
                        <div className="bg-white rounded-lg p-2 sm:p-3">
                          <p className="text-xs text-gray-500 text-center mb-1">Saldo Consolidado</p>
                          <p className={`font-bold text-center text-sm sm:text-base ${
                            providerSummary.saldo < 0 ? 'text-error-600' : 'text-success-600'
                          }`}>
                            {providerSummary.saldo.toLocaleString('es-AR', { 
                              minimumFractionDigits: 0, 
                              maximumFractionDigits: 0 
                            })}
                          </p>
                        </div>

                        {/* Estado de deuda */}
                        {providerSummary.debeUsuario > 0 && (
                          <div className="bg-error-100 rounded-lg p-2 sm:p-3 text-center">
                            <AlertCircle size={14} className="text-error-600 mx-auto mb-1" />
                            <p className="text-xs text-error-700 font-medium">
                              Nosotros debemos: {providerSummary.debeUsuario.toLocaleString('es-AR', { 
                                minimumFractionDigits: 0, 
                                maximumFractionDigits: 0 
                              })}
                            </p>
                          </div>
                        )}
                        
                        {providerSummary.debeProveedor > 0 && (
                          <div className="bg-success-100 rounded-lg p-2 sm:p-3 text-center">
                            <DollarSign size={14} className="text-success-600 mx-auto mb-1" />
                            <p className="text-xs text-success-700 font-medium">
                              Nos deben: {providerSummary.debeProveedor.toLocaleString('es-AR', { 
                                minimumFractionDigits: 0, 
                                maximumFractionDigits: 0 
                              })}
                            </p>
                          </div>
                        )}

                        {/* Contador de movimientos */}
                        <div className="text-center pt-2 border-t border-primary-200">
                          <p className="text-xs text-primary-600">
                            {providerSummary.movimientosCount} movimiento{providerSummary.movimientosCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <Building2 size={40} className="sm:w-12 sm:h-12 mx-auto text-gray-300 mb-3 sm:mb-4" />
                  <p className="text-sm sm:text-base text-gray-500 mb-2">No hay cuentas corrientes activas</p>
                  <p className="text-xs sm:text-sm text-gray-400 mb-4">
                    Las cuentas corrientes aparecerán aquí cuando se registren movimientos de INGRESO o EGRESO con proveedores
                  </p>
                  <button
                    onClick={() => onNavigate('nuevoMovimiento')}
                    className="btn-primary touch-target"
                  >
                    Registrar primera cuenta corriente
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vista de detalle
  if (currentView === 'detail' && selectedProviderForDetail) {
    return (
      <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6 safe-top safe-bottom lg:pt-6 pt-16">
        <div className="max-w-7xl mx-auto">
          {/* Header con navegación */}
          <div className="card mb-4 sm:mb-6">
            <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-2 sm:mb-3">
                <button
                  onClick={handleBackToSummary}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 touch-target"
                  aria-label="Volver al resumen"
                >
                  <ArrowLeft size={18} className="text-gray-600" />
                </button>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 size={20} className="sm:w-6 sm:h-6 text-primary-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                    Detalle de {getProviderLabel(selectedProviderForDetail)}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {detailedAccounts.length} moneda{detailedAccounts.length !== 1 ? 's' : ''} • {detailedViewTotals.movimientosCount} movimiento{detailedViewTotals.movimientosCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              
              {/* Breadcrumb */}
              <nav className="text-xs sm:text-sm text-gray-500">
                <button 
                  onClick={handleBackToSummary}
                  className="hover:text-gray-700 transition-colors"
                >
                  Cuentas Corrientes
                </button>
                <span className="mx-2">›</span>
                <span className="text-gray-700 font-medium">
                  {getProviderLabel(selectedProviderForDetail)}
                </span>
              </nav>
            </div>

            {/* Contenido del detalle */}
            <div className="p-3 sm:p-4 lg:p-6">
              {detailedAccounts.length > 0 ? (
                <>
                  {/* Tabla de detalles por moneda - Desktop */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Moneda
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ingresos
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Egresos
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Saldo
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estado
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {detailedAccounts.map((account, index) => (
                          <tr key={`${account.proveedor}-${account.moneda}-${index}`} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className="text-sm font-medium text-gray-900">{account.moneda}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-success-600 font-medium">
                              {formatAmountWithCurrency(account.ingresos, account.moneda)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-error-600 font-medium">
                              {formatAmountWithCurrency(account.egresos, account.moneda)}
                            </td>
                            <td className={`px-4 py-4 whitespace-nowrap text-right text-sm font-bold ${
                              account.saldo < 0 ? 'text-error-600' : 'text-success-600'
                            }`}>
                              {formatAmountWithCurrency(account.saldo, account.moneda)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                              {account.debeUsuario > 0 ? (
                                <span className="px-2 py-1 bg-error-100 text-error-700 rounded-full text-xs font-medium">
                                  Nosotros: {formatAmountWithCurrency(account.debeUsuario, account.moneda)}
                                </span>
                              ) : account.debeProveedor > 0 ? (
                                <span className="px-2 py-1 bg-success-100 text-success-700 rounded-full text-xs font-medium">
                                  Nos deben: {formatAmountWithCurrency(account.debeProveedor, account.moneda)}
                                </span>
                              ) : (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                  Sin saldo
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                        
                        {/* Fila de totales */}
                        <tr className="bg-primary-50 font-bold">
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-primary-800">
                            TOTAL {getProviderLabel(selectedProviderForDetail)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-primary-800">
                            {detailedViewTotals.ingresos.toLocaleString('es-AR', { 
                              minimumFractionDigits: 2, 
                              maximumFractionDigits: 2 
                            })}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-primary-800">
                            {detailedViewTotals.egresos.toLocaleString('es-AR', { 
                              minimumFractionDigits: 2, 
                              maximumFractionDigits: 2 
                            })}
                          </td>
                          <td className={`px-4 py-4 whitespace-nowrap text-right text-sm font-bold ${
                            detailedViewTotals.saldo < 0 ? 'text-error-600' : 'text-success-600'
                          }`}>
                            {detailedViewTotals.saldo.toLocaleString('es-AR', { 
                              minimumFractionDigits: 2, 
                              maximumFractionDigits: 2 
                            })}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                            {detailedViewTotals.debeUsuario > 0 ? (
                              <span className="text-error-800 text-xs font-medium">
                                Nosotros: {detailedViewTotals.debeUsuario.toLocaleString('es-AR', { 
                                  minimumFractionDigits: 2, 
                                  maximumFractionDigits: 2 
                                })}
                              </span>
                            ) : detailedViewTotals.debeProveedor > 0 ? (
                              <span className="text-success-800 text-xs font-medium">
                                Nos deben: {detailedViewTotals.debeProveedor.toLocaleString('es-AR', { 
                                  minimumFractionDigits: 2, 
                                  maximumFractionDigits: 2 
                                })}
                              </span>
                            ) : (
                              <span className="text-gray-600 text-xs">Balanceado</span>
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Cards de detalles por moneda - Mobile */}
                  <div className="sm:hidden space-y-3">
                    {detailedAccounts.map((account, index) => (
                      <div key={`${account.proveedor}-${account.moneda}-${index}`} className="card">
                        <div className="p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">{account.moneda}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              account.saldo < 0 ? 'bg-error-100 text-error-700' : 'bg-success-100 text-success-700'
                            }`}>
                              {account.saldo < 0 ? 'Debemos' : 'Nos deben'}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="text-gray-500 text-xs">Ingresos</p>
                              <p className="font-medium text-success-600">
                                {formatAmountWithCurrency(account.ingresos, account.moneda)}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs">Egresos</p>
                              <p className="font-medium text-error-600">
                                {formatAmountWithCurrency(account.egresos, account.moneda)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="pt-2 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">Saldo</span>
                              <span className={`font-bold ${
                                account.saldo < 0 ? 'text-error-600' : 'text-success-600'
                              }`}>
                                {formatAmountWithCurrency(account.saldo, account.moneda)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Card de totales para mobile */}
                    <div className="card bg-primary-50 border-primary-200">
                      <div className="p-3 space-y-2">
                        <h3 className="font-bold text-primary-800">
                          TOTAL {getProviderLabel(selectedProviderForDetail)}
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-primary-600 text-xs">Total Ingresos</p>
                            <p className="font-medium text-primary-800">
                              {detailedViewTotals.ingresos.toLocaleString('es-AR', { 
                                minimumFractionDigits: 2, 
                                maximumFractionDigits: 2 
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-primary-600 text-xs">Total Egresos</p>
                            <p className="font-medium text-primary-800">
                              {detailedViewTotals.egresos.toLocaleString('es-AR', { 
                                minimumFractionDigits: 2, 
                                maximumFractionDigits: 2 
                              })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="pt-2 border-t border-primary-200">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-primary-600">Saldo Total</span>
                            <span className={`font-bold ${
                              detailedViewTotals.saldo < 0 ? 'text-error-600' : 'text-success-600'
                            }`}>
                              {detailedViewTotals.saldo.toLocaleString('es-AR', { 
                                minimumFractionDigits: 2, 
                                maximumFractionDigits: 2 
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <Building2 size={40} className="sm:w-12 sm:h-12 mx-auto text-gray-300 mb-3 sm:mb-4" />
                  <p className="text-sm sm:text-base text-gray-500 mb-2">
                    No se encontraron movimientos para {getProviderLabel(selectedProviderForDetail)}
                  </p>
                  <button
                    onClick={handleBackToSummary}
                    className="text-primary-600 hover:text-primary-700 text-sm underline"
                  >
                    Volver al resumen
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default CuentasCorrientesApp;