import React from 'react';
import { formatDateWithDay } from '../../utils/formatters.js';

/**
 * Reusable form input component with responsive design and date support
 * @param {Object} props - Component properties
 * @param {string} props.label - Input label text
 * @param {string|number} props.value - Input value
 * @param {Function} props.onChange - Change handler function
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.type - Input type (text, number, date, email, etc.)
 * @param {string} props.name - Input name attribute
 * @param {boolean} props.showDayName - Whether to show day name for date inputs
 * @param {string} props.dayName - Day name to display
 * @param {boolean} props.readOnly - Whether input is read-only
 * @param {boolean} props.required - Whether input is required
 * @param {string} props.error - Error message to display
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.inputProps - Additional input properties
 */
const FormInput = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  name,
  showDayName = false,
  dayName = '',
  readOnly = false,
  required = false,
  error = '',
  className = '',
  inputProps = {},
  ...rest
}) => {
  // Calculate day name for date inputs
  const calculatedDayName = React.useMemo(() => {
    if (type === 'date' && value && showDayName) {
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return formatDateWithDay(date, { showDay: true, format: '' }).split(',')[0];
        }
      } catch (e) {
        console.warn('Invalid date for day name calculation:', value);
      }
    }
    return dayName;
  }, [type, value, showDayName, dayName]);

  // Handle change with proper type conversion
  const handleChange = (e) => {
    const newValue = e.target.value;
    
    // For number inputs, convert to number or keep as string for empty values
    if (type === 'number') {
      onChange(newValue === '' ? '' : newValue);
    } else {
      onChange(newValue);
    }
  };

  // Input classes with responsive design and states
  const inputClasses = [
    'w-full px-3 py-2 text-base border rounded-lg transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
    'placeholder:text-gray-400',
    // Responsive padding and font size (16px on mobile to prevent zoom)
    'sm:px-4 sm:py-2.5 sm:text-sm',
    // State-based styling
    readOnly 
      ? 'bg-gray-50 text-gray-600 cursor-not-allowed border-gray-200' 
      : 'bg-white text-gray-900 border-gray-300 hover:border-gray-400',
    // Error state
    error 
      ? 'border-error-500 focus:ring-error-500' 
      : '',
    // Day name padding adjustment
    showDayName && calculatedDayName 
      ? 'pr-20 sm:pr-24' 
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
      
      {/* Input Container */}
      <div className="relative">
        <input
          id={name}
          name={name}
          type={type}
          value={value || ''}
          onChange={handleChange}
          placeholder={placeholder}
          readOnly={readOnly}
          required={required}
          step={type === 'number' ? '0.01' : undefined}
          className={inputClasses}
          {...inputProps}
          {...rest}
        />
        
        {/* Day Name Display */}
        {showDayName && calculatedDayName && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
            <span className="text-xs text-gray-500 bg-white px-1.5 py-0.5 rounded-md border border-gray-200 font-medium">
              {calculatedDayName}
            </span>
          </div>
        )}
        
        {/* Read-only indicator */}
        {readOnly && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          </div>
        )}
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
    </div>
  );
};

export default FormInput;