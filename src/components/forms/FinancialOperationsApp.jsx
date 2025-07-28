import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DollarSign, XCircle, PlusCircle } from 'lucide-react';
import { 
  safeParseFloat, 
  safeArrayFind, 
  validateDate, 
  safeCalculation,
  safeArray 
} from '../../utils/safeOperations';
import {
  FormInput,
  FormSelect,
  FormFieldGroup,
  MixedPaymentGroup,
  ClientAutocomplete,
  formatAmountWithCurrency,
  monedas,
  cuentas,
  socios,
  estados,
  operaciones,
  proveedoresCC
} from '../base';
import { specificFieldsConfig } from '../../config/fieldConfigs';
import { useMixedPayments } from '../../hooks/useMixedPayments';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';

/**
 * Dynamic Form Field Groups Component
 */
function DynamicFormFieldGroups({ groups, onKeyDown }) {
  return (
    <div className="space-y-4">
      {groups.map((group, groupIndex) => (
        <FormFieldGroup key={groupIndex} fields={group} onKeyDown={onKeyDown} />
      ))}
    </div>
  );
}

const FinancialOperationsApp = ({ onSaveMovement, initialMovementData, onCancelEdit, clients, onSaveClient }) => {
  const [formData, setFormData] = useState({
    cliente: '',
    fecha: new Date().toISOString().split('T')[0], // Fecha actual por defecto
    nombreDia: new Date().toLocaleDateString('es-ES', { weekday: 'long' }), // Día actual
    detalle: '',
    operacion: '', // Sin predeterminado
    subOperacion: '', // Sin auto-selección
    proveedorCC: '',
    monto: '',
    moneda: '',
    cuenta: '',
    total: '',
    estado: '',
    por: '',
    nombreOtro: '',
    tc: '',
    monedaTC: '',
    monedaTCCmpra: '',
    monedaTCVenta: '',
    monedaVenta: '',
    tcVenta: '',
    comision: '',
    monedaComision: '',
    cuentaComision: '',
    interes: '',
    lapso: '',
    fechaLimite: '',
    socioSeleccionado: '',
    totalCompra: '',
    totalVenta: '',
    montoVenta: '',
    cuentaSalida: '',
    cuentaIngreso: '',
    // Mixed payment system - controlled by walletTC === 'pago_mixto'
    mixedPayments: [],
    expectedTotalForMixedPayments: '',
    ...initialMovementData
  });

  // Filter clients for prestamistas
  const prestamistaClientsOptions = useMemo(() => {
    const filtered = clients?.filter(c => c.tipoCliente === 'prestamistas') || [];
    return filtered.map(c => ({ value: c.nombre, label: `${c.nombre} ${c.apellido}` }));
  }, [clients]);

  // Custom hooks for clean separation of concerns
  const {
    isMixedPaymentActive,
    handleMixedPaymentChange,
    addMixedPayment,
    removeMixedPayment,
    validateMixedPayments
  } = useMixedPayments(formData, setFormData);

  const {
    fieldRefs,
    registerField,
    focusField,
    openField,
    handleKeyboardNavigation,
    handleModalNavigation
  } = useKeyboardNavigation();


  useEffect(() => {
    if (initialMovementData) {
      setFormData(initialMovementData);
    }
    // No llamar clearForm() automáticamente
  }, [initialMovementData]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const newState = { ...prev, [field]: value };

      // Calcular día de la semana para fechas - VERSIÓN SEGURA
      if (field === 'fecha') {
        const validDate = validateDate(value);
        if (validDate) {
          try {
            newState.nombreDia = validDate.toLocaleDateString('es-ES', { weekday: 'long' });
          } catch (error) {
            newState.nombreDia = '';
          }
        } else {
          newState.nombreDia = '';
        }
      }



      // Limpiar sub-operación cuando cambia la operación principal
      if (field === 'operacion' && value !== prev.operacion) {
        newState.subOperacion = '';
      }

      // Reset moneda if proveedorCC changes - VERSIÓN SEGURA
      if (field === 'proveedorCC' && newState.operacion === 'CUENTAS_CORRIENTES') {
        const selectedProveedor = safeArrayFind(
          safeArray(proveedoresCC), 
          p => p && p.value === value
        );
        if (selectedProveedor && 
            safeArray(selectedProveedor.allowedCurrencies).length > 0 && 
            !selectedProveedor.allowedCurrencies.includes(newState.moneda)) {
          newState.moneda = '';
        }
      }

      // Lógica de pago mixto - VERSIÓN SEGURA
      if (field === 'walletTC' && value === 'pago_mixto') {
        const expectedTotal = safeCalculation.multiply(prev.monto || 0, prev.tc || 1);
        newState.expectedTotalForMixedPayments = expectedTotal.toFixed(2);
          
          // Determinar si estamos en modo wallet
          let configKey = prev.subOperacion;
          if (['INGRESO', 'EGRESO'].includes(prev.subOperacion) && prev.operacion === 'CUENTAS_CORRIENTES') {
            configKey = 'CUENTAS_CORRIENTES_INGRESO_EGRESO';
          } else if (['INGRESO', 'SALIDA', 'PRESTAMO', 'DEVOLUCION'].includes(prev.subOperacion) && prev.operacion === 'SOCIOS') {
            configKey = 'SOCIOS_SHARED';
          } else if (prev.subOperacion === 'PRESTAMO' && prev.operacion === 'PRESTAMISTAS') {
            configKey = 'PRESTAMISTAS_PRESTAMO';
          } else if (prev.subOperacion === 'RETIRO' && prev.operacion === 'PRESTAMISTAS') {
            configKey = 'PRESTAMISTAS_RETIRO';
          } else if (prev.subOperacion === 'TRANSFERENCIA' && prev.operacion === 'INTERNAS') {
            configKey = 'TRANSFERENCIA';
          }
          
          const isWalletMode = specificFieldsConfig[configKey]?.pagoMixtoWalletMode;
          
          // Crear pagos iniciales con nueva estructura (socio + tipo)
          newState.mixedPayments = [
            { id: 1, socio: '', tipo: '', monto: expectedTotal.toFixed(2) },
            { id: 2, socio: '', tipo: '', monto: '' }
                    ];
          newState.total = expectedTotal.toFixed(2);
        }
      
      // Limpiar pagos mixtos cuando se cambie de "pago_mixto" a otra opción - VERSIÓN SEGURA
      if (field === 'walletTC' && prev.walletTC === 'pago_mixto' && value !== 'pago_mixto') {
        if (['COMPRA', 'VENTA'].includes(newState.subOperacion)) {
          const currentMonto = safeParseFloat(newState.monto);
          const currentTc = safeParseFloat(newState.tc);
          if (currentMonto > 0 && currentTc > 0) {
            newState.total = safeCalculation.multiply(currentMonto, currentTc).toFixed(2);
          } else {
            newState.total = '';
          }
        }
        newState.mixedPayments = [{ id: 1, cuenta: '', monto: '' }];
        newState.expectedTotalForMixedPayments = '';
      }

      // Cálculo automático de totales para COMPRA/VENTA - VERSIÓN SEGURA
      if (['monto', 'total', 'tc'].includes(field) && ['COMPRA', 'VENTA'].includes(newState.subOperacion)) {
        const currentMonto = safeParseFloat(newState.monto);
        const currentTotal = safeParseFloat(newState.total);
        const currentTc = safeParseFloat(newState.tc);

        if (newState.walletTC !== 'pago_mixto') {
          if (field === 'monto' && currentMonto > 0 && currentTc > 0) {
            newState.total = safeCalculation.multiply(currentMonto, currentTc).toFixed(2);
          } else if (field === 'total' && currentTotal > 0 && currentTc > 0) {
            newState.monto = safeCalculation.divide(currentTotal, currentTc).toFixed(2);
          } else if (field === 'tc' && currentMonto > 0 && currentTc > 0) {
            newState.total = safeCalculation.multiply(currentMonto, currentTc).toFixed(2);
          } else if (field === 'tc' && currentTotal > 0 && currentTc > 0) {
            newState.monto = safeCalculation.divide(currentTotal, currentTc).toFixed(2);
          }
        } else {
          const newExpectedTotal = safeCalculation.multiply(currentMonto, currentTc || 1);
          newState.expectedTotalForMixedPayments = newExpectedTotal.toFixed(2);

          // Verificar que mixedPayments existe y es array
          const mixedPayments = safeArray(newState.mixedPayments);
          if (mixedPayments.length > 0) {
            const sumOfOtherPaymentsExcludingFirst = mixedPayments.slice(1).reduce((sum, p) => {
              return sum + safeParseFloat(p?.monto, 0);
            }, 0);
            
            mixedPayments[0].monto = (newExpectedTotal - sumOfOtherPaymentsExcludingFirst).toFixed(2);
            
            newState.total = mixedPayments.reduce((sum, payment) => {
              return sum + safeParseFloat(payment?.monto, 0);
            }, 0).toFixed(2);
          }
        }
      }

      // Cálculo automático para ARBITRAJE - VERSIÓN SEGURA
      if (['monto', 'moneda', 'monedaTCCompra', 'tc', 'montoVenta', 'tcVenta'].includes(field) && newState.subOperacion === 'ARBITRAJE') {
        // Auto-completar monto y moneda de venta cuando cambia compra
        if (field === 'monto') {
          newState.montoVenta = newState.monto;
        }
        if (field === 'moneda') {
          newState.monedaVenta = newState.moneda;
        }
        if (field === 'monedaTCCompra') {
          newState.monedaTCVenta = newState.monedaTCCompra;
        }

        const monto = safeParseFloat(newState.monto);
        const tc = safeParseFloat(newState.tc);
        const montoVenta = safeParseFloat(newState.montoVenta);
        const tcVenta = safeParseFloat(newState.tcVenta);

        newState.totalCompra = safeCalculation.multiply(monto, tc).toFixed(2);
        newState.totalVenta = safeCalculation.multiply(montoVenta, tcVenta).toFixed(2);
        
        const totalCompraNum = safeParseFloat(newState.totalCompra);
        const totalVentaNum = safeParseFloat(newState.totalVenta);
        newState.comision = (totalVentaNum - totalCompraNum).toFixed(2);
      }

      // Auto-completado para CUENTAS CORRIENTES
      if (newState.operacion === 'CUENTAS_CORRIENTES' && ['INGRESO', 'EGRESO'].includes(newState.subOperacion)) {
        // Auto-completar moneda de comisión cuando cambia la moneda principal
        if (field === 'moneda') {
          newState.monedaComision = newState.moneda;
        }
        
        // Auto-completar cuenta de comisión cuando cambia la cuenta principal
        if (field === 'cuenta') {
          newState.cuentaComision = newState.cuenta;
        }

        // Calcular monto de comisión cuando cambia el monto o el porcentaje
        if (['monto', 'comisionPorcentaje'].includes(field)) {
          const monto = safeParseFloat(newState.monto);
          const porcentaje = safeParseFloat(newState.comisionPorcentaje);
          
          if (monto > 0 && porcentaje > 0) {
            newState.montoComision = safeCalculation.multiply(monto, safeCalculation.divide(porcentaje, 100)).toFixed(2);
          } else {
            newState.montoComision = '';
          }

          // Calcular monto real (monto - comisión)
          const montoComision = safeParseFloat(newState.montoComision);
          if (monto > 0) {
            if (newState.subOperacion === 'INGRESO') {
              // Para ingreso: monto real = monto - comisión (lo que realmente ingresa)
              newState.montoReal = safeCalculation.subtract(monto, montoComision).toFixed(2);
            } else if (newState.subOperacion === 'EGRESO') {
              // Para egreso: monto real = monto - comisión (lo que realmente sale)
              newState.montoReal = safeCalculation.subtract(monto, montoComision).toFixed(2);
            } else {
              newState.montoReal = safeCalculation.subtract(monto, montoComision).toFixed(2);
            }
          } else {
            newState.montoReal = '';
          }
        }
      }

      return newState;
    });
  };

  // Mixed payment functions moved to useMixedPayments hook

  // addMixedPayment and removeMixedPayment functions moved to useMixedPayments hook

  const clearForm = () => {
    setFormData({
      cliente: '',
      fecha: new Date().toISOString().split('T')[0], // Fecha actual por defecto
      nombreDia: new Date().toLocaleDateString('es-ES', { weekday: 'long' }), // Día actual
      detalle: '',
      operacion: '', // Sin predeterminado
      subOperacion: '', // Sin auto-selección
      proveedorCC: '',
      monto: '',
      moneda: '',
      cuenta: '',
      total: '',
      estado: '',
      por: '',
      nombreOtro: '',
      tc: '',
      monedaTC: '',
      monedaTCCmpra: '',
      monedaTCVenta: '',
      monedaVenta: '',
      tcVenta: '',
      comision: '',
      comisionPorcentaje: '',
      montoComision: '',
      montoReal: '',
      monedaComision: '',
      cuentaComision: '',
      interes: '',
      lapso: '',
      fechaLimite: '',
      socioSeleccionado: '',
      totalCompra: '',
      totalVenta: '',
      montoVenta: '',
      cuentaSalida: '',
      cuentaIngreso: '',

      mixedPayments: [],
      expectedTotalForMixedPayments: '',
    });
  };

  const handleGuardar = () => {
    
    // Validate mixed payments using hook
    const validation = validateMixedPayments();
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }
    
    onSaveMovement(formData);
    
    // Show success message
    alert('Movimiento guardado exitosamente');
    
    // Clear form and stay on current page
    clearForm();
    
    // Only navigate away if we were editing (not creating new)
    if (initialMovementData && onCancelEdit) {
      onCancelEdit();
    }
  };

  const renderEstadoYPor = () => (
    <div className="grid grid-cols-2 gap-2 mt-2">
      <FormSelect
        ref={(el) => registerField('estado', el)}
        label="Estado de retiro"
        name="estado"
        value={formData.estado}
        onChange={(val) => handleInputChange('estado', val)}
                        onKeyDown={(e) => handleKeyboardNavigation('estado', e, formData, specificFieldsConfig)}
        options={estados}
      />
      <FormSelect
        ref={(el) => registerField('por', el)}
        label="Por"
        name="por"
        value={formData.por}
        onChange={(val) => handleInputChange('por', val)}
                        onKeyDown={(e) => handleKeyboardNavigation('por', e, formData, specificFieldsConfig)}
        options={socios}
      />
    </div>
  );

  const renderCamposEspecificos = useMemo(() => {
    let configKey = formData.subOperacion;

    if (['INGRESO', 'EGRESO'].includes(formData.subOperacion) && formData.operacion === 'CUENTAS_CORRIENTES') {
      configKey = 'CUENTAS_CORRIENTES_INGRESO_EGRESO';
    } else if (['INGRESO', 'SALIDA', 'PRESTAMO', 'DEVOLUCION'].includes(formData.subOperacion) && formData.operacion === 'SOCIOS') {
      configKey = 'SOCIOS_SHARED';
    } else if (formData.subOperacion === 'PRESTAMO' && formData.operacion === 'PRESTAMISTAS') {
      configKey = 'PRESTAMISTAS_PRESTAMO';
    } else if (formData.subOperacion === 'RETIRO' && formData.operacion === 'PRESTAMISTAS') {
      configKey = 'PRESTAMISTAS_RETIRO';
    } else if (formData.subOperacion === 'TRANSFERENCIA' && formData.operacion === 'INTERNAS') {
      configKey = 'TRANSFERENCIA';
    }

    const config = specificFieldsConfig[configKey];

    if (!config) {
      return null;
    }

    const prepareFields = (fieldsArray) => fieldsArray.map(field => ({
      ...field,
      value: formData[field.name],
      onChange: (val) => handleInputChange(field.name, val),
      ref: (el) => registerField(field.name, el),
      options: field.name === 'cliente' && (configKey === 'PRESTAMISTAS_PRESTAMO' || configKey === 'PRESTAMISTAS_RETIRO')
                 ? prestamistaClientsOptions
                 : field.options,
                  readOnly: field.name === 'total' && formData.walletTC === 'pago_mixto'
    }));

    const fieldGroups = typeof config.groups === 'function'
      ? config.groups(formData).map(group => prepareFields(group))
      : config.groups.map(group => prepareFields(group));

    const conditionalFields = typeof config.conditionalFields === 'function'
      ? prepareFields(config.conditionalFields(formData))
      : [];

    const showPagoMixtoOption = config.includesPagoMixto && formData.walletTC === 'pago_mixto';

    return (
      <>
                  <DynamicFormFieldGroups groups={fieldGroups} onKeyDown={(field, event) => handleKeyboardNavigation(field, event, formData, specificFieldsConfig)} />
        {conditionalFields.length > 0 && (
          <FormFieldGroup fields={conditionalFields} onKeyDown={(field, event) => handleKeyboardNavigation(field, event, formData, specificFieldsConfig)} />
        )}

        {showPagoMixtoOption && (
          <MixedPaymentGroup
            payments={formData.mixedPayments}
            onPaymentChange={handleMixedPaymentChange}
            onAddPayment={addMixedPayment}
            onRemovePayment={removeMixedPayment}
            totalExpected={formData.expectedTotalForMixedPayments || 0}
            currency={formData.monedaTC || 'PESO'}
            onKeyDown={(field, event) => handleKeyboardNavigation(field, event, formData, specificFieldsConfig)}
            registerField={registerField}
          />
        )}

        {config.includesEstadoYPor && renderEstadoYPor()}
      </>
    );
  }, [formData, handleInputChange, renderEstadoYPor, prestamistaClientsOptions, handleMixedPaymentChange, addMixedPayment, removeMixedPayment]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 lg:p-8 lg:pt-8 pt-20">
      <div className="max-w-xl mx-auto bg-white shadow-medium rounded-xl p-4 sm:p-6 space-y-4">
        {/* Header de la aplicación */}
        <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
          <div className="bg-primary-500 p-2 rounded-lg">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Operaciones Financieras</h1>
            <p className="text-sm text-gray-600">Gestión de movimientos</p>
          </div>
        </div>

        <div className="form-section">
          {/* Campo Cliente - Universal con autocompletado */}
          {formData.operacion !== 'PRESTAMISTAS' && (
            <ClientAutocomplete
              ref={(el) => registerField('cliente', el)}
              label="CLIENTE"
              name="cliente"
              value={formData.cliente}
              onChange={(val) => handleInputChange('cliente', val)}
              onKeyDown={(e) => handleKeyboardNavigation('cliente', e, formData, specificFieldsConfig)}
              onRegisterCreateButton={(el) => registerField('crearCliente', el)}
              clients={clients || []}
              required={true}
              placeholder="Buscar o seleccionar cliente"
              onClientCreated={(newClient) => {
                // Guardar el cliente en la base de datos
                if (onSaveClient) {
                  onSaveClient(newClient);
                  // Auto-seleccionar el cliente recién creado
                  handleInputChange('cliente', newClient.id || newClient.nombre);
                }
              }}
            />
          )}

          {/* Campo Fecha */}
          <FormInput
            ref={(el) => registerField('fecha', el)}
            label="FECHA"
            name="fecha"
            type="date"
            value={formData.fecha}
            onChange={(val) => handleInputChange('fecha', val)}
                          onKeyDown={(e) => handleKeyboardNavigation('fecha', e, formData, specificFieldsConfig)}
            showDayName={true}
            dayName={formData.nombreDia}
            required
          />

          {/* Campo Detalle */}
          <FormInput
            ref={(el) => registerField('detalle', el)}
            label="DETALLE"
            name="detalle"
            value={formData.detalle}
            onChange={(val) => handleInputChange('detalle', val)}
                          onKeyDown={(e) => handleKeyboardNavigation('detalle', e, formData, specificFieldsConfig)}
            placeholder="Descripción de la operación"
          />

          {/* Selector de Operación principal */}
          <FormSelect
            ref={(el) => registerField('operacion', el)}
            label="OPERACIÓN"
            name="operacion"
            value={formData.operacion}
            onChange={(val) => handleInputChange('operacion', val)}
                          onKeyDown={(e) => handleKeyboardNavigation('operacion', e, formData, specificFieldsConfig)}
                          options={[
                ...Object.entries(operaciones).map(([key, op]) => ({
                value: key,
                label: `${op.icon} ${key.replace('_', ' ')}`,
              })),
            ]}
            placeholder="Seleccionar operación"
            required
          />

          {/* Selector de Detalle de Operación */}
          {formData.operacion &&
            operaciones[formData.operacion]?.subMenu?.length > 0 && (
              <FormSelect
                ref={(el) => registerField('subOperacion', el)}
                label="DETALLE OPERACIÓN"
                name="subOperacion"
                value={formData.subOperacion}
                onChange={(val) => handleInputChange('subOperacion', val)}
                onKeyDown={(e) => handleKeyboardNavigation('subOperacion', e, formData, specificFieldsConfig)}
                                  options={[
                    ...operaciones[formData.operacion].subMenu.map((sub) => ({
                    value: sub,
                    label: sub,
                  })),
                ]}
                placeholder="Seleccionar opción"
                required
              />
            )}

          {/* Campos específicos dinámicos */}
          {renderCamposEspecificos}

          {/* Campo para "Otro" si se selecciona en "Por" */}
          {formData.por === 'otro' && (
            <FormInput
              ref={(el) => registerField('nombreOtro', el)}
              label="NOMBRE"
              name="nombreOtro"
              value={formData.nombreOtro}
              onChange={(val) => handleInputChange('nombreOtro', val)}
                              onKeyDown={(e) => handleKeyboardNavigation('nombreOtro', e, formData, specificFieldsConfig)}
              placeholder="Ingrese el nombre"
              required
            />
          )}
        </div>

        {/* Resumen para operaciones COMPRA/VENTA */}
        {(['COMPRA', 'VENTA'].includes(formData.subOperacion) && formData.total) && (
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mt-4">
            <h3 className="text-sm font-semibold text-primary-900 mb-2">Resumen de la Operación</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-primary-700">Monto:</span>
                <div className="font-medium text-primary-900">
                  {formatAmountWithCurrency(formData.monto, formData.moneda)}
                </div>
              </div>
              <div>
                <span className="text-primary-700">Tipo de Cambio:</span>
                <div className="font-medium text-primary-900">
                  {formatAmountWithCurrency(formData.tc, formData.monedaTC)}
                </div>
              </div>
              <div className="col-span-2 border-t border-primary-200 pt-2 mt-2">
                <span className="text-primary-700">Total Final:</span>
                <div className="text-lg font-bold text-primary-900">
                  {formatAmountWithCurrency(formData.total, formData.monedaTC)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row justify-between pt-4 border-t border-gray-200 gap-3">
          <button
            ref={(el) => registerField('guardar', el)}
            onClick={handleGuardar}
            onKeyDown={(e) => handleKeyboardNavigation('guardar', e, formData, specificFieldsConfig)}
            className="btn-primary flex-1 sm:flex-none touch-target"
            disabled={!formData.operacion || !formData.subOperacion}
          >
            {initialMovementData ? 'Actualizar' : 'Guardar'}
          </button>
          <button
            ref={(el) => registerField('limpiar', el)}
            onClick={clearForm}
            onKeyDown={(e) => handleKeyboardNavigation('limpiar', e, formData, specificFieldsConfig)}
            className="btn-secondary flex-1 sm:flex-none touch-target"
          >
            Limpiar Formulario
          </button>
          {onCancelEdit && (
            <button
              ref={(el) => registerField('cancelar', el)}
              onClick={onCancelEdit}
              onKeyDown={(e) => handleKeyboardNavigation('cancelar', e, formData, specificFieldsConfig)}
              className="btn-secondary flex-1 sm:flex-none touch-target"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialOperationsApp;