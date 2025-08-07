import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DollarSign } from 'lucide-react';
import { 
  safeParseFloat, 
  safeArrayFind, 
  validateDate, 
  safeCalculation,
  safeArray 
} from '../../shared/services/safeOperations';
import { stockService } from '../../shared/services/stockService';
import { getTodayLocalDate, getDayName } from '../../shared/utils/dateUtils';
import {
  FormInput,
  FormSelect,
  FormFieldGroup,
  MixedPaymentGroup,
  ClientAutocomplete,
  formatAmountWithCurrency,
  SubOperationButtons,
  ButtonSelectGroup
} from '../../shared/components/forms';
import {
  monedas,
  cuentas,
  socios,
  estados,
  operaciones,
  proveedoresCC,
  specificFieldsConfig
} from '../../shared/constants';
import { useMixedPayments, useFormKeyboardNavigation } from '../../shared/hooks';


/**
 * Dynamic Form Field Groups Component
 */
function DynamicFormFieldGroups({ groups, formData, onFieldChange }) {
  return (
    <div className="space-y-6">
      {groups.map((group, groupIndex) => (
        <FormFieldGroup 
          key={groupIndex} 
          fields={group} 
          formData={formData}
          onFieldChange={onFieldChange}
        />
      ))}
    </div>
  );
}

const FinancialOperationsApp = ({ onSaveMovement, initialMovementData, onCancelEdit, clients, onSaveClient }) => {
  const [formData, setFormData] = useState({
    cliente: '',
    fecha: getTodayLocalDate(), // Fecha actual por defecto
    nombreDia: getDayName(getTodayLocalDate()), // Día actual
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
    tipoComision: 'percentage', // 'percentage' o 'fixed'
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

  // AGREGAR navegación por teclado (sin afectar funcionalidad existente)
  const {
    createElementRef
  } = useFormKeyboardNavigation('financial-operations-form', {
    autoFocus: true
  });




  useEffect(() => {
    if (initialMovementData) {
      setFormData(initialMovementData);
    }
    // No llamar clearForm() automáticamente
  }, [initialMovementData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newState = { ...prev };
      
      // Para campos numéricos, convertir coma a punto
      if (typeof value === 'string' && ['monto', 'comisionPorcentaje', 'comision', 'tc', 'tcVenta', 'montoVenta', 'total'].includes(field)) {
        value = value.replace(',', '.');
      }
      
      newState[field] = value;

      // Calcular día de la semana para fechas - VERSIÓN SEGURA
      if (field === 'fecha') {
        if (value && typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
          newState.nombreDia = getDayName(value);
        } else {
          newState.nombreDia = '';
        }
      }



      // Limpiar sub-operación cuando cambia la operación principal
      if (field === 'operacion' && value !== prev.operacion) {
        newState.subOperacion = '';
        
        // Auto-seleccionar MOV ENTRE CUENTAS para INTERNAS
        if (value === 'INTERNAS') {
          newState.subOperacion = 'MOV ENTRE CUENTAS';
        }
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
          } else if (['COMPRA', 'VENTA', 'ARBITRAJE'].includes(prev.subOperacion) && prev.operacion === 'CUENTAS_CORRIENTES') {
            configKey = `CUENTAS_CORRIENTES_${prev.subOperacion}`;
          } else if (['INGRESO', 'SALIDA', 'PRESTAMO', 'DEVOLUCION'].includes(prev.subOperacion) && prev.operacion === 'SOCIOS') {
            configKey = 'SOCIOS_SHARED';
          } else if (prev.subOperacion === 'PRESTAMO' && prev.operacion === 'PRESTAMISTAS') {
            configKey = 'PRESTAMISTAS_PRESTAMO';
          } else if (prev.subOperacion === 'RETIRO' && prev.operacion === 'PRESTAMISTAS') {
            configKey = 'PRESTAMISTAS_RETIRO';
                } else if (prev.subOperacion === 'MOV ENTRE CUENTAS' && prev.operacion === 'INTERNAS') {
        configKey = 'MOV_ENTRE_CUENTAS';
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
      if (['monto', 'moneda', 'monedaTC', 'tc', 'montoVenta', 'tcVenta'].includes(field) && 
          (newState.subOperacion === 'ARBITRAJE' || 
           (newState.operacion === 'CUENTAS_CORRIENTES' && newState.subOperacion === 'ARBITRAJE'))) {
        // Auto-completar monto y moneda de venta cuando cambia compra
        if (field === 'monto') {
          newState.montoVenta = newState.monto;
        }
        if (field === 'moneda') {
          // Para campos de texto, necesitamos solo el código de la moneda
          const monedaObj = monedas.find(m => m.value === newState.moneda);
          newState.monedaVenta = monedaObj ? monedaObj.label.split(' ')[1] : newState.moneda;
        }
        if (field === 'monedaTC') {
          // Para campos de texto, necesitamos solo el código de la moneda
          const monedaTCObj = monedas.find(m => m.value === newState.monedaTC);
          newState.monedaTCVenta = monedaTCObj ? monedaTCObj.label.split(' ')[1] : newState.monedaTC;
          // La moneda de profit es igual a la moneda TC
          newState.monedaProfit = monedaTCObj ? monedaTCObj.label.split(' ')[1] : newState.monedaTC;
        }

        const monto = safeParseFloat(newState.monto);
        const tc = safeParseFloat(newState.tc);
        const montoVenta = safeParseFloat(newState.montoVenta);
        const tcVenta = safeParseFloat(newState.tcVenta);

        newState.totalCompra = safeCalculation.multiply(monto, tc).toFixed(2);
        newState.totalVenta = safeCalculation.multiply(montoVenta, tcVenta).toFixed(2);
        
        const totalCompraNum = safeParseFloat(newState.totalCompra);
        const totalVentaNum = safeParseFloat(newState.totalVenta);
        newState.profit = (totalVentaNum - totalCompraNum).toFixed(2);
      }

      // Auto-completar moneda de comisión cuando cambia la moneda principal (para todas las operaciones)
      if (field === 'moneda') {
        // Si monedaComision es un campo de texto (CUENTAS_CORRIENTES), mostrar el label
        if (newState.operacion === 'CUENTAS_CORRIENTES') {
          const selectedMoneda = monedas.find(m => m.value === newState.moneda);
          newState.monedaComision = selectedMoneda ? selectedMoneda.label.split(' ')[1] : newState.moneda;
        } else {
          newState.monedaComision = newState.moneda;
        }
      }

      // Auto-completado para CUENTAS CORRIENTES
      if (newState.operacion === 'CUENTAS_CORRIENTES' && ['INGRESO', 'EGRESO', 'COMPRA', 'VENTA', 'ARBITRAJE'].includes(newState.subOperacion)) {
        
        // NO auto-completar cuenta de comisión - debe ser seleccionada manualmente
        // if (field === 'cuenta') {
        //   newState.cuentaComision = newState.cuenta;
        // }

        // Calcular monto de comisión cuando cambia el monto, porcentaje o tipo
        if (['monto', 'comisionPorcentaje', 'comision', 'tipoComision'].includes(field)) {
          const monto = safeParseFloat(newState.monto);
          // Usar comisionPorcentaje o comision según cual esté presente
          const comisionValue = safeParseFloat(newState.comisionPorcentaje || newState.comision);
          
          if (monto > 0 && comisionValue > 0) {
            if (newState.tipoComision === 'percentage') {
              // Calcular como porcentaje
              const comisionCalculada = safeCalculation.percentage(monto, comisionValue);
              newState.montoComision = safeCalculation.formatFinancial(comisionCalculada, 4);
            } else {
              // Usar valor fijo
              newState.montoComision = safeCalculation.formatFinancial(comisionValue, 2);
            }
          } else {
            newState.montoComision = '';
          }

          // Calcular monto real (monto - comisión)
          const montoComision = safeParseFloat(newState.montoComision);
          if (monto > 0) {
            if (newState.subOperacion === 'INGRESO') {
              // Para ingreso: monto real = monto - comisión (lo que realmente ingresa)
              const montoRealCalculado = safeCalculation.subtract(monto, montoComision);
              newState.montoReal = safeCalculation.formatFinancial(montoRealCalculado, 2);
            } else if (newState.subOperacion === 'EGRESO') {
              // Para egreso: monto real = monto - comisión (lo que realmente sale)
              const montoRealCalculado = safeCalculation.subtract(monto, montoComision);
              newState.montoReal = safeCalculation.formatFinancial(montoRealCalculado, 2);
            } else {
              const montoRealCalculado = safeCalculation.subtract(monto, montoComision);
              newState.montoReal = safeCalculation.formatFinancial(montoRealCalculado, 2);
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
      fecha: getTodayLocalDate(), // Fecha actual por defecto
      nombreDia: getDayName(getTodayLocalDate()), // Día actual
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
    
    // Actualizar stock según el tipo de operación
    if (formData.operacion === 'TRANSACCIONES') {
      if (formData.subOperacion === 'COMPRA') {
        // En compra: recibimos la moneda, pagamos monedaTC
        // Actualizamos stock de la moneda que recibimos
        const tc = safeParseFloat(formData.tc);
        if (tc > 0) {
          stockService.registrarCompra(formData.moneda, formData.monto, tc);
        }
      } else if (formData.subOperacion === 'VENTA') {
        // En venta: vendemos la moneda, recibimos monedaTC
        // Registramos venta y calculamos utilidad
        const tc = safeParseFloat(formData.tc);
        if (tc > 0) {
          const resultado = stockService.registrarVenta(formData.moneda, formData.monto, tc);
          // Guardamos la utilidad calculada en el movimiento
          formData.utilidadCalculada = resultado.utilidadTotal;
          formData.utilidadPorcentaje = resultado.utilidadPorcentaje;
          formData.costoPromedio = resultado.costoPromedio;
        }
      } else if (formData.subOperacion === 'ARBITRAJE') {
        // En arbitraje: compramos una moneda y vendemos otra
        const tcCompra = safeParseFloat(formData.tc);
        const tcVenta = safeParseFloat(formData.tcVenta);
        
        if (tcCompra > 0) {
          stockService.registrarCompra(formData.moneda, formData.monto, tcCompra);
        }
        if (tcVenta > 0) {
          const resultado = stockService.registrarVenta(formData.monedaVenta, formData.montoVenta, tcVenta);
          formData.utilidadCalculada = resultado.utilidadTotal;
          formData.utilidadPorcentaje = resultado.utilidadPorcentaje;
        }
      }
    } else if (formData.operacion === 'CUENTAS_CORRIENTES') {
      // Similar lógica para CC
      if (formData.subOperacion === 'COMPRA') {
        const tc = safeParseFloat(formData.tc);
        if (tc > 0) {
          stockService.registrarCompra(formData.moneda, formData.monto, tc);
        }
      } else if (formData.subOperacion === 'VENTA') {
        const tc = safeParseFloat(formData.tc);
        if (tc > 0) {
          const resultado = stockService.registrarVenta(formData.moneda, formData.monto, tc);
          formData.utilidadCalculada = resultado.utilidadTotal;
          formData.utilidadPorcentaje = resultado.utilidadPorcentaje;
          formData.costoPromedio = resultado.costoPromedio;
        }
      } else if (formData.subOperacion === 'ARBITRAJE') {
        // Ahora usa los mismos campos que ARBITRAJE normal
        const tcCompra = safeParseFloat(formData.tc);
        const tcVenta = safeParseFloat(formData.tcVenta);
        
        if (tcCompra > 0) {
          stockService.registrarCompra(formData.moneda, formData.monto, tcCompra);
        }
        if (tcVenta > 0) {
          const resultado = stockService.registrarVenta(formData.monedaVenta, formData.montoVenta, tcVenta);
          formData.utilidadCalculada = resultado.utilidadTotal;
          formData.utilidadPorcentaje = resultado.utilidadPorcentaje;
        }
      }
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
    <div className="grid grid-cols-2 gap-8">
      <FormSelect
        label="Estado de retiro"
        name="estado"
        value={formData.estado}
        onChange={(val) => handleInputChange('estado', val)}
        options={estados}
      />
      <FormSelect
        label="Por"
        name="por"
        value={formData.por}
        onChange={(val) => handleInputChange('por', val)}
        options={socios}
      />
    </div>
  );

  const renderCamposEspecificos = useMemo(() => {
    let configKey = formData.subOperacion;

    if (['INGRESO', 'EGRESO'].includes(formData.subOperacion) && formData.operacion === 'CUENTAS_CORRIENTES') {
      configKey = 'CUENTAS_CORRIENTES_INGRESO_EGRESO';
    } else if (['COMPRA', 'VENTA', 'ARBITRAJE'].includes(formData.subOperacion) && formData.operacion === 'CUENTAS_CORRIENTES') {
      configKey = `CUENTAS_CORRIENTES_${formData.subOperacion}`;
    } else if (['INGRESO', 'SALIDA', 'PRESTAMO', 'DEVOLUCION'].includes(formData.subOperacion) && formData.operacion === 'SOCIOS') {
      configKey = 'SOCIOS_SHARED';
    } else if (formData.subOperacion === 'PRESTAMO' && formData.operacion === 'PRESTAMISTAS') {
      configKey = 'PRESTAMISTAS_PRESTAMO';
    } else if (formData.subOperacion === 'RETIRO' && formData.operacion === 'PRESTAMISTAS') {
      configKey = 'PRESTAMISTAS_RETIRO';
    } else if (formData.subOperacion === 'MOV ENTRE CUENTAS' && formData.operacion === 'INTERNAS') {
      configKey = 'MOV_ENTRE_CUENTAS';
    }

    const config = specificFieldsConfig[configKey];

    if (!config) {
      return null;
    }

    const prepareFields = (fieldsArray) => fieldsArray.map(field => ({
      ...field,
      value: formData[field.name],
      onChange: (val) => handleInputChange(field.name, val),
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
        <DynamicFormFieldGroups 
          groups={fieldGroups} 
          formData={formData}
          onFieldChange={handleInputChange}
        />
        {conditionalFields.length > 0 && (
          <FormFieldGroup 
            fields={conditionalFields} 
            formData={formData}
            onFieldChange={handleInputChange}
          />
        )}

        {showPagoMixtoOption && (
          <div className="mt-6">
            <MixedPaymentGroup
            payments={formData.mixedPayments}
            onPaymentChange={handleMixedPaymentChange}
            onAddPayment={addMixedPayment}
            onRemovePayment={removeMixedPayment}
            totalExpected={formData.expectedTotalForMixedPayments || 0}
            currency={formData.monedaTC || 'PESO'}
            />
          </div>
        )}

        {config.includesEstadoYPor && renderEstadoYPor()}
      </>
    );
  }, [formData, handleInputChange, renderEstadoYPor, prestamistaClientsOptions, handleMixedPaymentChange, addMixedPayment, removeMixedPayment]);

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-3 lg:p-4 safe-top safe-bottom pt-24">
      <div className="w-full">
        <div className="bg-white">
            {/* Header */}
            <div className="p-1 sm:p-2 lg:p-3 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <DollarSign size={20} className="sm:w-6 sm:h-6 text-gray-800" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    {initialMovementData ? 'Editar Movimiento' : 'Nueva Operación Financiera'}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">Complete los datos de la operación</p>
                </div>
              </div>
            </div>
            
            <div className="p-3 sm:p-4 lg:p-6 space-y-6">
              {/* Campo Cliente - Universal con autocompletado */}
              {formData.operacion !== 'PRESTAMISTAS' && (
                <ClientAutocomplete
                  ref={createElementRef('cliente', { type: 'autocomplete', order: 1 })}
                  label="CLIENTE"
                  name="cliente"
                  value={formData.cliente}
                  onChange={(val) => handleInputChange('cliente', val)}
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
            ref={createElementRef('fecha', { type: 'input', order: 2 })}
            label="FECHA"
            name="fecha"
            type="date"
            value={formData.fecha}
            onChange={(val) => handleInputChange('fecha', val)}
            showDayName={true}
            dayName={formData.nombreDia}
            required
          />

          {/* Campo Detalle */}
          <div className="mt-4">
            <FormInput
            ref={createElementRef('detalle', { type: 'input', order: 3 })}
            label="DETALLE"
            name="detalle"
            value={formData.detalle}
            onChange={(val) => handleInputChange('detalle', val)}
            placeholder="Descripción de la operación"
            />
          </div>

          {/* Selector de Operación principal */}
          <div className="mt-4">
            <ButtonSelectGroup
              ref={createElementRef('operacion', { type: 'select', order: 4 })}
              label="OPERACIÓN"
              name="operacion"
              value={formData.operacion}
              onChange={(val) => handleInputChange('operacion', val)}
              options={Object.entries(operaciones).map(([key, op]) => ({
                value: key,
                label: `${op.icon} ${key.replace('_', ' ')}`,
              }))}
              required
            />
          </div>

          {/* Línea divisoria */}
          {formData.operacion && (
            <div className="my-6 border-t-2 border-gray-200"></div>
          )}

          {/* Selector de Detalle de Operación */}
          {formData.operacion &&
            operaciones[formData.operacion]?.subMenu?.length > 0 && (
              <div>
                <SubOperationButtons
                  ref={createElementRef('subOperacion', { type: 'select', order: 5 })}
                  label="DETALLE OPERACIÓN"
                  name="subOperacion"
                  value={formData.subOperacion}
                  onChange={(val) => handleInputChange('subOperacion', val)}
                  options={operaciones[formData.operacion].subMenu.map((sub) => ({
                    value: sub,
                    label: sub,
                  }))}
                  required
                />
              </div>
            )}

          {/* Campos específicos dinámicos */}
          {renderCamposEspecificos}

          {/* Campo para "Otro" si se selecciona en "Por" */}
          {formData.por === 'otro' && (
            <FormInput
              label="NOMBRE"
              name="nombreOtro"
              value={formData.nombreOtro}
              onChange={(val) => handleInputChange('nombreOtro', val)}
              placeholder="Nombre de la persona"
              required
            />
          )}

          {/* Resumen para operaciones COMPRA/VENTA */}
          {(['COMPRA', 'VENTA'].includes(formData.subOperacion) && formData.total) && (
            <div className="bg-gradient-to-br from-gray-50 to-gray-50 border-2 border-gray-200 rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Resumen de la Operación</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-white rounded-lg p-3 shadow-sm">
                  <span className="text-gray-600 text-sm">Monto:</span>
                  <span className="font-bold text-gray-900 text-lg whitespace-nowrap">
                    {formatAmountWithCurrency(formData.monto, formData.moneda)}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-white rounded-lg p-3 shadow-sm">
                  <span className="text-gray-600 text-sm">Tipo de Cambio:</span>
                  <span className="font-bold text-gray-900 text-lg whitespace-nowrap">
                    {formatAmountWithCurrency(formData.tc, formData.monedaTC)}
                  </span>
                </div>
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-4 shadow-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-100 text-sm">Total Final:</span>
                    <span className="text-2xl font-bold text-white whitespace-nowrap">
                      {formatAmountWithCurrency(formData.total, formData.monedaTC)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row justify-between pt-6 border-t border-gray-200 gap-3">
            <button
              ref={createElementRef('guardar', { type: 'button', order: 100 })}
              onClick={handleGuardar}
              className="btn-primary flex-1 sm:flex-none touch-target"
              disabled={!formData.operacion || !formData.subOperacion}
            >
              {initialMovementData ? 'Actualizar' : 'Guardar'}
            </button>
            <button
              ref={createElementRef('limpiar', { type: 'button', order: 101 })}
              onClick={clearForm}
              className="btn-secondary flex-1 sm:flex-none touch-target"
            >
              Limpiar Formulario
            </button>
            {onCancelEdit && (
              <button
                ref={createElementRef('cancelar', { type: 'button', order: 102 })}
                onClick={onCancelEdit}
                className="btn-secondary flex-1 sm:flex-none touch-target"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default FinancialOperationsApp;