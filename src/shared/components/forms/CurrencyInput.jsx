import React, { useState, useEffect, forwardRef } from 'react';
import { formatCurrencyInput, parseCurrencyInput } from '../../services/formatters.js';

/**
 * Currency input component with real-time formatting
 * Formats numbers as user types: 1000000 -> $1.000.000
 */
const CurrencyInput = forwardRef(({
  label,
  value,
  onChange,
  currency = 'PESO',
  placeholder = '0',
  name,
  required = false,
  error = '',
  className = '',
  readOnly = false,

  ...rest
}, ref) => {
  const [displayValue, setDisplayValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Update display value when external value changes
  useEffect(() => {
    if (value && value !== '') {
      const { formatted } = formatCurrencyInput(value, currency);
      setDisplayValue(formatted);
    } else {
      setDisplayValue('');
    }
  }, [value, currency]);

  // Handle input change with real-time formatting
  const handleChange = (e) => {
    const inputValue = e.target.value;
    
    // If user clears the input
    if (inputValue === '') {
      setDisplayValue('');
      onChange('');
      return;
    }

    // While focused, allow more flexible input without immediate formatting
    if (isFocused) {
      // Just clean the input but don't format yet
      const cleanValue = inputValue.replace(/[^\d.,]/g, '');
      setDisplayValue(cleanValue);
      
      // Try to parse and send the raw value
      const rawValue = parseCurrencyInput(cleanValue);
      onChange(rawValue);
    } else {
      // Format the input when not focused
      const { formatted, raw } = formatCurrencyInput(inputValue, currency);
      
      // Update display
      setDisplayValue(formatted);
      
      // Send raw numeric value to parent
      onChange(raw);
    }
  };

  // Handle focus
  const handleFocus = (e) => {
    setIsFocused(true);
    // When focused, show raw value for easier editing (only if not readOnly)
    if (value && !readOnly) {
      // Convert formatted value back to editable format
      const rawValue = parseCurrencyInput(displayValue || value);
      setDisplayValue(rawValue);
    }
  };

  // Handle blur
  const handleBlur = (e) => {
    setIsFocused(false);
    // When blurred, show formatted value (only if not readOnly)
    if (value && value !== '' && !readOnly) {
      const { formatted } = formatCurrencyInput(value, currency);
      setDisplayValue(formatted);
    } else if (displayValue && !readOnly) {
      // Format whatever is currently in the display
      const { formatted, raw } = formatCurrencyInput(displayValue, currency);
      setDisplayValue(formatted);
      onChange(raw);
    }
  };

  // Input classes
  const inputClasses = [
    'w-full px-3 py-2 text-base border rounded-lg transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
    'placeholder:text-gray-400 sm:px-4 sm:py-2.5 sm:text-sm',
    readOnly 
      ? 'bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200' 
      : 'bg-white text-gray-900 border-gray-300 hover:border-gray-400',
    error 
      ? 'border-error-500 focus:ring-error-500' 
      : '',
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
      
      {/* Input */}
      <input
        ref={ref}
        id={name}
        name={name}
        type="text"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        inputMode="decimal"
        placeholder={placeholder}
        readOnly={readOnly}
        required={required}
        className={inputClasses}
        {...rest}
      />
      
      {/* Error message */}
      {error && (
        <p className="text-xs text-error-600 mt-1">
          {error}
        </p>
      )}
    </div>
  );
});

CurrencyInput.displayName = 'CurrencyInput';

export default CurrencyInput;