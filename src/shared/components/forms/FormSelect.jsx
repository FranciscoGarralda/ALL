import React, { forwardRef, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Reusable form select component with responsive design and dynamic options
 * @param {Object} props - Component properties
 * @param {string} props.label - Select label text
 * @param {string} props.value - Selected value
 * @param {Function} props.onChange - Change handler function
 * @param {Array} props.options - Array of option objects with value and label
 * @param {string} props.name - Select name attribute
 * @param {boolean} props.required - Whether select is required
 * @param {string} props.error - Error message to display
 * @param {boolean} props.disabled - Whether select is disabled
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.placeholder - Placeholder text (shown as first option)
 * @param {Function} props.filterOptions - Function to filter options dynamically
 * @param {Object} props.selectProps - Additional select properties
 */
const FormSelect = forwardRef(({
  label,
  value,
  onChange,
  options = [],
  name,
  required = false,
  error = '',
  disabled = false,
  readOnly = false,
  className = '',
  placeholder = '',
  filterOptions = null,
  selectProps = {},
  onKeyDown,
  ...rest
}, ref) => {
  // Enhanced keyboard navigation handling
  const handleKeyDown = useCallback((e) => {
    // Pass through to parent onKeyDown handler
    if (onKeyDown) {
      onKeyDown(e);
    }
  }, [onKeyDown]);
  // Filter options if filter function is provided
  const filteredOptions = React.useMemo(() => {
    if (filterOptions && typeof filterOptions === 'function') {
      return filterOptions(options);
    }
    return options;
  }, [options, filterOptions]);

  // Handle change
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  // Select classes with responsive design and states
  const selectClasses = [
    'w-full px-3 py-2 text-base border rounded-lg transition-all duration-200 appearance-none',
    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
    'bg-white text-gray-900',
    // Responsive padding and font size (16px on mobile to prevent zoom)
    'sm:px-4 sm:py-2.5 sm:text-sm',
    // State-based styling
    disabled || readOnly
      ? 'bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200' 
      : 'border-gray-300 hover:border-gray-400 cursor-pointer',
    // Error state
    error 
      ? 'border-error-500 focus:ring-error-500' 
      : '',
    // Additional classes
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="space-y-1">
      {/* Label */}
      {label && (
        <label 
          htmlFor={name}
          className="block text-xs sm:text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      {/* Select Container */}
      <div className="relative">
        <select
          ref={ref}
          id={name}
          name={name}
          value={value || ''}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled || readOnly}
          required={required}
          className={selectClasses}
          {...selectProps}
          {...rest}
        >
          {/* Placeholder option */}
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          
          {/* Dynamic options */}
          {filteredOptions.map((option, index) => (
            <option 
              key={option.value || index} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Custom dropdown arrow */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
          <ChevronDown 
            className={`w-4 h-4 transition-colors duration-200 ${
              disabled ? 'text-gray-400' : 'text-gray-500'
            }`} 
          />
        </div>
      </div>
      

      
      {/* Error Message */}
      {error && (
        <p className="text-xs text-error-600 mt-1 flex items-center">
          <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      
      {/* No options message */}
      {filteredOptions.length === 0 && (
        <p className="text-xs text-warning-600 mt-1 flex items-center">
          <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          No hay opciones disponibles
        </p>
      )}
    </div>
  );
});

FormSelect.displayName = 'FormSelect';

export default FormSelect;