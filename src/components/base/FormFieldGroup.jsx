import React from 'react';
import FormInput from './FormInput.jsx';
import FormSelect from './FormSelect.jsx';

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

  // Grid classes for responsive layout
  const gridClasses = [
    'grid',
    gap,
    // Mobile: always single column
    'grid-cols-1',
    // Tablet and up: responsive columns based on field count
    gridCols >= 2 ? 'sm:grid-cols-2' : '',
    gridCols >= 3 ? 'lg:grid-cols-3' : '',
    gridCols >= 4 ? 'xl:grid-cols-4' : '',
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
      required,
      error: fieldError,
      readOnly: readOnly || calculated,
      ...fieldProps
    };

    // Render based on field type
    switch (type) {
      case 'select':
        return (
          <FormSelect
            {...commonProps}
            options={options}
            filterOptions={filterOptions}
            placeholder={placeholder || `Seleccionar ${label?.toLowerCase() || 'opción'}`}
          />
        );
      
      case 'date':
        return (
          <FormInput
            {...commonProps}
            type="date"
            showDayName={showDayName}
            placeholder={placeholder || 'dd/mm/aaaa'}
          />
        );
      
      case 'number':
        return (
          <FormInput
            {...commonProps}
            type="number"
            placeholder={placeholder || '0.00'}
          />
        );
      
      case 'email':
        return (
          <FormInput
            {...commonProps}
            type="email"
            placeholder={placeholder || 'ejemplo@correo.com'}
          />
        );
      
      case 'tel':
        return (
          <FormInput
            {...commonProps}
            type="tel"
            placeholder={placeholder || '+54 11 1234-5678'}
          />
        );
      
      case 'textarea':
        return (
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
        return (
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