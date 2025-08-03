import React, { forwardRef } from 'react';
import { formatDateWithDay } from '../../services/formatters.js';

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
const FormInput = forwardRef(({
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
  onKeyDown,
  ...rest
}, ref) => {
  
  // Handle keyboard events
  const handleKeyDown = (e) => {
    // Para otros campos, comportamiento normal
    if (onKeyDown) {
      onKeyDown(e);
    }
  };
  // Calculate day name for date inputs
  const calculatedDayName = React.useMemo(() => {
    if (type === 'date' && value && showDayName) {
      try {
        // Handle date string in YYYY-MM-DD format to avoid timezone issues
        let date;
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
          const [year, month, day] = value.split('-').map(Number);
          date = new Date(year, month - 1, day); // month is 0-indexed
        } else {
          date = new Date(value);
        }
        
        if (!isNaN(date.getTime())) {
          // Get day name directly without using formatDateWithDay to avoid formatting issues
          const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
          return dayNames[date.getDay()];
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
    // Base classes with improved styling
    'w-full px-3 py-2.5 text-sm sm:text-base',
    'border rounded-lg transition-all duration-200',
    'placeholder-gray-400 focus:placeholder-gray-500',
    'focus:outline-none focus:ring-2 focus:ring-offset-1',
    // Modern background
    'bg-gray-50 focus:bg-white',
    // Type-specific classes
    type === 'date' ? 'cursor-pointer' : '',
    type === 'number' ? 'text-right' : '',
    // State classes with better visual feedback
    error 
      ? 'border-error-300 focus:border-error-500 focus:ring-error-500/20' 
      : 'border-gray-300 hover:border-gray-400 focus:border-primary-500 focus:ring-primary-500/20',
    readOnly 
      ? 'bg-gray-100 cursor-not-allowed opacity-75' 
      : '',
    // Padding adjustments for day name
    showDayName && calculatedDayName 
      ? 'pr-20 sm:pr-24' 
      : '',
    // Additional classes
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="space-y-1.5">
      {/* Label with better typography */}
      {label && (
        <label 
          htmlFor={name}
          className="block text-xs sm:text-sm font-medium text-gray-700 transition-colors duration-200"
        >
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      {/* Input Container with hover effect */}
      <div className="relative group">
        <input
          ref={ref}
          id={name}
          name={name}
          type={type}
          value={value || ''}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          readOnly={readOnly}
          required={required}
          step={type === 'number' ? '0.01' : undefined}
          inputMode={type === 'number' ? 'decimal' : undefined}
          className={inputClasses}
          {...inputProps}
          {...rest}
        />
        
        {/* Day Name Display with improved styling */}
        {showDayName && calculatedDayName && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200">
            <span className="text-xs text-gray-600 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md border border-gray-200 font-medium shadow-sm">
              {calculatedDayName}
            </span>
          </div>
        )}
        
        {/* Read-only indicator with animation */}
        {readOnly && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
          </div>
        )}
      </div>
      
      {/* Error message with slide animation */}
      {error && (
        <p className="text-xs text-error-600 mt-1 animate-fadeIn">
          {error}
        </p>
      )}
    </div>
  );
});

FormInput.displayName = 'FormInput';

export default FormInput;