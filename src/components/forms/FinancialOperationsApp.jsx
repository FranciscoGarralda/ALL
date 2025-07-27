import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { DollarSign, XCircle, PlusCircle } from 'lucide-react';
import {
  FormInput,
  FormSelect,
  FormFieldGroup,
  WalletPaymentGroup,
  formatAmountWithCurrency,
  monedas,
  cuentas,
  socios,
  estados,
  operaciones,
  proveedoresCC
} from '../base';
import ClientAutocomplete from '../base/ClientAutocomplete';
import { specificFieldsConfig } from '../../config/fieldConfigs';

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
    fecha: '',
    nombreDia: '',
    detalle: '',
    operacion: '',
    subOperacion: '',
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
    pagoMixtoActivo: false,
    pagosMixtos: [],
    expectedTotalForMixedPayments: '',
    ...initialMovementData
  });

  // Filter clients for prestamistas
  const prestamistaClientsOptions = useMemo(() => {
    const filtered = clients?.filter(c => c.tipoCliente === 'prestamistas') || [];
    return [{ value: '', label: 'Seleccionar cliente prestamista' }, ...filtered.map(c => ({ value: c.nombre, label: `${c.nombre} ${c.apellido}` }))];
  }, [clients]);

  // Referencias para navegación con Enter
  const fieldRefs = useRef({});
  const [fieldOrder, setFieldOrder] = useState([]);

  // Función para registrar campos en el orden correcto
  const registerField = useCallback((fieldName, ref) => {
    if (ref) {
      fieldRefs.current[fieldName] = ref;
    }
  }, []);

  // Función para manejar navegación bidimensional
  const handleKeyboardNavigation = useCallback((currentField, event) => {
    // Si viene del botón +, usar 'crearCliente' como campo actual
    if (event.target && event.target.name === 'crearCliente') {
      currentField = 'crearCliente';
    }
    // Definir el orden de campos dinámicamente
    const baseFields = ['cliente', 'crearCliente', 'fecha', 'detalle', 'operacion'];
    const conditionalFields = [];
    
    // Agregar sub-operación si es necesaria
    if (formData.operacion && 
        operaciones[formData.operacion]?.subMenu?.length > 0 && 
        formData.operacion !== 'INTERNAS') {
      conditionalFields.push('subOperacion');
    }
    
    // Agregar campos específicos según la operación
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

    const config = specificFieldsConfig[configKey] || specificFieldsConfig[formData.operacion];

    if (config && config.groups) {
      // Extraer nombres de campos de todos los grupos
      const fieldGroups = typeof config.groups === 'function'
        ? config.groups(formData)
        : config.groups;
      
      fieldGroups.forEach(group => {
        group.forEach(field => {
          if (field.name && !conditionalFields.includes(field.name)) {
            // Excluir campos calculados/readOnly de la navegación
            if (!field.readOnly && !field.calculated) {
              conditionalFields.push(field.name);
            }
          }
        });
      });

      // Agregar campos condicionales si existen
      if (config.conditionalFields) {
        const conditionalFieldsFromConfig = typeof config.conditionalFields === 'function'
          ? config.conditionalFields(formData)
          : config.conditionalFields;
        
        conditionalFieldsFromConfig.forEach(field => {
          if (field.name && !conditionalFields.includes(field.name)) {
            // Excluir campos calculados/readOnly de la navegación
            if (!field.readOnly && !field.calculated) {
              conditionalFields.push(field.name);
            }
          }
        });
      }
    }
    
    // Agregar checkbox de pago mixto si aplica
    if (config && config.includesPagoMixto) {
      conditionalFields.push('pagoMixtoActivo');
    }
    
    // Agregar campos comunes del final
    const endFields = ['estado', 'por'];
    if (formData.por === 'otro') {
      endFields.push('nombreOtro');
    }
    
    // Agregar botones al final
    const buttonFields = ['guardar', 'limpiar', 'cancelar'];
    
    const currentFieldOrder = [...baseFields, ...conditionalFields, ...endFields, ...buttonFields];
    const currentIndex = currentFieldOrder.indexOf(currentField);

    // Debug temporal - remover después
    console.log('🔍 Navigation Debug:', {
      currentField,
      currentIndex,
      currentFieldOrder,
      formData: { operacion: formData.operacion, subOperacion: formData.subOperacion }
    });

    // Función para enfocar un campo
    const focusField = (fieldName, delay = 0) => {
      const fieldRef = fieldRefs.current[fieldName];
      if (fieldRef) {
        setTimeout(() => {
          // Para checkboxes, enfocar directamente
          if (fieldRef.type === 'checkbox') {
            fieldRef.focus();
          }
          // Para otros elementos
          else if (fieldRef.focus) {
            fieldRef.focus();
          } else if (fieldRef.querySelector) {
            const input = fieldRef.querySelector('input, select, textarea');
            if (input) input.focus();
          }
        }, delay);
      }
    };

    // Función para abrir dropdown/select
    const openField = (fieldName) => {
      const fieldRef = fieldRefs.current[fieldName];
      if (fieldRef) {
        // Para checkboxes, enfocar primero (no alternar automáticamente)
        if (fieldRef.type === 'checkbox') {
          fieldRef.focus();
          return;
        }
        
        // Para botones, hacer click
        if (fieldRef.tagName === 'BUTTON') {
          fieldRef.click();
          return;
        }
        
        // Para el botón crear cliente (caso especial)
        if (fieldName === 'crearCliente' && fieldRef) {
          fieldRef.click();
          return;
        }
        
        // Para selects nativos
        if (fieldRef.tagName === 'SELECT') {
          fieldRef.focus();
          // Simular click para abrir
          fieldRef.click();
        }
        // Para ClientAutocomplete y otros componentes personalizados
        else if (fieldRef.querySelector) {
          const input = fieldRef.querySelector('input, select');
          if (input) {
            input.focus();
            // Si es un select, hacer click
            if (input.tagName === 'SELECT') {
              input.click();
            }
            // Si es un input (ClientAutocomplete), simular ArrowDown para abrir
            else if (input.tagName === 'INPUT') {
              const arrowDownEvent = new KeyboardEvent('keydown', {
                key: 'ArrowDown',
                bubbles: true,
                cancelable: true
              });
              input.dispatchEvent(arrowDownEvent);
            }
          }
        }
      }
    };

    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        // Enter abre el dropdown/menú del campo actual
        openField(currentField);
        break;

      case 'ArrowDown':
        event.preventDefault();
        // Flecha abajo va al siguiente campo
        if (currentIndex < currentFieldOrder.length - 1) {
          const nextField = currentFieldOrder[currentIndex + 1];
          focusField(nextField);
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        // Flecha arriba va al campo anterior
        if (currentIndex > 0) {
          const prevField = currentFieldOrder[currentIndex - 1];
          focusField(prevField);
        }
        break;

      case 'ArrowRight':
        event.preventDefault();
        // Flecha derecha va al siguiente campo (igual que abajo)
        if (currentIndex < currentFieldOrder.length - 1) {
          const nextField = currentFieldOrder[currentIndex + 1];
          focusField(nextField);
        }
        break;

      case 'ArrowLeft':
        event.preventDefault();
        // Flecha izquierda va al campo anterior (igual que arriba)
        if (currentIndex > 0) {
          const prevField = currentFieldOrder[currentIndex - 1];
          focusField(prevField);
        }
        break;

      default:
        // Para otras teclas, comportamiento normal
        break;
    }
  }, [formData.operacion, formData.subOperacion, formData.por]);

  useEffect(() => {
    if (initialMovementData) {
      setFormData(initialMovementData);
    } else {
      clearForm();
    }
  }, [initialMovementData]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const newState = { ...prev, [field]: value };

      // Calcular día de la semana para fechas
      if (field === 'fecha') {
        try {
          const date = new Date(value + 'T00:00:00');
          if (!isNaN(date.getTime())) {
            newState.nombreDia = date.toLocaleDateString('es-ES', { weekday: 'long' });
          } else {
            newState.nombreDia = '';
          }
        } catch (error) {
          newState.nombreDia = '';
        }
      }

      // Auto-selección para operaciones internas
      if (field === 'operacion' && value === 'INTERNAS') {
        newState.subOperacion = 'TRANSFERENCIA';
      } else if (field === 'operacion' && value !== 'INTERNAS' && prev.operacion === 'INTERNAS') {
        newState.subOperacion = '';
      }

      // Reset moneda if proveedorCC changes
      if (field === 'proveedorCC' && newState.operacion === 'CUENTAS_CORRIENTES') {
        const selectedProveedor = proveedoresCC.find(p => p.value === value);
        if (selectedProveedor && !selectedProveedor.allowedCurrencies.includes(newState.moneda)) {
          newState.moneda = '';
        }
      }

      // Lógica de pago mixto
      if (field === 'pagoMixtoActivo') {
        if (value === true) {
          const expectedTotal = (parseFloat(prev.monto) || 0) * (parseFloat(prev.tc) || 1);
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
          
          // Crear pagos iniciales con estructura apropiada
          if (isWalletMode) {
            newState.pagosMixtos = [
              { id: 1, wallet: '', monto: expectedTotal.toFixed(2) },
              { id: Date.now(), wallet: '', monto: '' }
            ];
          } else {
            newState.pagosMixtos = [
              { id: 1, cuenta: '', monto: expectedTotal.toFixed(2) },
              { id: Date.now(), cuenta: '', monto: '' }
            ];
          }
          newState.total = expectedTotal.toFixed(2);
        } else {
          if (['COMPRA', 'VENTA'].includes(newState.subOperacion)) {
            const currentMonto = parseFloat(newState.monto);
            const currentTc = parseFloat(newState.tc);
            if (currentMonto && currentTc) {
              newState.total = (currentMonto * currentTc).toFixed(2);
            } else {
              newState.total = '';
            }
          }
          newState.pagosMixtos = [{ id: 1, cuenta: '', monto: '' }];
          newState.expectedTotalForMixedPayments = '';
        }
      }

      // Cálculo automático de totales para COMPRA/VENTA
      if (['monto', 'total', 'tc'].includes(field) && ['COMPRA', 'VENTA'].includes(newState.subOperacion)) {
        const currentMonto = parseFloat(newState.monto);
        const currentTotal = parseFloat(newState.total);
        const currentTc = parseFloat(newState.tc);

        if (!newState.pagoMixtoActivo) {
          if (field === 'monto' && currentMonto && currentTc) {
            newState.total = (currentMonto * currentTc).toFixed(2);
          } else if (field === 'total' && currentTotal && currentTc) {
            newState.monto = (currentTotal / currentTc).toFixed(2);
          } else if (field === 'tc' && currentMonto && currentTc) {
            newState.total = (currentMonto * currentTc).toFixed(2);
          } else if (field === 'tc' && currentTotal && currentTc) {
            newState.monto = (currentTotal / currentTc).toFixed(2);
          }
        } else {
          const newExpectedTotal = (currentMonto || 0) * (currentTc || 1);
          newState.expectedTotalForMixedPayments = newExpectedTotal.toFixed(2);

          const sumOfOtherPaymentsExcludingFirst = newState.pagosMixtos.slice(1).reduce((sum, p) => sum + (parseFloat(p.monto) || 0), 0);
          newState.pagosMixtos[0].monto = (newExpectedTotal - sumOfOtherPaymentsExcludingFirst).toFixed(2);

          newState.total = newState.pagosMixtos.reduce((sum, pago) => sum + (parseFloat(pago.monto) || 0), 0).toFixed(2);
        }
      }

      // Cálculo automático para ARBITRAJE
      if (['monto', 'tc', 'montoVenta', 'tcVenta'].includes(field) && newState.subOperacion === 'ARBITRAJE') {
        const monto = parseFloat(newState.monto) || 0;
        const tc = parseFloat(newState.tc) || 0;
        const montoVenta = parseFloat(newState.montoVenta) || 0;
        const tcVenta = parseFloat(newState.tcVenta) || 0;

        newState.totalCompra = (monto * tc).toFixed(2);
        newState.totalVenta = (montoVenta * tcVenta).toFixed(2);
        
        const totalCompraNum = parseFloat(newState.totalCompra) || 0;
        const totalVentaNum = parseFloat(newState.totalVenta) || 0;
        newState.comision = (totalVentaNum - totalCompraNum).toFixed(2);
      }

      return newState;
    });
  };

  const handlePagoMixtoChange = (id, field, value) => {
    setFormData(prev => {
      const updatedPagos = prev.pagosMixtos.map(pago =>
        pago.id === id ? { ...pago, [field]: value } : pago
      );

      let newTotal = prev.total;
      const expectedTotal = parseFloat(prev.expectedTotalForMixedPayments) || 0;

      if (prev.pagoMixtoActivo) {
        if (field === 'monto') {
          const changedPaymentIndex = updatedPagos.findIndex(p => p.id === id);

          if (changedPaymentIndex !== 0) {
            const sumOfOtherPaymentsExcludingFirst = updatedPagos.slice(1).reduce((sum, p) => sum + (parseFloat(p.monto) || 0), 0);
            updatedPagos[0].monto = (expectedTotal - sumOfOtherPaymentsExcludingFirst).toFixed(2);
          }
        }
        newTotal = updatedPagos.reduce((sum, pago) => sum + (parseFloat(pago.monto) || 0), 0).toFixed(2);
      }

      return { ...prev, pagosMixtos: updatedPagos, total: newTotal };
    });
  };

  const addPagoMixto = () => {
    setFormData(prev => {
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
      
      // Crear nuevo pago con campos apropiados
      const newPago = isWalletMode 
        ? { id: Date.now(), wallet: '', monto: '' }
        : { id: Date.now(), cuenta: '', monto: '' };
      
      const newPagos = [...prev.pagosMixtos, newPago];
      let newTotal = prev.total;
      if (prev.pagoMixtoActivo) {
        newTotal = newPagos.reduce((sum, pago) => sum + (parseFloat(pago.monto) || 0), 0).toFixed(2);
      }
      return {
        ...prev,
        pagosMixtos: newPagos,
        total: newTotal
      };
    });
  };

  const removePagoMixto = (id) => {
    setFormData(prev => {
      const filteredPagos = prev.pagosMixtos.filter(pago => pago.id !== id);
      let newTotal = prev.total;
      const expectedTotal = parseFloat(prev.expectedTotalForMixedPayments) || 0;

      if (prev.pagoMixtoActivo) {
        if (id === prev.pagosMixtos[0].id && filteredPagos.length > 0) {
          const sumOfRemainingPayments = filteredPagos.slice(1).reduce((sum, p) => sum + (parseFloat(p.monto) || 0), 0);
          filteredPagos[0].monto = (expectedTotal - sumOfRemainingPayments).toFixed(2);
        } else if (filteredPagos.length > 0) {
          const sumOfOtherPaymentsExcludingFirst = filteredPagos.slice(1).reduce((sum, p) => sum + (parseFloat(p.monto) || 0), 0);
          filteredPagos[0].monto = (expectedTotal - sumOfOtherPaymentsExcludingFirst).toFixed(2);
        } else {
          filteredPagos.push({ id: Date.now(), cuenta: '', monto: expectedTotal.toFixed(2) });
        }
        newTotal = filteredPagos.reduce((sum, pago) => sum + (parseFloat(pago.monto) || 0), 0).toFixed(2);
      }
      return {
        ...prev,
        pagosMixtos: filteredPagos,
        total: newTotal
      };
    });
  };

  const clearForm = () => {
    setFormData({
      cliente: '',
      fecha: '',
      nombreDia: '',
      detalle: '',
      operacion: '',
      subOperacion: '',
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
      pagoMixtoActivo: false,
      pagosMixtos: [],
      expectedTotalForMixedPayments: '',
    });
  };

  const handleGuardar = () => {
    console.log("Attempting to save movement. Current formData:", formData);
    // Validar Pago Mixto
    if (formData.pagoMixtoActivo) {
      const totalPagosMixtos = formData.pagosMixtos.reduce((sum, pago) => sum + (parseFloat(pago.monto) || 0), 0);
      const expectedTotal = parseFloat(formData.expectedTotalForMixedPayments) || 0;

      if (Math.abs(totalPagosMixtos - expectedTotal) > 0.01) {
        alert('Error de Pago Mixto: La suma de los montos en Pago Mixto NO coincide con el Valor de la Operación. Por favor, revise.');
        console.error("Pago Mixto validation failed:", { totalPagosMixtos, expectedTotal });
        return;
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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
      <FormSelect
        ref={(el) => registerField('estado', el)}
        label="Estado de retiro"
        name="estado"
        value={formData.estado}
        onChange={(val) => handleInputChange('estado', val)}
                        onKeyDown={(e) => handleKeyboardNavigation('estado', e)}
        options={estados}
      />
      <FormSelect
        ref={(el) => registerField('por', el)}
        label="Por"
        name="por"
        value={formData.por}
        onChange={(val) => handleInputChange('por', val)}
                        onKeyDown={(e) => handleKeyboardNavigation('por', e)}
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
      readOnly: field.name === 'total' && formData.pagoMixtoActivo
    }));

    const fieldGroups = typeof config.groups === 'function'
      ? config.groups(formData).map(group => prepareFields(group))
      : config.groups.map(group => prepareFields(group));

    const conditionalFields = typeof config.conditionalFields === 'function'
      ? prepareFields(config.conditionalFields(formData))
      : [];

    const showPagoMixtoOption = config.includesPagoMixto;

    return (
      <>
        <DynamicFormFieldGroups groups={fieldGroups} onKeyDown={handleKeyboardNavigation} />
        {conditionalFields.length > 0 && (
          <FormFieldGroup fields={conditionalFields} onKeyDown={handleKeyboardNavigation} />
        )}

        {showPagoMixtoOption && (
          <div className="mt-4">
            {config.pagoMixtoWalletMode ? (
              <WalletPaymentGroup
                payments={formData.pagosMixtos}
                onPaymentChange={handlePagoMixtoChange}
                onAddPayment={addPagoMixto}
                onRemovePayment={removePagoMixto}
                totalExpected={formData.expectedTotalForMixedPayments || 0}
                currency={formData.monedaTC || 'PESO'}
                isActive={formData.pagoMixtoActivo}
                onToggle={(active) => handleInputChange('pagoMixtoActivo', active)}
              />
            ) : (
              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    ref={(el) => registerField('pagoMixtoActivo', el)}
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-blue-600 rounded"
                    checked={formData.pagoMixtoActivo}
                    onChange={(e) => handleInputChange('pagoMixtoActivo', e.target.checked)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        // Alternar el checkbox
                        e.target.checked = !e.target.checked;
                        e.target.dispatchEvent(new Event('change', { bubbles: true }));
                      } else {
                        handleKeyboardNavigation('pagoMixtoActivo', e);
                      }
                    }}
                  />
                  <span className="text-sm font-medium text-gray-700">Pago Mixto</span>
                </label>

                {formData.pagoMixtoActivo && (
                  <div className="mt-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Detalle de Pago Mixto</h4>
                    {formData.pagosMixtos.map((pago, index) => (
                      <div key={pago.id} className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2 items-end">
                        <FormSelect
                          label="Cuenta"
                          value={pago.cuenta}
                          onChange={(val) => handlePagoMixtoChange(pago.id, 'cuenta', val)}
                          options={cuentas}
                        />
                        <FormInput
                          label="Monto"
                          type="number"
                          value={pago.monto}
                          onChange={(val) => handlePagoMixtoChange(pago.id, 'monto', val)}
                          placeholder="Monto a pagar"
                        />
                        <button
                          type="button"
                          onClick={() => removePagoMixto(pago.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors touch-target"
                          aria-label="Eliminar pago"
                        >
                          <XCircle size={20} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addPagoMixto}
                      className="mt-2 flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors touch-target"
                    >
                      <PlusCircle size={16} /> Añadir Pago
                    </button>
                    <div className="mt-3 text-sm font-medium text-gray-800">
                      Total Pagos Mixtos: {formatAmountWithCurrency(formData.pagosMixtos.reduce((sum, p) => sum + (parseFloat(p.monto) || 0), 0), formData.monedaTC || 'PESO')}
                    </div>
                    {formData.expectedTotalForMixedPayments && (
                      <div className="text-xs text-gray-600 mt-1">
                        Valor de la Operación: {formatAmountWithCurrency(formData.expectedTotalForMixedPayments, formData.monedaTC || 'PESO')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {config.includesEstadoYPor && renderEstadoYPor()}
      </>
    );
  }, [formData, handleInputChange, renderEstadoYPor, prestamistaClientsOptions, handlePagoMixtoChange, addPagoMixto, removePagoMixto]);

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
              onKeyDown={(e) => handleKeyboardNavigation('cliente', e)}
              onRegisterCreateButton={(el) => registerField('crearCliente', el)}
              clients={clients || []}
              required={true}
              placeholder="Buscar o seleccionar cliente"
              onClientCreated={(newClient) => {
                console.log('Cliente recibido para guardar:', newClient);
                console.log('onSaveClient function exists:', !!onSaveClient);
                
                // Guardar el cliente en la base de datos
                if (onSaveClient) {
                  onSaveClient(newClient);
                  console.log('Cliente enviado a handleSaveClient');
                } else {
                  console.error('onSaveClient function not available');
                }
                
                // Auto-seleccionar el cliente recién creado
                handleInputChange('cliente', newClient.id || newClient.nombre);
                console.log('Cliente auto-seleccionado:', newClient.id || newClient.nombre);
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
                          onKeyDown={(e) => handleKeyboardNavigation('fecha', e)}
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
                          onKeyDown={(e) => handleKeyboardNavigation('detalle', e)}
            placeholder="Descripción de la operación"
          />

          {/* Selector de Operación principal */}
          <FormSelect
            ref={(el) => registerField('operacion', el)}
            label="OPERACIÓN"
            name="operacion"
            value={formData.operacion}
            onChange={(val) => handleInputChange('operacion', val)}
                          onKeyDown={(e) => handleKeyboardNavigation('operacion', e)}
            options={[
              { value: '', label: 'Seleccionar operación' },
              ...Object.entries(operaciones).map(([key, op]) => ({
                value: key,
                label: `${op.icon} ${key.replace('_', ' ')}`,
              })),
            ]}
            required
          />

          {/* Selector de Detalle de Operación - Oculto para INTERNAS */}
          {formData.operacion &&
            operaciones[formData.operacion]?.subMenu?.length > 0 &&
            formData.operacion !== 'INTERNAS' && (
              <FormSelect
                ref={(el) => registerField('subOperacion', el)}
                label="DETALLE OPERACIÓN"
                name="subOperacion"
                value={formData.subOperacion}
                onChange={(val) => handleInputChange('subOperacion', val)}
                onKeyDown={(e) => handleKeyboardNavigation('subOperacion', e)}
                options={[
                  { value: '', label: 'Seleccionar detalle' },
                  ...operaciones[formData.operacion].subMenu.map((sub) => ({
                    value: sub,
                    label: sub,
                  })),
                ]}
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
                              onKeyDown={(e) => handleKeyboardNavigation('nombreOtro', e)}
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
            onKeyDown={(e) => handleKeyboardNavigation('guardar', e)}
            className="btn-primary flex-1 sm:flex-none touch-target"
            disabled={!formData.operacion || !formData.subOperacion}
          >
            {initialMovementData ? 'Actualizar' : 'Guardar'}
          </button>
          <button
            ref={(el) => registerField('limpiar', el)}
            onClick={clearForm}
            onKeyDown={(e) => handleKeyboardNavigation('limpiar', e)}
            className="btn-secondary flex-1 sm:flex-none touch-target"
          >
            Limpiar Formulario
          </button>
          {onCancelEdit && (
            <button
              ref={(el) => registerField('cancelar', el)}
              onClick={onCancelEdit}
              onKeyDown={(e) => handleKeyboardNavigation('cancelar', e)}
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