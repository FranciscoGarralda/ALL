import React, { useState, useMemo } from 'react';
import {
  Search,
  Edit3,
  Trash2,
  ArrowLeft,
  List,
  Calendar,
  User,
  DollarSign,
  Filter,
  Eye
} from 'lucide-react';
import { FormSelect, formatAmountWithCurrency, estados } from '../../shared/components/forms';
import { getClientName } from '../../shared/services/formatters';
import { safeParseFloat } from '../../shared/services/safeOperations';

/** COMPONENTE PRINCIPAL DE MOVIMIENTOS */
function MovimientosApp({ movements = [], clients = [], onEditMovement, onDeleteMovement, onNavigate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentView, setCurrentView] = useState('list'); // 'list' | 'detail'
  const [selectedMovement, setSelectedMovement] = useState(null);

  // Opciones para el filtro de tipo de operación
  const operationTypeOptions = useMemo(() => {
    const types = new Set(movements.map(mov => mov.operacion));
    return [
      { value: '', label: 'Todos los tipos' },
      ...Array.from(types).map(type => ({ 
        value: type, 
        label: type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
      }))
    ];
  }, [movements]);

  // Filtrar y ordenar movimientos
  const filteredAndSortedMovements = useMemo(() => {
    let filtered = movements;

    // Búsqueda por término
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(mov =>
        (mov.cliente && mov.cliente.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (mov.detalle && mov.detalle.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (mov.operacion && mov.operacion.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (mov.subOperacion && mov.subOperacion.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (mov.proveedorCC && mov.proveedorCC.toLowerCase().includes(lowerCaseSearchTerm))
      );
    }

    // Filtro por tipo de operación
    if (filterType) {
      filtered = filtered.filter(mov => mov.operacion === filterType);
    }

    // Filtro por estado
    if (filterStatus) {
      filtered = filtered.filter(mov => mov.estado === filterStatus);
    }

    // Ordenar por fecha (más reciente primero)
    return filtered.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [movements, searchTerm, filterType, filterStatus]);

  const handleViewDetail = (movement) => {
    setSelectedMovement(movement);
    setCurrentView('detail');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedMovement(null);
  };

  // Renderizar vista de detalle
  if (currentView === 'detail') {
    return (
      <MovimientoDetail 
        movement={selectedMovement} 
        clients={clients}
        onBack={handleBackToList}
        onEdit={onEditMovement}
        onDelete={onDeleteMovement}
      />
    );
  }

  // Vista principal - Lista de movimientos
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-6 safe-top safe-bottom pt-24">
      {/* Header */}
      <div className="card mb-4 sm:mb-6">
        <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-100">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-success-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <List size={20} className="sm:w-6 sm:h-6 text-success-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                  Gestión de Movimientos
                </h1>
                <p className="text-xs sm:text-sm text-gray-500">
                  {filteredAndSortedMovements.length} de {movements.length} movimiento{movements.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Controles de búsqueda y filtro */}
        <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-100 space-y-3 sm:space-y-4">
          {/* Barra de búsqueda */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por cliente, detalle, operación o proveedor..."
              className="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Filtros */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <FormSelect
              label="Filtrar por Tipo de Operación"
              value={filterType}
              onChange={setFilterType}
              options={operationTypeOptions}
            />
            <FormSelect
              label="Filtrar por Estado"
              value={filterStatus}
              onChange={setFilterStatus}
              options={estados}
            />
          </div>

          {/* Indicadores de filtros activos */}
          {(searchTerm || filterType || filterStatus) && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
              <Filter size={14} className="text-gray-400" />
              <span className="text-xs sm:text-sm text-gray-600">Filtros activos:</span>
              {searchTerm && (
                <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs">
                  Búsqueda: "{searchTerm}"
                </span>
              )}
              {filterType && (
                <span className="px-2 py-1 bg-success-100 text-success-700 rounded-full text-xs">
                  Tipo: {filterType.replace('_', ' ')}
                </span>
              )}
              {filterStatus && (
                <span className="px-2 py-1 bg-warning-100 text-warning-700 rounded-full text-xs">
                  Estado: {filterStatus}
                </span>
              )}
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('');
                  setFilterStatus('');
                }}
                className="text-xs text-gray-500 hover:text-gray-700 underline ml-2"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>

        {/* Lista de movimientos */}
        <div className="p-3 sm:p-4 lg:p-6">
          {filteredAndSortedMovements.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <List size={40} className="sm:w-12 sm:h-12 mx-auto text-gray-300 mb-3 sm:mb-4" />
              {searchTerm || filterType || filterStatus ? (
                <div className="px-4">
                  <p className="text-sm sm:text-base text-gray-500 mb-2">No se encontraron movimientos con los filtros aplicados</p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterType('');
                      setFilterStatus('');
                    }}
                    className="text-primary-600 hover:text-primary-700 text-sm underline"
                  >
                    Limpiar filtros y ver todos
                  </button>
                </div>
              ) : (
                <div className="px-4">
                  <p className="text-sm sm:text-base text-gray-500">No hay movimientos registrados</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {/* Header de columnas - solo visible en desktop */}
              <div className="hidden sm:block bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium text-gray-600">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-12 text-center">Fecha</div>
                  <div className="flex-shrink-0 w-36">Cliente</div>
                  <div className="flex-shrink-0 w-24">Operación</div>
                  <div className="flex-1 min-w-0">Monto</div>
                  <div className="flex-shrink-0 w-20">Estado</div>
                  <div className="flex-shrink-0 w-20 text-center">Acciones</div>
                </div>
              </div>
              
              {/* Lista de movimientos */}
              {filteredAndSortedMovements.map((movement) => (
                <MovimientoCard
                  key={movement.id}
                  movement={movement}
                  clients={clients}
                  onEdit={onEditMovement}
                  onDelete={onDeleteMovement}
                  onViewDetail={handleViewDetail}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** COMPONENTE LÍNEA DE MOVIMIENTO - FORMATO COMPACTO */
function MovimientoCard({ movement, onEdit, onDelete, onViewDetail, clients = [] }) {
  const formattedDate = movement.fecha ? 
    new Date(movement.fecha).toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short'
    }) : 'Sin fecha';

  // Determinar el monto principal a mostrar
  const getDisplayAmount = () => {
    if (movement.comision && safeParseFloat(movement.comision) > 0) {
      return {
        amount: movement.comision,
        currency: movement.monedaComision || movement.moneda
      };
    }
    if (movement.total && safeParseFloat(movement.total) > 0) {
      return {
        amount: movement.total,
        currency: movement.monedaTC || movement.moneda
      };
    }
    if (movement.monto) {
      return {
        amount: movement.monto,
        currency: movement.moneda
      };
    }
    return null;
  };

  const displayAmount = getDisplayAmount();

  const handleDelete = () => {
    const confirmacion = window.confirm(
      `¿Estás seguro de eliminar este movimiento de ${getClientName(movement.cliente, clients)}?`
    );
    if (confirmacion) {
      onDelete(movement.id);
    }
  };

  return (
    <div className="bg-white border border-gray-200 hover:border-primary-300 hover:shadow-sm transition-all duration-150 rounded-lg overflow-hidden">
      <div className="px-3 py-2 flex items-center gap-3 min-w-0">
        {/* Fecha */}
        <div className="flex-shrink-0 w-12 text-center">
          <div className="text-xs text-gray-500 font-medium">{formattedDate}</div>
        </div>

        {/* Cliente */}
        <div className="flex-shrink-0 w-32 sm:w-36">
          <div className="text-sm font-medium text-gray-900 truncate">
            {getClientName(movement.cliente, clients)}
          </div>
        </div>

        {/* Operación */}
        <div className="flex-shrink-0 w-20 sm:w-24">
          <span className="px-1.5 py-0.5 bg-primary-100 text-primary-700 rounded text-xs font-medium truncate block">
            {movement.subOperacion || movement.operacion?.replace('_', ' ') || 'N/A'}
          </span>
        </div>

        {/* Monto */}
        <div className="flex-1 min-w-0">
          {displayAmount && (
            <div className="text-sm font-semibold text-primary-600 truncate">
              {formatAmountWithCurrency(displayAmount.amount, displayAmount.currency)}
            </div>
          )}
        </div>

        {/* Estado */}
        <div className="flex-shrink-0 w-20">
          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
            movement.estado === 'realizado' 
              ? 'bg-success-100 text-success-700' 
              : movement.estado === 'pendiente'
              ? 'bg-warning-100 text-warning-700'
              : 'bg-gray-100 text-gray-700'
          }`}>
            {movement.estado === 'realizado' ? 'OK' : movement.estado === 'pendiente' ? 'PEND' : 'N/A'}
          </span>
        </div>

        {/* Acciones */}
        <div className="flex-shrink-0 w-20 flex gap-1 justify-center">
          <button 
            onClick={() => onViewDetail(movement)} 
            className="p-1 text-primary-600 hover:bg-primary-50 rounded transition-colors"
            title="Ver detalles"
          >
            <Eye size={14} />
          </button>
          <button 
            onClick={() => onEdit(movement)} 
            className="p-1 text-gray-600 hover:bg-gray-50 rounded transition-colors"
            title="Editar"
          >
            <Edit3 size={14} />
          </button>
          <button 
            onClick={handleDelete} 
            className="p-1 text-error-600 hover:bg-error-50 rounded transition-colors"
            title="Eliminar"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

/** COMPONENTE DETALLE DE MOVIMIENTO */
function MovimientoDetail({ movement, onBack, onEdit, onDelete, clients = [] }) {
  if (!movement) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 p-4 safe-top safe-bottom">
        <div className="text-center max-w-md mx-auto">
          <List size={40} className="sm:w-12 sm:h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-lg sm:text-xl font-semibold mb-2">Movimiento no encontrado</p>
          <p className="text-sm sm:text-base mb-4 text-gray-500">El movimiento que buscas no existe o ha sido eliminado.</p>
          <button 
            onClick={onBack} 
            className="btn-secondary touch-target"
          >
            Volver a movimientos
          </button>
        </div>
      </div>
    );
  }

  const formatField = (label, value, currency = null) => (
    <div className="flex flex-col sm:flex-row sm:justify-between py-2 sm:py-3 border-b border-gray-100 last:border-b-0">
      <span className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-0">{label}:</span>
      <span className="text-xs sm:text-sm text-gray-900 font-mono break-words">
        {currency ? formatAmountWithCurrency(value, currency) : (value || 'N/A')}
      </span>
    </div>
  );

  const formatDateField = (label, dateValue) => {
    if (!dateValue) return formatField(label, 'N/A');
    
    try {
      const date = new Date(dateValue);
      const formattedDate = date.toLocaleDateString('es-ES', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      return formatField(label, formattedDate);
    } catch {
      return formatField(label, dateValue);
    }
  };

  const handleDelete = () => {
    const confirmacion = window.confirm(
      `¿Estás seguro de eliminar este movimiento de ${getClientName(movement.cliente, clients)}?`
    );
    if (confirmacion) {
      onDelete(movement.id);
      onBack();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-6 safe-top safe-bottom pt-24">
      <div className="max-w-4xl mx-auto">
        <div className="card">
          {/* Header */}
          <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-3 sm:mb-0">
              <button 
                onClick={onBack} 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-target flex-shrink-0"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                  Detalle del Movimiento
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 truncate">
                  {movement.operacion?.replace('_', ' ')} - {movement.subOperacion || 'N/A'}
                </p>
              </div>
              {/* Indicador de estado */}
              <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex-shrink-0 ${
                movement.estado === 'realizado' 
                  ? 'bg-success-100 text-success-700' 
                  : movement.estado === 'pendiente'
                  ? 'bg-warning-100 text-warning-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {movement.estado || 'Sin estado'}
              </span>
            </div>

            {/* Botones de acción en header */}
            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <button 
                onClick={() => onEdit(movement)} 
                className="btn-secondary flex items-center gap-2 touch-target"
              >
                <Edit3 size={14} />
                <span className="hidden sm:inline">Editar</span>
              </button>
              <button 
                onClick={handleDelete} 
                className="btn-error flex items-center gap-2 touch-target"
              >
                <Trash2 size={14} />
                <span className="hidden sm:inline">Eliminar</span>
              </button>
            </div>
          </div>

          {/* Contenido del detalle */}
          <div className="p-3 sm:p-4 lg:p-6 space-y-6 sm:space-y-8">
            {/* Información General */}
            <div>
              <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <User size={16} className="sm:w-5 sm:h-5 text-primary-600 flex-shrink-0" />
                Información General
              </h3>
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-1">
                {formatDateField('Fecha', movement.fecha)}
                {formatField('Cliente', getClientName(movement.cliente, clients))}
                {formatField('Operación', movement.operacion?.replace('_', ' '))}
                {formatField('Sub-Operación', movement.subOperacion)}
                {formatField('Detalle', movement.detalle)}
                {movement.proveedorCC && formatField('Proveedor CC', movement.proveedorCC)}
              </div>
            </div>

            {/* Valores Monetarios */}
            <div>
              <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <DollarSign size={16} className="sm:w-5 sm:h-5 text-success-600 flex-shrink-0" />
                Valores Monetarios
              </h3>
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-1">
                {movement.monto && formatField('Monto', movement.monto, movement.moneda)}
                {movement.tc && formatField('Tipo de Cambio (TC)', movement.tc)}
                {movement.monedaTC && formatField('Moneda TC', movement.monedaTC)}
                {movement.monedaTCCmpra && formatField('Moneda TC Compra', movement.monedaTCCmpra)}
                {movement.monedaVenta && formatField('Moneda Venta', movement.monedaVenta)}
                {movement.monedaTCVenta && formatField('Moneda TC Venta', movement.monedaTCVenta)}
                {movement.tcVenta && formatField('TC Venta', movement.tcVenta)}
                {movement.total && formatField('Total', movement.total, movement.monedaTC || movement.moneda)}
                {movement.totalCompra && formatField('Total Compra', movement.totalCompra, movement.monedaTCCmpra || movement.moneda)}
                {movement.totalVenta && formatField('Total Venta', movement.totalVenta, movement.monedaTCVenta || movement.monedaVenta)}
                {movement.montoVenta && formatField('Monto Venta', movement.montoVenta, movement.monedaVenta)}
                {movement.comision && formatField('Comisión', movement.comision, movement.monedaComision || movement.moneda)}
              </div>
            </div>

            {/* Pago Mixto */}
            {movement.walletTC === 'pago_mixto' && movement.mixedPayments && movement.mixedPayments.length > 0 && (
              <div>
                <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-3 sm:mb-4">Detalle de Pago Mixto</h3>
                <div className="bg-primary-50 rounded-lg p-3 sm:p-4">
                  <div className="space-y-2 mb-4">
                    {movement.mixedPayments.map((pago, index) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 px-3 bg-white rounded border gap-1 sm:gap-0">
                        <span className="text-xs sm:text-sm font-medium text-gray-700">
                          Cuenta {index + 1}: {pago.cuenta || 'N/A'}
                        </span>
                        <span className="text-xs sm:text-sm font-mono text-gray-900">
                          {formatAmountWithCurrency(pago.monto, movement.monedaTC || 'PESO')}
                        </span>
                      </div>
                    ))}
                  </div>
                  {movement.expectedTotalForMixedPayments && (
                    <div className="border-t pt-3">
                      {formatField(
                        'Valor de la Operación', 
                        movement.expectedTotalForMixedPayments, 
                        movement.monedaTC || 'PESO'
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Cuentas y Estados */}
            <div>
              <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-3 sm:mb-4">Cuentas y Estados</h3>
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-1">
                {movement.cuenta && formatField('Cuenta Principal', movement.cuenta)}
                {movement.cuentaSalida && formatField('Cuenta de Salida', movement.cuentaSalida)}
                {movement.cuentaIngreso && formatField('Cuenta de Ingreso', movement.cuentaIngreso)}
                {movement.cuentaComision && formatField('Cuenta Comisión', movement.cuentaComision)}
                {formatField('Estado', movement.estado)}
                {formatField('Autorizado/Ejecutado por', movement.por)}
                {movement.nombreOtro && formatField('Nombre (Otro)', movement.nombreOtro)}
              </div>
            </div>

            {/* Información Específica de Prestamistas */}
            {(movement.interes || movement.lapso || movement.fechaLimite) && (
              <div>
                <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-3 sm:mb-4">Información de Préstamo</h3>
                <div className="bg-warning-50 rounded-lg p-3 sm:p-4 space-y-1">
                  {movement.interes && formatField('Interés Anual (%)', movement.interes)}
                  {movement.lapso && formatField('Lapso (días)', movement.lapso)}
                  {movement.fechaLimite && formatDateField('Fecha Límite', movement.fechaLimite)}
                </div>
              </div>
            )}

            {/* Información de Socios */}
            {movement.socioSeleccionado && (
              <div>
                <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-3 sm:mb-4">Información de Socios</h3>
                <div className="bg-warning-50 rounded-lg p-3 sm:p-4 space-y-1">
                  {formatField('Socio Seleccionado', movement.socioSeleccionado)}
                </div>
              </div>
            )}

            {/* Metadatos */}
            <div className="border-t pt-24 sm:pt-6">
              <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-3 sm:mb-4">Información del Sistema</h3>
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-1 text-xs">
                {formatField('ID del Movimiento', movement.id)}
                {formatField(
                  'Fecha de Creación', 
                  movement.createdAt ? new Date(movement.createdAt).toLocaleString('es-ES') : 'N/A'
                )}
                {formatField(
                  'Última Modificación', 
                  movement.updatedAt ? new Date(movement.updatedAt).toLocaleString('es-ES') : 'N/A'
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovimientosApp;
export { MovimientoCard, MovimientoDetail };