import React from 'react';
import FormInput from './FormInput.jsx';
import FormSelect from './FormSelect.jsx';
import ClientSelect from './ClientSelect.jsx';
import CurrencyInput from './CurrencyInput.jsx';
import { WalletButtonGroup, WalletTCButtonGroup, CuentaButtonGroup } from './index.js';

/**
 * Form field group component that organizes related fields in responsive layouts
 * @param {Object} props - Component properties
 * @param {Array} props.fields - Array of field configuration objects
 * @param {Object} props.formData - Current form data values
 * @param {Function} props.onFieldChange - Field change handler
 * @param {Object} props.errors - Field validation errors
 * @param {string} props.className - Additional CSS classes
 * @param {number} props.columns - Number of columns for desktop layout
 * @param {string} props.gap - Gap between fields
 */
const FormFieldGroup = ({
  fields = [],
  formData = {},
  onFieldChange,
  errors = {},
  className = '',
  columns = null,
  gap = 'gap-4',
  onKeyDown,
  ...rest
}) => {
  // Calculate responsive grid columns based on field count and explicit columns prop
  const getGridColumns = () => {
    if (columns) return columns;
    
    const fieldCount = fields.length;
    if (fieldCount === 1) return 1;
    if (fieldCount === 2) return 2;
    if (fieldCount === 3) return 3;
    return Math.min(fieldCount, 4); // Max 4 columns
  };

  const gridCols = getGridColumns();

  // Grid classes for responsive layout - Always use 2 columns for COMPRA layout
  const gridClasses = [
    'grid',
    'grid-cols-2',
    gap,
    className
  ].filter(Boolean).join(' ');

  // Handle field value change
  const handleFieldChange = (fieldName, value) => {
    if (onFieldChange) {
      onFieldChange(fieldName, value);
    }
  };

  // Render individual field based on type
  const renderField = (field, index) => {
    const {
      type = 'text',
      name,
      label,
      placeholder,
      options = [],
      required = false,
      readOnly = false,
      showDayName = false,
      calculated = false,
      filterOptions,
      gridCols = '',
      ref,
      ...fieldProps
    } = field;

    const fieldValue = formData[name] || '';
    const fieldError = errors[name] || '';

    // Common props for all field types
    const commonProps = {
      key: name || index,
      name,
      label,
      value: fieldValue,
      onChange: (value) => handleFieldChange(name, value),
      onKeyDown: onKeyDown ? (e) => onKeyDown(name, e) : undefined,
      required,
      error: fieldError,
      readOnly: readOnly || calculated,
      ref,
      ...fieldProps
    };

    // Wrapper div with grid column classes
    const fieldWrapper = (content) => (
      <div className={gridCols || ''}>
        {content}
      </div>
    );

    // Render based on field type
    switch (type) {
      case 'client-select':
        return fieldWrapper(
          <ClientSelect
            {...commonProps}
            clients={[]}
            placeholder={placeholder || 'Seleccionar cliente'}
            onClientCreated={(newClient) => {
              // Handle client creation
            }}
          />
        );

      case 'select':
        return fieldWrapper(
          <FormSelect
            {...commonProps}
            options={options}
            filterOptions={filterOptions}
            placeholder={placeholder || `Seleccionar ${label?.toLowerCase() || 'opción'}`}
          />
        );
      
      case 'date':
        return fieldWrapper(
          <FormInput
            {...commonProps}
            type="date"
            showDayName={showDayName}
            placeholder={placeholder || 'dd/mm/aaaa'}
          />
        );
      
      case 'wallet-buttons':
        return fieldWrapper(
          <WalletButtonGroup
            {...commonProps}
          />
        );

      case 'wallet-tc-buttons':
        return fieldWrapper(
          <WalletTCButtonGroup
            {...commonProps}
          />
        );

      case 'cuenta-buttons':
        return fieldWrapper(
          <CuentaButtonGroup
            {...commonProps}
            allowEfectivo={fieldProps.allowEfectivo !== false}
          />
        );

      case 'number':
        // Check if it's a time/quantity/percentage field (not currency)
        if (name && ['lapso', 'interes'].includes(name)) {
          return fieldWrapper(
            <FormInput
              {...commonProps}
              type="number"
              placeholder={placeholder || '0'}
            />
          );
        }
        // All other numeric fields get currency formatting
        return fieldWrapper(
          <CurrencyInput
            {...commonProps}
            currency="PESO"
            placeholder={placeholder || '$0'}
          />
        );

      case 'currency':
        return fieldWrapper(
          <CurrencyInput
            {...commonProps}
            currency={fieldProps.currency || 'PESO'}
            placeholder={placeholder || '$0'}
          />
        );
      
      case 'email':
        return fieldWrapper(
          <FormInput
            {...commonProps}
            type="email"
            placeholder={placeholder || 'ejemplo@correo.com'}
          />
        );
      
      case 'tel':
        return fieldWrapper(
          <FormInput
            {...commonProps}
            type="tel"
            placeholder={placeholder || '+54 11 1234-5678'}
          />
        );
      
      case 'textarea':
        return fieldWrapper(
          <div key={name || index} className="space-y-1">
            {label && (
              <label 
                htmlFor={name}
                className="block text-xs sm:text-sm font-medium text-gray-700"
              >
                {label}
                {required && <span className="text-error-500 ml-1">*</span>}
              </label>
            )}
            <textarea
              id={name}
              name={name}
              value={fieldValue}
              onChange={(e) => handleFieldChange(name, e.target.value)}
              placeholder={placeholder}
              readOnly={readOnly || calculated}
              required={required}
              rows={3}
              className={[
                'w-full px-3 py-2 text-sm border rounded-lg transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                'placeholder:text-gray-400 resize-vertical min-h-[80px]',
                'sm:px-4 sm:py-2.5',
                readOnly || calculated
                  ? 'bg-gray-50 text-gray-600 cursor-not-allowed border-gray-200'
                  : 'bg-white text-gray-900 border-gray-300 hover:border-gray-400',
                fieldError
                  ? 'border-error-500 focus:ring-error-500'
                  : ''
              ].filter(Boolean).join(' ')}
              {...fieldProps}
            />
            {fieldError && (
              <p className="text-xs text-error-600 mt-1 flex items-center">
                <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {fieldError}
              </p>
            )}
          </div>
        );
      
      default:
        return fieldWrapper(
          <FormInput
            {...commonProps}
            type={type}
            placeholder={placeholder}
          />
        );
    }
  };

  // Don't render if no fields
  if (!fields || fields.length === 0) {
    return null;
  }

  return (
    <div className={gridClasses} {...rest}>
      {fields.map((field, index) => renderField(field, index))}
    </div>
  );
};

export default FormFieldGroup;