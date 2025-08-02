import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  ArrowLeft,
  ChevronRight,
  DollarSign,
  TrendingUp,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle,
  Phone,
  MapPin,
  Hash
} from 'lucide-react';
import { formatAmountWithCurrency } from '../../shared/components/forms';
import { safeParseFloat } from '../../shared/services/safeOperations';

/** COMPONENTE PRINCIPAL DE PRESTAMISTAS */
function PrestamistasApp({ clients, movements, onNavigate }) {
  const [currentView, setCurrentView] = useState('summary'); // 'summary' o 'detail'
  const [selectedPrestamista, setSelectedPrestamista] = useState(null);

  // Filtrar clientes prestamistas
  const prestamistaClients = useMemo(() => {
    return clients.filter(client => client.tipoCliente === 'prestamistas');
  }, [clients]);

  // Función para calcular balances de un prestamista específico
  const calculatePrestamistaBalances = (prestamistaId, allMovements, allClients) => {
    const prestamistaClient = allClients.find(c => c.id === prestamistaId);
    if (!prestamistaClient) return null;

    const clientFullName = `${prestamistaClient.nombre} ${prestamistaClient.apellido}`;

    // Obtener movimientos relevantes y ordenarlos cronológicamente
    const relevantMovements = allMovements
      .filter(mov => 
        mov.operacion === 'PRESTAMISTAS' && 
        (mov.cliente === prestamistaClient.nombre || mov.cliente === clientFullName)
      )
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    const balancesByCurrency = {}; // { currency: { principal, interestAccrued, lastCalculationDate, effectiveRate } }

    // Procesar cada movimiento cronológicamente
    relevantMovements.forEach(mov => {
      const currency = mov.moneda;
      if (!balancesByCurrency[currency]) {
        balancesByCurrency[currency] = { 
          principal: 0, 
          interestAccrued: 0, 
          lastCalculationDate: new Date(0), 
          effectiveRate: 0 
        };
      }

      const currentBalance = balancesByCurrency[currency];
      const movementDate = new Date(mov.fecha);

      // Acumular intereses hasta la fecha del movimiento actual
      if (currentBalance.principal > 0 && currentBalance.effectiveRate > 0) {
        const daysToAccrue = Math.ceil(
          (movementDate.getTime() - currentBalance.lastCalculationDate.getTime()) / (1000 * 3600 * 24)
        );
        if (daysToAccrue > 0) {
          currentBalance.interestAccrued += 
            currentBalance.principal * (currentBalance.effectiveRate / 100 / 365) * daysToAccrue;
        }
      }

      // Aplicar el movimiento
      if (mov.subOperacion === 'PRESTAMO') {
        const amount = safeParseFloat(mov.monto, 0);
        currentBalance.principal += amount;
        currentBalance.effectiveRate = safeParseFloat(mov.interes, currentBalance.effectiveRate);
      } else if (mov.subOperacion === 'RETIRO') {
        const amount = safeParseFloat(mov.monto, 0);
        // Aplicar retiro: primero a intereses, luego a principal
        if (currentBalance.interestAccrued >= amount) {
          currentBalance.interestAccrued -= amount;
        } else {
          const remainingAmount = amount - currentBalance.interestAccrued;
          currentBalance.interestAccrued = 0;
          currentBalance.principal = Math.max(0, currentBalance.principal - remainingAmount);
        }
      }
      
      currentBalance.lastCalculationDate = movementDate;
    });

    // Acumular intereses hasta hoy para el balance final
    const today = new Date();
    for (const currency in balancesByCurrency) {
      const balance = balancesByCurrency[currency];
      if (balance.principal > 0 && balance.effectiveRate > 0) {
        const daysToAccrue = Math.ceil(
          (today.getTime() - balance.lastCalculationDate.getTime()) / (1000 * 3600 * 24)
        );
        if (daysToAccrue > 0) {
          balance.interestAccrued += 
            balance.principal * (balance.effectiveRate / 100 / 365) * daysToAccrue;
        }
      }
    }

    // Calcular resúmenes finales
    const finalSummary = {
      totalPrincipalLent: {},
      totalRetiros: {},
      totalAccruedInterest: {},
      netBalance: {},
      movimientosCount: relevantMovements.length,
    };

    // Calcular totales de préstamos y retiros por separado
    relevantMovements.forEach(mov => {
      const currency = mov.moneda;
      const amount = safeParseFloat(mov.monto, 0);
      if (mov.subOperacion === 'PRESTAMO') {
        finalSummary.totalPrincipalLent[currency] = 
          (finalSummary.totalPrincipalLent[currency] || 0) + amount;
      } else if (mov.subOperacion === 'RETIRO') {
        finalSummary.totalRetiros[currency] = 
          (finalSummary.totalRetiros[currency] || 0) + amount;
      }
    });

    // Calcular balances netos finales
    for (const currency in balancesByCurrency) {
      const balance = balancesByCurrency[currency];
      finalSummary.totalAccruedInterest[currency] = balance.interestAccrued;
      finalSummary.netBalance[currency] = balance.principal + balance.interestAccrued;
    }

    return finalSummary;
  };

  // Calcular resumen para cada prestamista
  const prestamistaSummary = useMemo(() => {
    return prestamistaClients.map(client => {
      const summary = calculatePrestamistaBalances(client.id, movements, clients);
      return {
        client: client,
        summary: summary,
      };
    });
  }, [prestamistaClients, movements, clients]);

  const handleViewDetail = (prestamistaClient) => {
    setSelectedPrestamista(prestamistaClient);
    setCurrentView('detail');
  };

  const handleBackToSummary = () => {
    setCurrentView('summary');
    setSelectedPrestamista(null);
  };

  // Vista de resumen
  if (currentView === 'summary') {
    return (
      <div className="min-h-screen bg-gray-50 p-2 sm:p-3 lg:p-4 safe-top safe-bottom pt-16 overflow-x-hidden">
        <div className="w-full max-w-7xl mx-auto">
          {/* Header */}
          <div className="card mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 lg:p-4 border-b border-gray-100">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-warning-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CreditCard size={20} className="sm:w-6 sm:h-6 text-warning-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                      Gestión de Prestamistas
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {prestamistaSummary.length} prestamista{prestamistaSummary.length !== 1 ? 's' : ''} registrado{prestamistaSummary.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => onNavigate('nuevoMovimiento')} 
                  className="btn-primary flex items-center justify-center gap-2 touch-target w-full sm:w-auto"
                >
                  <CreditCard size={18} />
                  <span>Nuevo Préstamo</span>
                </button>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-2 sm:p-3 lg:p-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 sm:mb-4">
                Resumen de Prestamistas
              </h2>

              {prestamistaSummary.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {prestamistaSummary.map(summaryData => {
                    const hasActiveBalances = summaryData.summary && 
                      Object.keys(summaryData.summary.netBalance).length > 0;
                    
                    return (
                      <div
                        key={summaryData.client.id}
                        className="bg-gradient-to-br from-warning-50 to-error-50 border border-warning-200 rounded-xl p-4 sm:p-6 cursor-pointer hover:from-warning-100 hover:to-error-100 transition-all duration-200 hover:scale-102 hover:shadow-medium"
                        onClick={() => handleViewDetail(summaryData.client)}
                      >
                        {/* Header del prestamista */}
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <User size={16} className="text-warning-600 flex-shrink-0" />
                            <h3 className="font-bold text-warning-800 text-sm sm:text-base truncate">
                              {summaryData.client.nombre} {summaryData.client.apellido}
                            </h3>
                          </div>
                          <ChevronRight size={16} className="text-warning-600 flex-shrink-0" />
                        </div>

                        {/* Estado del prestamista */}
                        {hasActiveBalances ? (
                          <div className="space-y-2 sm:space-y-3">
                            {Object.entries(summaryData.summary.netBalance).map(([currency, balance]) => {
                              const isPositive = balance > 0;
                              return (
                                <div key={currency} className="bg-white rounded-lg p-2 sm:p-3">
                                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                                    <span className="text-xs font-medium text-gray-600">{currency}</span>
                                    {isPositive ? (
                                      <AlertTriangle size={14} className="text-error-500" />
                                    ) : (
                                      <CheckCircle size={14} className="text-success-500" />
                                    )}
                                  </div>
                                  <p className={`font-bold text-xs sm:text-sm ${
                                    isPositive ? 'text-error-600' : 'text-success-600'
                                  }`}>
                                    {isPositive 
                                      ? `Les debemos: ${formatAmountWithCurrency(balance, currency)}`
                                      : balance < 0 
                                        ? `Nos deben: ${formatAmountWithCurrency(Math.abs(balance), currency)}`
                                        : 'Sin saldo'
                                    }
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="bg-white rounded-lg p-3 sm:p-4 text-center">
                            <CheckCircle size={20} className="text-gray-400 mx-auto mb-2" />
                            <p className="text-xs sm:text-sm text-gray-500">Sin movimientos activos</p>
                          </div>
                        )}

                        {/* Información de contacto */}
                        <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-warning-200">
                          <div className="flex items-center gap-1 text-xs text-warning-700 mb-1">
                            <Phone size={12} />
                            <span className="truncate">{summaryData.client.telefono}</span>
                          </div>
                          {summaryData.summary && summaryData.summary.movimientosCount > 0 && (
                            <p className="text-xs text-warning-600">
                              {summaryData.summary.movimientosCount} movimiento{summaryData.summary.movimientosCount !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <CreditCard size={40} className="sm:w-12 sm:h-12 mx-auto text-gray-300 mb-3 sm:mb-4" />
                  <p className="text-sm sm:text-base text-gray-500 mb-2">No hay prestamistas registrados</p>
                  <p className="text-xs sm:text-sm text-gray-400 mb-4">
                    Los prestamistas aparecerán aquí cuando se registren clientes con tipo "prestamistas"
                  </p>
                  <button
                    onClick={() => onNavigate('clientes')}
                    className="btn-primary touch-target"
                  >
                    Registrar prestamistas
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
  if (currentView === 'detail' && selectedPrestamista) {
    return (
      <PrestamistaDetailView
        prestamista={selectedPrestamista}
        allMovements={movements}
        clients={clients}
        onBack={handleBackToSummary}
      />
    );
  }

  return null;
}

/** COMPONENTE DE VISTA DETALLADA DE PRESTAMISTA */
function PrestamistaDetailView({ prestamista, allMovements, clients, onBack }) {
  // Procesar movimientos con balances corrientes
  const processedMovements = useMemo(() => {
    const clientFullName = `${prestamista.nombre} ${prestamista.apellido}`;
    const relevantMovements = allMovements
      .filter(mov => 
        mov.operacion === 'PRESTAMISTAS' && 
        (mov.cliente === prestamista.nombre || mov.cliente === clientFullName)
      )
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    const runningBalances = {}; // { currency: { principal, interestAccrued, lastCalculationDate, effectiveRate } }
    const movementsWithRunningBalance = [];

    relevantMovements.forEach(mov => {
      const currency = mov.moneda;
      if (!runningBalances[currency]) {
        runningBalances[currency] = { 
          principal: 0, 
          interestAccrued: 0, 
          lastCalculationDate: new Date(0), 
          effectiveRate: 0 
        };
      }

      const currentBalance = runningBalances[currency];
      const movementDate = new Date(mov.fecha);

      // Acumular intereses hasta este movimiento
      if (currentBalance.principal > 0 && currentBalance.effectiveRate > 0) {
        const daysToAccrue = Math.ceil(
          (movementDate.getTime() - currentBalance.lastCalculationDate.getTime()) / (1000 * 3600 * 24)
        );
        if (daysToAccrue > 0) {
          currentBalance.interestAccrued += 
            currentBalance.principal * (currentBalance.effectiveRate / 100 / 365) * daysToAccrue;
        }
      }

      // Aplicar el movimiento
      if (mov.subOperacion === 'PRESTAMO') {
        const amount = safeParseFloat(mov.monto, 0);
        currentBalance.principal += amount;
        currentBalance.effectiveRate = safeParseFloat(mov.interes, currentBalance.effectiveRate);
      } else if (mov.subOperacion === 'RETIRO') {
        const amount = safeParseFloat(mov.monto, 0);
        if (currentBalance.interestAccrued >= amount) {
          currentBalance.interestAccrued -= amount;
        } else {
          const remainingAmount = amount - currentBalance.interestAccrued;
          currentBalance.interestAccrued = 0;
          currentBalance.principal = Math.max(0, currentBalance.principal - remainingAmount);
        }
      }
      
      currentBalance.lastCalculationDate = movementDate;

      // Guardar snapshot del balance después del movimiento
      movementsWithRunningBalance.push({
        ...mov,
        currentPrincipalSnapshot: currentBalance.principal,
        currentInterestAccruedSnapshot: currentBalance.interestAccrued,
        currentNetBalanceSnapshot: currentBalance.principal + currentBalance.interestAccrued,
      });
    });

    // Acumular intereses finales hasta hoy
    const today = new Date();
    const finalBalances = {};
    for (const currency in runningBalances) {
      const balance = runningBalances[currency];
      if (balance.principal > 0 && balance.effectiveRate > 0) {
        const daysToAccrue = Math.ceil(
          (today.getTime() - balance.lastCalculationDate.getTime()) / (1000 * 3600 * 24)
        );
        if (daysToAccrue > 0) {
          balance.interestAccrued += 
            balance.principal * (balance.effectiveRate / 100 / 365) * daysToAccrue;
        }
      }
      finalBalances[currency] = {
        principal: balance.principal,
        interestAccrued: balance.interestAccrued,
        netBalance: balance.principal + balance.interestAccrued,
        effectiveRate: balance.effectiveRate,
      };
    }

    return {
      movements: movementsWithRunningBalance.reverse(), // Mostrar más recientes primero
      finalBalances: finalBalances,
    };
  }, [prestamista, allMovements, clients]);

  const finalBalances = processedMovements.finalBalances;

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-3 lg:p-4 safe-top safe-bottom pt-16 overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header con navegación */}
        <div className="card mb-3 sm:mb-4">
          <div className="p-2 sm:p-3 lg:p-4 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-2 sm:mb-3">
              <button
                onClick={onBack}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 touch-target flex-shrink-0"
                aria-label="Volver al resumen"
              >
                <ArrowLeft size={18} className="text-gray-600" />
              </button>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-warning-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CreditCard size={20} className="sm:w-6 sm:h-6 text-warning-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                  {prestamista.nombre} {prestamista.apellido}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500">
                  Detalle completo de préstamos e intereses
                </p>
              </div>
            </div>
            
            {/* Breadcrumb */}
            <nav className="text-xs sm:text-sm text-gray-500">
              <button 
                onClick={onBack}
                className="hover:text-gray-700 transition-colors"
              >
                Prestamistas
              </button>
              <span className="mx-2">›</span>
              <span className="text-gray-700 font-medium">
                {prestamista.nombre} {prestamista.apellido}
              </span>
            </nav>
          </div>

          {/* Contenido del detalle */}
          <div className="p-2 sm:p-3 lg:p-4 space-y-4 sm:space-y-6">
            {/* Métricas principales */}
            {Object.keys(finalBalances).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {Object.entries(finalBalances).map(([currency, balance]) => (
                  <React.Fragment key={currency}>
                    <div className="bg-primary-50 p-3 sm:p-4 rounded-lg text-center">
                      <DollarSign size={18} className="text-primary-600 mx-auto mb-2" />
                      <p className="text-xs sm:text-sm font-medium text-gray-700">Principal Pendiente ({currency})</p>
                      <p className="text-base sm:text-lg lg:text-xl font-bold text-primary-600">
                        {formatAmountWithCurrency(balance.principal, currency)}
                      </p>
                      {balance.effectiveRate > 0 && (
                        <p className="text-xs text-primary-500 mt-1">
                          Tasa: {balance.effectiveRate}% anual
                        </p>
                      )}
                    </div>
                    <div className="bg-warning-50 p-3 sm:p-4 rounded-lg text-center">
                      <TrendingUp size={18} className="text-warning-600 mx-auto mb-2" />
                      <p className="text-xs sm:text-sm font-medium text-gray-700">Interés Acumulado ({currency})</p>
                      <p className="text-base sm:text-lg lg:text-xl font-bold text-warning-600">
                        {formatAmountWithCurrency(balance.interestAccrued, currency)}
                      </p>
                    </div>
                    <div className={`p-3 sm:p-4 rounded-lg text-center ${
                      balance.netBalance < 0 ? 'bg-success-50' : 'bg-error-50'
                    }`}>
                      {balance.netBalance < 0 ? (
                        <CheckCircle size={18} className="text-success-600 mx-auto mb-2" />
                      ) : (
                        <AlertTriangle size={18} className="text-error-600 mx-auto mb-2" />
                      )}
                      <p className="text-xs sm:text-sm font-medium text-gray-700">Saldo Neto ({currency})</p>
                      <p className={`text-base sm:text-lg lg:text-xl font-bold ${
                        balance.netBalance < 0 ? 'text-success-600' : 'text-error-600'
                      }`}>
                        {balance.netBalance < 0 
                          ? `Nos deben: ${formatAmountWithCurrency(Math.abs(balance.netBalance), currency)}`
                          : `Les debemos: ${formatAmountWithCurrency(balance.netBalance, currency)}`
                        }
                      </p>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 sm:p-6 rounded-lg text-center">
                <Calendar size={28} className="sm:w-8 sm:h-8 text-gray-400 mx-auto mb-3" />
                <p className="text-sm sm:text-base text-gray-500">No hay balances activos para este prestamista</p>
              </div>
            )}

            {/* Historial de movimientos */}
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 sm:mb-4">
                Historial de Movimientos
              </h2>
              
              {processedMovements.movements.length > 0 ? (
                <>
                  {/* Tabla para desktop */}
                  {/* Tabla para desktop */}
                  <div className="hidden md:block">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fecha
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tipo
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Monto
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Moneda
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Principal
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Interés Acum.
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Saldo Neto
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {processedMovements.movements.map((mov, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                              {new Date(mov.fecha).toLocaleDateString('es-ES')}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                mov.subOperacion === 'PRESTAMO' 
                                  ? 'bg-primary-100 text-primary-700' 
                                  : 'bg-success-100 text-success-700'
                              }`}>
                                {mov.subOperacion === 'PRESTAMO' ? 'Préstamo' : 'Retiro'}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                              {formatAmountWithCurrency(safeParseFloat(mov.monto), mov.moneda)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                              {mov.moneda}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-primary-600 font-medium">
                              {formatAmountWithCurrency(mov.currentPrincipalSnapshot, mov.moneda)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-warning-600 font-medium">
                              {formatAmountWithCurrency(mov.currentInterestAccruedSnapshot, mov.moneda)}
                            </td>
                            <td className={`px-4 py-3 whitespace-nowrap text-right text-sm font-bold ${
                              mov.currentNetBalanceSnapshot < 0 ? 'text-success-600' : 'text-error-600'
                            }`}>
                              {formatAmountWithCurrency(mov.currentNetBalanceSnapshot, mov.moneda)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                                      {/* Cards para mobile y tablet */}
                    <div className="md:hidden space-y-3">
                    {processedMovements.movements.map((mov, index) => (
                      <div key={index} className="card">
                        <div className="p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                mov.subOperacion === 'PRESTAMO' 
                                  ? 'bg-primary-100 text-primary-700' 
                                  : 'bg-success-100 text-success-700'
                              }`}>
                                {mov.subOperacion === 'PRESTAMO' ? 'Préstamo' : 'Retiro'}
                              </span>
                              <span className="text-xs text-gray-500">{mov.moneda}</span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(mov.fecha).toLocaleDateString('es-ES')}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="text-gray-500 text-xs">Monto</p>
                              <p className="font-medium">
                                {formatAmountWithCurrency(safeParseFloat(mov.monto), mov.moneda)}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs">Principal</p>
                              <p className="font-medium text-primary-600">
                                {formatAmountWithCurrency(mov.currentPrincipalSnapshot, mov.moneda)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="pt-2 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">Saldo Neto</span>
                              <span className={`font-bold ${
                                mov.currentNetBalanceSnapshot < 0 ? 'text-success-600' : 'text-error-600'
                              }`}>
                                {formatAmountWithCurrency(mov.currentNetBalanceSnapshot, mov.moneda)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <Calendar size={28} className="sm:w-8 sm:h-8 mx-auto text-gray-300 mb-3" />
                  <p className="text-sm sm:text-base text-gray-500">No hay movimientos registrados para este prestamista</p>
                </div>
              )}
            </div>

            {/* Información de contacto */}
            <div className="border-t pt-4 sm:pt-6">
              <h3 className="font-semibold text-gray-900 mb-3">Información de Contacto</h3>
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-gray-400" />
                  <span className="font-medium text-gray-700">Teléfono:</span> 
                  <span>{prestamista.telefono}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Hash size={14} className="text-gray-400" />
                  <span className="font-medium text-gray-700">DNI:</span> 
                  <span>{prestamista.dni}</span>
                </div>
                <div className="flex items-start gap-2 sm:col-span-2">
                  <MapPin size={14} className="text-gray-400 mt-0.5" />
                  <span className="font-medium text-gray-700">Dirección:</span> 
                  <span>{prestamista.direccion}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrestamistasApp;
export { PrestamistaDetailView };