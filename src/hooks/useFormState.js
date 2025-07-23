import { useState, useCallback, useEffect, useMemo } from 'react';
import { getFieldConfig, validateFieldConfig } from '../config/fieldConfigs';
import { validationRules, errorMessages } from '../config/constants';

/**
 * Custom hook for managing form state with validation and automatic calculations
 * @param {string} operationType - Type of operation (COMPRA, VENTA, etc.)
 * @param {object} initialData - Initial form data
 * @param {object} options - Configuration options
 * @returns {object} Form state and handlers
 */
export const useFormState = (operationType, initialData = {}, options = {}) => {
  const {
    validateOnChange = true,
    calculateOnChange = true,
    prestamistaClients = null
  } = options;

  // Form data state
  const [formData, setFormData] = useState(initialData);
  
  // Validation errors state
  const [errors, setErrors] = useState({});
  
  // Loading state for async operations
  const [isLoading, setIsLoading] = useState(false);
  
  // Touched fields for better UX
  const [touchedFields, setTouchedFields] = useState({});

  // Get field configuration for the current operation type
  const fieldConfig = useMemo(() => {
    return getFieldConfig(operationType, formData, prestamistaClients);
  }, [operationType, formData, prestamistaClients]);

  // Automatic calculations based on field config
  const calculateFields = useCallback((data) => {
    if (!fieldConfig?.calculations || !calculateOnChange) {
      return data;
    }

    const calculatedData = { ...data };
    
    Object.entries(fieldConfig.calculations).forEach(([fieldName, calculationFn]) => {
      try {
        const calculatedValue = calculationFn(calculatedData);
        if (calculatedValue !== undefined && calculatedValue !== null) {
          calculatedData[fieldName] = calculatedValue;
        }
      } catch (error) {
        console.warn(`Calculation error for field ${fieldName}:`, error);
      }
    });

    return calculatedData;
  }, [fieldConfig, calculateOnChange]);

  // Validate individual field
  const validateField = useCallback((fieldName, value, allData = formData) => {
    if (!fieldConfig) return null;

    // Find field configuration
    const allFields = fieldConfig.groups.flat();
    const field = allFields.find(f => f.name === fieldName);
    
    if (!field) return null;

    // Required field validation
    if (field.required && (!value || value === '')) {
      return errorMessages.required;
    }

    // Type-specific validations
    switch (field.type) {
      case 'number':
        if (value && isNaN(parseFloat(value))) {
          return 'Debe ser un número válido';
        }
        if (field.min !== undefined && parseFloat(value) < field.min) {
          return `El valor debe ser mayor a ${field.min}`;
        }
        if (field.max !== undefined && parseFloat(value) > field.max) {
          return `El valor debe ser menor a ${field.max}`;
        }
        break;
      
      case 'email':
        if (value && !validationRules.email(value)) {
          return errorMessages.email;
        }
        break;
      
      case 'tel':
        if (value && !validationRules.phone(value)) {
          return errorMessages.phone;
        }
        break;
    }

    // Custom field validations
    if (field.validate && typeof field.validate === 'function') {
      const customError = field.validate(value, allData);
      if (customError) return customError;
    }

    return null;
  }, [fieldConfig, formData]);

  // Validate all fields
  const validateAllFields = useCallback((data = formData) => {
    if (!fieldConfig) return { isValid: true, errors: {} };

    const newErrors = {};
    const allFields = fieldConfig.groups.flat();

    // Validate each field
    allFields.forEach(field => {
      const error = validateField(field.name, data[field.name], data);
      if (error) {
        newErrors[field.name] = error;
      }
    });

    // Run configuration-level validations
    const configValidation = validateFieldConfig(data, operationType);
    if (!configValidation.isValid) {
      configValidation.errors.forEach(error => {
        newErrors._general = error;
      });
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    };
  }, [fieldConfig, formData, operationType, validateField]);

  // Update form field
  const updateField = useCallback((fieldName, value) => {
    setFormData(prevData => {
      const newData = { ...prevData, [fieldName]: value };
      
      // Apply calculations
      const calculatedData = calculateFields(newData);
      
      return calculatedData;
    });

    // Mark field as touched
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }));

    // Validate on change if enabled
    if (validateOnChange) {
      const error = validateField(fieldName, value);
      setErrors(prev => ({
        ...prev,
        [fieldName]: error || undefined
      }));
    }
  }, [calculateFields, validateOnChange, validateField]);

  // Update multiple fields at once
  const updateFields = useCallback((updates) => {
    setFormData(prevData => {
      const newData = { ...prevData, ...updates };
      return calculateFields(newData);
    });

    // Mark all updated fields as touched
    setTouchedFields(prev => ({
      ...prev,
      ...Object.keys(updates).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    }));

    // Validate updated fields if enabled
    if (validateOnChange) {
      const newErrors = { ...errors };
      Object.entries(updates).forEach(([fieldName, value]) => {
        const error = validateField(fieldName, value);
        if (error) {
          newErrors[fieldName] = error;
        } else {
          delete newErrors[fieldName];
        }
      });
      setErrors(newErrors);
    }
  }, [calculateFields, validateOnChange, validateField, errors]);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({});
    setTouchedFields({});
    setIsLoading(false);
  }, [initialData]);

  // Submit form with validation
  const submitForm = useCallback(async (onSubmit) => {
    if (!onSubmit) return;

    setIsLoading(true);
    
    try {
      // Validate all fields
      const validation = validateAllFields();
      
      if (!validation.isValid) {
        setErrors(validation.errors);
        setIsLoading(false);
        return { success: false, errors: validation.errors };
      }

      // Clear errors
      setErrors({});

      // Submit form
      const result = await onSubmit(formData);
      
      setIsLoading(false);
      return { success: true, data: result };
    } catch (error) {
      setIsLoading(false);
      console.error('Form submission error:', error);
      return { success: false, error: error.message };
    }
  }, [formData, validateAllFields]);

  // Check if form is valid
  const isFormValid = useMemo(() => {
    const validation = validateAllFields();
    return validation.isValid;
  }, [validateAllFields]);

  // Check if form has changes
  const hasChanges = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialData);
  }, [formData, initialData]);

  // Get field error
  const getFieldError = useCallback((fieldName) => {
    return touchedFields[fieldName] ? errors[fieldName] : undefined;
  }, [errors, touchedFields]);

  // Effect to recalculate when form data changes
  useEffect(() => {
    if (calculateOnChange) {
      const calculatedData = calculateFields(formData);
      if (JSON.stringify(calculatedData) !== JSON.stringify(formData)) {
        setFormData(calculatedData);
      }
    }
  }, [formData, calculateFields, calculateOnChange]);

  return {
    // State
    formData,
    errors,
    isLoading,
    touchedFields,
    fieldConfig,
    
    // Computed
    isFormValid,
    hasChanges,
    
    // Actions
    updateField,
    updateFields,
    resetForm,
    submitForm,
    validateAllFields,
    getFieldError,
    setIsLoading,
    
    // Utilities
    calculateFields
  };
};