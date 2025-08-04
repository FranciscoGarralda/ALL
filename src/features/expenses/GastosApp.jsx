import React, { useState, useMemo } from 'react';
import {
  Search,
  Edit3,
  Trash2,
  Receipt,
  CalendarDays,
  User,
  Shield,
  TrendingDown,
  Eye
} from 'lucide-react';
import { formatAmountWithCurrency } from '../../shared/components/forms';
import { safeParseFloat } from '../../shared/services/safeOperations';
import { getTodayLocalDate, isToday } from '../../shared/utils/dateUtils';

/** COMPONENTE PRINCIPAL DE GASTOS */
function GastosApp({ movements, onEditMovement, onDeleteMovement, onViewMovementDetail, onNavigate }) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar movimientos para mostrar solo gastos
  const allExpenses = useMemo(() => {
    return movements.filter(mov => 
      mov.operacion === 'ADMINISTRATIVAS' && mov.subOperacion === 'GASTO'
    );
  }, [movements]);

  // Calcular el gasto total por moneda
  const totalExpensesByCurrency = useMemo(() => {
    const totals = {};
    allExpenses.forEach(mov => {
      const currency = mov.moneda;
      if (currency) {
        totals[currency] = (totals[currency] || 0) + safeParseFloat(mov.monto);
      }
    });
    return totals;
  }, [allExpenses]);

  // Calcular el gasto mensual (del mes actual) por moneda
  const monthlyExpensesByCurrency = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthly = {};

    allExpenses.forEach(mov => {
      if (mov.fecha) {
        const moveDate = new Date(mov.fecha);
        if (moveDate.getMonth() === currentMonth && moveDate.getFullYear() === currentYear) {
          const currency = mov.moneda;
          if (currency) {
            monthly[currency] = (monthly[currency] || 0) + safeParseFloat(mov.monto);
          }
        }
      }
    });
    return monthly;
  }, [allExpenses]);

  // Calcular gastos del día actual
  const todayExpensesByCurrency = useMemo(() => {
    const today = getTodayLocalDate();
    const daily = {};

    allExpenses.forEach(mov => {
      if (isToday(mov.fecha)) {
        const currency = mov.moneda;
        if (currency) {
          daily[currency] = (daily[currency] || 0) + safeParseFloat(mov.monto);
        }
      }
    });
    return daily;
  }, [allExpenses]);



  // Filtrar y ordenar gastos por término de búsqueda
  const filteredAndSortedExpenses = useMemo(() => {
    let filtered = allExpenses;

    // Búsqueda por término
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(mov =>
        (mov.detalle && mov.detalle.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (mov.cliente && mov.cliente.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (mov.por && mov.por.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (mov.nombreOtro && mov.nombreOtro.toLowerCase().includes(lowerCaseSearchTerm))
      );
    }

    // Ordenar por fecha (más reciente primero)
    return filtered.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [allExpenses, searchTerm]);

  // Función para renderizar métricas por moneda
  const renderCurrencyMetrics = (title, data, bgColor, textColor, Icon) => (
    <div className={`${bgColor} ${textColor} p-3 sm:p-4 rounded-lg shadow-sm flex items-center justify-between`}>
      <div className="flex-1">
        <div className="text-xs sm:text-sm font-medium mb-2">{title}</div>
        {Object.entries(data).length > 0 ? (
          Object.entries(data).map(([currency, amount]) => (
            <p key={currency} className="text-lg sm:text-xl lg:text-2xl font-bold mb-1">
              {formatAmountWithCurrency(amount, currency)}
            </p>
          ))
        ) : (
          <p className="text-sm sm:text-base text-gray-700">Sin datos</p>
        )}
      </div>
      <Icon size={32} className="sm:w-8 sm:h-8 lg:w-10 lg:h-10 opacity-20 flex-shrink-0" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-6 safe-top safe-bottom pt-24">
      {/* Header */}
      <div className="card mb-4 sm:mb-6">
        <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-100">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-error-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Receipt size={20} className="sm:w-6 sm:h-6 text-error-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                  Gestión de Gastos
                </h1>
                <p className="text-xs sm:text-sm text-gray-700">
                  {filteredAndSortedExpenses.length} de {allExpenses.length} gasto{allExpenses.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <button 
                              onClick={() => onNavigate('nuevoMovimiento', {
                  operacion: 'ADMINISTRATIVAS',
                  subOperacion: 'GASTO'
                })} 
              className="btn-primary flex items-center justify-center gap-2 touch-target w-full sm:w-auto"
            >
              <Receipt size={18} />
              <span>Nuevo Gasto</span>
            </button>
          </div>
        </div>

        {/* Tarjetas de resumen de gastos */}
        <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            {renderCurrencyMetrics(
              'Gasto Total Histórico',
              totalExpensesByCurrency,
              'bg-error-100',
              'text-error-800',
              TrendingDown
            )}
            
            {renderCurrencyMetrics(
              'Gasto del Mes Actual',
              monthlyExpensesByCurrency,
              'bg-warning-100',
              'text-warning-800',
              CalendarDays
            )}

            {renderCurrencyMetrics(
              'Gasto de Hoy',
              todayExpensesByCurrency,
              'bg-warning-100',
              'text-warning-800',
              Receipt
            )}
          </div>
        </div>

        {/* Controles de búsqueda */}
        <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-100">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-800" />
            <input
              type="text"
              placeholder="Buscar gasto por motivo, cliente o autorizado por..."
              className="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-error-500 focus:border-transparent transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Indicador de búsqueda activa */}
          {searchTerm && (
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
              <Search size={14} className="text-gray-800" />
              <span className="text-xs sm:text-sm text-gray-600">Búsqueda activa:</span>
              <span className="px-2 py-1 bg-error-100 text-error-700 rounded-full text-xs">
                "{searchTerm}"
              </span>
              <button
                onClick={() => setSearchTerm('')}
                className="text-xs text-gray-700 hover:text-gray-700 underline ml-2"
              >
                Limpiar
              </button>
            </div>
          )}
        </div>

        {/* Lista de gastos */}
        <div className="p-3 sm:p-4 lg:p-6">
          {filteredAndSortedExpenses.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <Receipt size={40} className="sm:w-12 sm:h-12 mx-auto text-gray-300 mb-3 sm:mb-4" />
              {searchTerm ? (
                <div className="px-4">
                  <p className="text-sm sm:text-base text-gray-700 mb-2">
                    No se encontraron gastos que coincidan con "{searchTerm}"
                  </p>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-error-600 hover:text-error-700 text-sm underline"
                  >
                    Limpiar búsqueda
                  </button>
                </div>
              ) : allExpenses.length === 0 ? (
                <div className="px-4">
                  <p className="text-sm sm:text-base text-gray-700 mb-4">No hay gastos registrados</p>
                  <p className="text-xs sm:text-sm text-gray-800">
                    Los gastos aparecerán aquí cuando se registren operaciones administrativas de tipo "GASTO"
                  </p>
                </div>
              ) : (
                <p className="text-sm sm:text-base text-gray-700">Todos los gastos están ocultos por el filtro actual</p>
              )}
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredAndSortedExpenses.map((movement) => (
                <GastoCard
                  key={movement.id}
                  movement={movement}
                  onEdit={onEditMovement}
                  onDelete={onDeleteMovement}
                  onViewDetail={onViewMovementDetail}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** COMPONENTE TARJETA DE GASTO */
function GastoCard({ movement, onEdit, onDelete, onViewDetail }) {
  const formattedDate = movement.fecha ? 
    new Date(movement.fecha).toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      weekday: 'short'
    }) : 'Sin fecha';

  const amountDisplay = movement.monto ? 
    formatAmountWithCurrency(movement.monto, movement.moneda) : 'Sin monto';

  const handleDelete = () => {
    const confirmacion = window.confirm(
      `¿Estás seguro de eliminar este gasto: "${movement.detalle || 'Gasto sin detalle'}"?`
    );
    if (confirmacion) {
      onDelete(movement.id);
    }
  };

  return (
    <div className="card hover:shadow-medium transition-all duration-200 hover:scale-102 hover:border-error-300">
      <div className="p-3 sm:p-4 space-y-3">
        {/* Header con fecha y monto */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs text-gray-700 mb-1">
              <CalendarDays size={12} className="flex-shrink-0" />
              <span className="truncate">{formattedDate}</span>
              {movement.nombreDia && (
                <span className="hidden sm:inline">• {movement.nombreDia}</span>
              )}
            </div>
            
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base flex items-center gap-2 mb-2">
              <Receipt size={14} className="text-error-500 flex-shrink-0" />
              <span className="truncate">{movement.detalle || 'Gasto sin detalle'}</span>
            </h3>
            
            {/* Información del cliente si existe */}
            {movement.cliente && (
              <div className="flex items-center gap-2 mb-1 text-xs sm:text-sm text-gray-600">
                <User size={12} className="text-gray-800 flex-shrink-0" />
                <span className="truncate">Cliente: {movement.cliente}</span>
              </div>
            )}
            
            {/* Información de autorización */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
              <Shield size={12} className="text-gray-800 flex-shrink-0" />
              <span className="truncate">
                Autorizado por: {movement.por === 'otro' ? movement.nombreOtro : movement.por || 'N/A'}
              </span>
            </div>
          </div>
          
          {/* Monto y estado */}
          <div className="text-left sm:text-right w-full sm:w-auto flex-shrink-0">
            <p className="font-bold text-base sm:text-lg text-error-600 mb-2 truncate">
              {amountDisplay}
            </p>
            
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
              movement.estado === 'realizado' 
                ? 'bg-success-100 text-success-700' 
                : movement.estado === 'pendiente'
                ? 'bg-warning-100 text-warning-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {movement.estado || 'Sin estado'}
            </span>
          </div>
        </div>

        {/* Información de la cuenta */}
        {movement.cuenta && (
          <div className="bg-error-50 rounded-lg p-3">
            <p className="text-xs sm:text-sm text-error-800">
              <span className="font-medium">Cuenta afectada:</span> {movement.cuenta}
            </p>
          </div>
        )}

        {/* Información adicional */}
                  <div className="flex flex-wrap items-center gap-2">
          {movement.moneda && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs">
              {movement.moneda}
            </span>
          )}
          <span className="px-2 py-0.5 bg-error-100 text-error-700 rounded-full text-xs font-medium">
            Gasto Administrativo
          </span>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-1 border-t pt-3">
          <button 
            onClick={() => onViewDetail(movement)} 
            className="p-2 text-gray-800 hover:bg-gray-50 rounded-lg transition-colors touch-target"
            title="Ver detalles completos"
          >
            <Eye size={14} />
          </button>
          <button 
            onClick={() => onEdit(movement)} 
            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors touch-target"
            title="Editar gasto"
          >
            <Edit3 size={14} />
          </button>
          <button 
            onClick={handleDelete} 
            className="p-2 text-error-600 hover:bg-error-50 rounded-lg transition-colors touch-target"
            title="Eliminar gasto"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default GastosApp;
export { GastoCard };