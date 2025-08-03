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
    let newValue = e.target.value;
    
    // For number inputs, convert comma to dot for decimal separator
    if (type === 'number') {
      // Replace comma with dot for decimal input
      newValue = newValue.replace(',', '.');
      onChange(newValue === '' ? '' : newValue);
    } else {
      onChange(newValue);
    }
  };

  // Input classes with responsive design and states
  const inputClasses = [
    // Base classes with improved styling
    'w-full px-4 py-3 text-sm sm:text-base font-medium',
    'border-2 rounded-xl transition-all duration-200',
    'placeholder-gray-500 focus:placeholder-gray-600',
    'focus:outline-none focus:ring-4 focus:ring-offset-0',
    // Modern background
    'bg-white hover:bg-gray-50 focus:bg-white',
    // Type-specific classes
    type === 'date' ? 'cursor-pointer' : '',
    type === 'number' ? 'text-right' : '',
    // State classes with better visual feedback
    error 
      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 text-red-900' 
      : 'border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-blue-500/20 text-gray-900',
    readOnly 
      ? 'bg-gray-100 cursor-not-allowed opacity-60 hover:bg-gray-100' 
      : '',
    // Padding adjustments for day name
    showDayName && calculatedDayName 
      ? 'pr-20 sm:pr-24' 
      : '',
    // Additional classes
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="space-y-3">
      {/* Label with better typography */}
      {label && (
        <label 
          htmlFor={name}
          className="block text-sm font-semibold text-gray-800 transition-colors duration-200"
        >
          {label}
          {required && <span className="text-red-600 ml-1 font-bold">*</span>}
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
          lang={type === 'number' ? 'en-US' : undefined}
          pattern={type === 'number' ? '[0-9]*[.]?[0-9]*' : undefined}
          className={inputClasses}
          {...inputProps}
          {...rest}
        />
        
        {/* Day Name Display with improved styling */}
        {showDayName && calculatedDayName && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <span className="text-xs text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 font-semibold shadow-sm">
              {calculatedDayName}
            </span>
          </div>
        )}
        
        {/* Read-only indicator with animation */}
        {readOnly && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <div className="w-2.5 h-2.5 bg-gray-500 rounded-full animate-pulse"></div>
          </div>
        )}
      </div>
      
      {/* Error message with slide animation */}
      {error && (
        <p className="text-sm font-medium text-red-600 mt-1.5 animate-fadeIn">
          {error}
        </p>
      )}
    </div>
  );
});

FormInput.displayName = 'FormInput';

export default FormInput;