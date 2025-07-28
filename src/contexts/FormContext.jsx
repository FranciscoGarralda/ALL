import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { useMixedPayments } from '../shared/hooks/useMixedPayments';
import { useKeyboardNavigation } from '../shared/hooks/useKeyboardNavigation';

// Action types for form reducer
const FORM_ACTIONS = {
  SET_FIELD: 'SET_FIELD',
  SET_MULTIPLE_FIELDS: 'SET_MULTIPLE_FIELDS',
  RESET_FORM: 'RESET_FORM',
  LOAD_INITIAL_DATA: 'LOAD_INITIAL_DATA',
  CALCULATE_TOTAL: 'CALCULATE_TOTAL',
  VALIDATE_FORM: 'VALIDATE_FORM'
};

// Initial form state
const initialFormState = {
  // Client and basic info
  cliente: '',
  fecha: '',
  nombreDia: '',
  detalle: '',
  
  // Operation details
  operacion: '',
  subOperacion: '',
  proveedorCC: '',
  
  // Financial data
  monto: '',
  moneda: '',
  cuenta: '',
  total: '',
  
  // Exchange rates
  tc: '',
  monedaTC: '',
  monedaTCCmpra: '',
  monedaTCVenta: '',
  monedaVenta: '',
  tcVenta: '',
  
  // Fees and interest
  comision: '',
  monedaComision: '',
  cuentaComision: '',
  interes: '',
  lapso: '',
  fechaLimite: '',
  
  // Partners and accounts
  socioSeleccionado: '',
  totalCompra: '',
  totalVenta: '',
  montoVenta: '',
  cuentaSalida: '',
  cuentaIngreso: '',
  
  // Status and assignment
  estado: '',
  por: '',
  nombreOtro: '',
  
  // Mixed payment system
  mixedPayments: [],
  expectedTotalForMixedPayments: '',
  
  // Validation and UI state
  errors: {},
  isValid: true,
  isSubmitting: false,
  isDirty: false
};

// Form reducer for complex state management
const formReducer = (state, action) => {
  switch (action.type) {
    case FORM_ACTIONS.SET_FIELD:
      return {
        ...state,
        [action.field]: action.value,
        isDirty: true,
        errors: {
          ...state.errors,
          [action.field]: null // Clear field error when value changes
        }
      };
      
    case FORM_ACTIONS.SET_MULTIPLE_FIELDS:
      return {
        ...state,
        ...action.fields,
        isDirty: true
      };
      
    case FORM_ACTIONS.RESET_FORM:
      return {
        ...initialFormState,
        ...action.keepFields // Allow keeping certain fields
      };
      
    case FORM_ACTIONS.LOAD_INITIAL_DATA:
      return {
        ...state,
        ...action.data,
        isDirty: false
      };
      
    case FORM_ACTIONS.CALCULATE_TOTAL:
      const { monto, tc } = state;
      const calculatedTotal = (parseFloat(monto) || 0) * (parseFloat(tc) || 1);
      return {
        ...state,
        total: calculatedTotal.toFixed(2)
      };
      
    case FORM_ACTIONS.VALIDATE_FORM:
      const errors = {};
      let isValid = true;
      
      // Basic validation rules
      if (!state.operacion) {
        errors.operacion = 'Operación requerida';
        isValid = false;
      }
      
      if (!state.subOperacion) {
        errors.subOperacion = 'Detalle de operación requerido';
        isValid = false;
      }
      
      if (!state.monto) {
        errors.monto = 'Monto requerido';
        isValid = false;
      }
      
      return {
        ...state,
        errors,
        isValid
      };
      
    default:
      return state;
  }
};

// Form Context
const FormContext = createContext(null);

// Form Provider Component
export const FormProvider = ({ children, initialData = {}, onSave, onCancel, clients = [], onSaveClient }) => {
  const [formState, dispatch] = useReducer(formReducer, {
    ...initialFormState,
    ...initialData
  });
  
  // Integrate existing hooks
  const mixedPayments = useMixedPayments(formState, (newState) => {
    dispatch({ type: FORM_ACTIONS.SET_MULTIPLE_FIELDS, fields: newState });
  });
  
  const keyboardNavigation = useKeyboardNavigation();
  
  // Form actions
  const setField = useCallback((field, value) => {
    dispatch({ type: FORM_ACTIONS.SET_FIELD, field, value });
  }, []);
  
  const setMultipleFields = useCallback((fields) => {
    dispatch({ type: FORM_ACTIONS.SET_MULTIPLE_FIELDS, fields });
  }, []);
  
  const resetForm = useCallback((keepFields = {}) => {
    dispatch({ type: FORM_ACTIONS.RESET_FORM, keepFields });
  }, []);
  
  const validateForm = useCallback(() => {
    dispatch({ type: FORM_ACTIONS.VALIDATE_FORM });
    return formState.isValid;
  }, [formState.isValid]);
  
  const calculateTotal = useCallback(() => {
    dispatch({ type: FORM_ACTIONS.CALCULATE_TOTAL });
  }, []);
  
  // Save handler with validation
  const handleSave = useCallback(async () => {
    dispatch({ type: FORM_ACTIONS.VALIDATE_FORM });
    
    if (!formState.isValid) {
      return false;
    }
    
    dispatch({ type: FORM_ACTIONS.SET_FIELD, field: 'isSubmitting', value: true });
    
    try {
      if (onSave) {
        await onSave(formState);
        return true;
      }
    } catch (error) {
      console.error('Error saving form:', error);
      return false;
    } finally {
      dispatch({ type: FORM_ACTIONS.SET_FIELD, field: 'isSubmitting', value: false });
    }
    
    return false;
  }, [formState, onSave]);
  
  // Context value
  const contextValue = {
    // State
    formState,
    
    // Actions
    setField,
    setMultipleFields,
    resetForm,
    validateForm,
    calculateTotal,
    handleSave,
    
    // Integrated hooks
    mixedPayments,
    keyboardNavigation,
    
    // External props
    clients,
    onSaveClient,
    onCancel,
    
    // Computed properties
    isDirty: formState.isDirty,
    isValid: formState.isValid,
    isSubmitting: formState.isSubmitting,
    hasErrors: Object.keys(formState.errors).length > 0
  };
  
  return (
    <FormContext.Provider value={contextValue}>
      {children}
    </FormContext.Provider>
  );
};

// Custom hook to use form context
export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
};

// Export action types for external use
export { FORM_ACTIONS };