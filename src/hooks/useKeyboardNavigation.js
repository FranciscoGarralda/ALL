import { useCallback, useRef } from 'react';

/**
 * Custom hook for managing keyboard navigation in forms
 * Provides standardized navigation functionality across all form components
 */
export const useKeyboardNavigation = () => {
  const fieldRefs = useRef({});

  // Register field reference
  const registerField = useCallback((fieldName, ref) => {
    if (ref) {
      fieldRefs.current[fieldName] = ref;
    }
  }, []);

  // Focus a specific field
  const focusField = useCallback((fieldName, delay = 0) => {
    // SSR safety check
    if (typeof window === 'undefined') return;
    
    const fieldRef = fieldRefs.current[fieldName];
    if (fieldRef) {
      setTimeout(() => {
        // For checkboxes, focus directly
        if (fieldRef.type === 'checkbox') {
          fieldRef.focus();
        }
        // For other elements
        else if (fieldRef.focus) {
          fieldRef.focus();
        } else if (fieldRef.querySelector) {
          const input = fieldRef.querySelector('input, select, textarea');
          if (input) input.focus();
        }
      }, delay);
    }
  }, []);

  // Open/activate a field (for dropdowns, date pickers, etc.)
  const openField = useCallback((fieldName) => {
    // SSR safety check
    if (typeof window === 'undefined') return;
    
    const fieldRef = fieldRefs.current[fieldName];
    if (fieldRef) {
      // For checkboxes, focus first (don't toggle automatically)
      if (fieldRef.type === 'checkbox') {
        fieldRef.focus();
        return;
      }
      
      // For buttons, click them
      if (fieldRef.tagName === 'BUTTON') {
        fieldRef.click();
        return;
      }
      
      // For create client button (special case)
      if (fieldName === 'crearCliente' && fieldRef) {
        fieldRef.click();
        return;
      }
      
      // For native selects
      if (fieldRef.tagName === 'SELECT') {
        fieldRef.focus();
        // Simulate click to open
        fieldRef.click();
      }
      // For ClientAutocomplete and other custom components
      else if (fieldRef.querySelector) {
        const input = fieldRef.querySelector('input, select');
        if (input) {
          input.focus();
          // If it's a select, click it
          if (input.tagName === 'SELECT') {
            input.click();
          }
          // If it's an input (ClientAutocomplete), simulate ArrowDown to open
          else if (input.tagName === 'INPUT' && typeof window !== 'undefined') {
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
  }, []);

  // Build dynamic field order based on form state
  const buildFieldOrder = useCallback((formData, specificFieldsConfig) => {
    const baseFields = ['cliente', 'crearCliente', 'fecha', 'detalle', 'operacion'];
    const conditionalFields = [];
    
    // Add sub-operation if needed
    if (formData.operacion && 
        specificFieldsConfig[formData.operacion]?.subMenu?.length > 0 && 
        formData.operacion !== 'INTERNAS') {
      conditionalFields.push('subOperacion');
    }
    
    // Add specific fields based on operation
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
      // Extract field names from all groups
      const fieldGroups = typeof config.groups === 'function'
        ? config.groups(formData)
        : config.groups;
      
      fieldGroups.forEach(group => {
        group.forEach(field => {
          if (field.name && !conditionalFields.includes(field.name)) {
            // Exclude calculated/readOnly fields from navigation
            if (!field.readOnly && !field.calculated) {
              conditionalFields.push(field.name);
            }
          }
        });
      });

      // Add conditional fields if they exist
      if (config.conditionalFields) {
        const conditionalFieldsFromConfig = typeof config.conditionalFields === 'function'
          ? config.conditionalFields(formData)
          : config.conditionalFields;
        
        conditionalFieldsFromConfig.forEach(field => {
          if (field.name && !conditionalFields.includes(field.name)) {
            // Exclude calculated/readOnly fields from navigation
            if (!field.readOnly && !field.calculated) {
              conditionalFields.push(field.name);
            }
          }
        });
      }
    }
    
    // Add mixed payment fields if active
    const mixedPaymentFields = [];
    if (formData.walletTC === 'pago_mixto') {
      // Default 2 payments, max 4
      const paymentsCount = Math.max(2, (formData.mixedPayments || []).length);
      for (let i = 0; i < Math.min(paymentsCount, 4); i++) {
        mixedPaymentFields.push(`mixedPayment_${i}_socio`);
        mixedPaymentFields.push(`mixedPayment_${i}_tipo`);
        mixedPaymentFields.push(`mixedPayment_${i}_monto`);
        // Add remove button for payments beyond the first 2
        if (i >= 2) {
          mixedPaymentFields.push(`mixedPayment_${i}_remove`);
        }
      }
      // Add the "add payment" button if less than 4 payments
      if (paymentsCount < 4) {
        mixedPaymentFields.push('mixedPayment_add');
      }
    }
    
    // Add common end fields
    const endFields = ['estado', 'por'];
    if (formData.por === 'otro') {
      endFields.push('nombreOtro');
    }
    
    // Add action buttons at the end
    const buttonFields = ['guardar', 'limpiar', 'cancelar'];
    
    return [...baseFields, ...conditionalFields, ...mixedPaymentFields, ...endFields, ...buttonFields];
  }, []);

  // Handle keyboard navigation events
  const handleKeyboardNavigation = useCallback((currentField, event, formData, specificFieldsConfig) => {
    // SSR safety check
    if (typeof window === 'undefined') return;
    
    // Only prevent default behavior for arrows (not Enter)
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault();
      event.stopPropagation();
    }

    const fieldOrder = buildFieldOrder(formData, specificFieldsConfig);
    const currentIndex = fieldOrder.indexOf(currentField);

    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        // Enter opens the dropdown/menu of the current field
        openField(currentField);
        break;

      case 'ArrowDown':
      case 'ArrowRight':
        // Arrow down/right goes to next field
        if (currentIndex < fieldOrder.length - 1) {
          const nextField = fieldOrder[currentIndex + 1];
          focusField(nextField);
        }
        break;

      case 'ArrowUp':
      case 'ArrowLeft':
        // Arrow up/left goes to previous field
        if (currentIndex > 0) {
          const prevField = fieldOrder[currentIndex - 1];
          focusField(prevField);
        }
        break;

      default:
        // For other keys, normal behavior
        break;
    }
  }, [buildFieldOrder, focusField, openField]);

  // Handle modal navigation (separate from main form navigation)
  const handleModalNavigation = useCallback((currentField, event) => {
    // SSR safety check
    if (typeof window === 'undefined') return;
    
    const fieldOrder = ['nombre', 'apellido', 'telefono', 'email', 'dni', 'direccion', 'tipo', 'guardar', 'cancelar'];
    const currentIndex = fieldOrder.indexOf(currentField);

    // Prevent default behavior
    if (['Enter', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault();
      event.stopPropagation();
    }

    switch (event.key) {
      case 'Enter':
        // For buttons, click them; for other fields, move to next
        const fieldRef = fieldRefs.current[currentField];
        if (fieldRef && fieldRef.tagName === 'BUTTON') {
          fieldRef.click();
        } else if (currentIndex < fieldOrder.length - 1) {
          const nextField = fieldOrder[currentIndex + 1];
          focusField(nextField);
        }
        break;

      case 'ArrowDown':
      case 'ArrowRight':
        if (currentIndex < fieldOrder.length - 1) {
          const nextField = fieldOrder[currentIndex + 1];
          focusField(nextField);
        }
        break;

      case 'ArrowUp':
      case 'ArrowLeft':
        if (currentIndex > 0) {
          const prevField = fieldOrder[currentIndex - 1];
          focusField(prevField);
        }
        break;

      case 'Escape':
        // Close modal on escape
        break;

      default:
        break;
    }
  }, [focusField]);

  return {
    fieldRefs,
    registerField,
    focusField,
    openField,
    handleKeyboardNavigation,
    handleModalNavigation,
    buildFieldOrder
  };
};