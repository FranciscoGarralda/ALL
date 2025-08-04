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
  hideLabel = false, // Nueva prop para ocultar el label
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
    let inputValue = e.target.value;
    
    // Convert comma to dot for decimal input
    inputValue = inputValue.replace(',', '.');
    
    // If user clears the input
    if (inputValue === '') {
      setDisplayValue('');
      onChange('');
      return;
    }
    
    // Remove currency symbols and spaces for processing
    const cleanedInput = inputValue.replace(/[^\d.]/g, '');
    
    // If focused, allow raw input without immediate formatting
    if (isFocused) {
      setDisplayValue(cleanedInput);
      // Parse the raw value for the parent component
      onChange(cleanedInput);
    } else {
      // Format the input when not focused
      const { formatted, raw } = formatCurrencyInput(cleanedInput, currency);
      setDisplayValue(formatted);
      onChange(raw);
    }
  };

  // Handle focus
  const handleFocus = (e) => {
    setIsFocused(true);
    // When focused, show raw value for easier editing (only if not readOnly)
    if (value && !readOnly) {
      setDisplayValue(value);
    }
  };

  // Handle blur
  const handleBlur = (e) => {
    setIsFocused(false);
    // When blurred, show formatted value (only if not readOnly)
    if (value && value !== '' && !readOnly) {
      const { formatted } = formatCurrencyInput(value, currency);
      setDisplayValue(formatted);
    }
  };

  // Input classes
  const inputClasses = [
    'w-full px-4 py-3 text-sm sm:text-base font-medium border rounded-lg transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-0',
    'placeholder-gray-500 focus:placeholder-gray-600',
    'bg-white hover:bg-gray-50 focus:bg-white',
    'text-right', // Currency inputs are always right-aligned
    error 
      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 text-red-900' 
      : 'border-gray-200 hover:border-gray-300 focus:border-gray-500 focus:ring-gray-500/20 text-gray-900',
    readOnly 
      ? 'bg-gray-100 cursor-not-allowed opacity-60 hover:bg-gray-100' 
      : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={`space-y-3 ${className}`}>
      {label && !hideLabel && (
        <label 
          htmlFor={name}
          className="block text-sm font-medium text-gray-700"
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
        lang="en-US"
        pattern="[0-9]*[.]?[0-9]*"
        placeholder={placeholder}
        readOnly={readOnly}
        required={required}
        className={inputClasses}
        {...rest}
      />
      
      {/* Error message */}
      {error && (
        <p className="text-xs text-error-600 mt-2">
          {error}
        </p>
      )}
    </div>
  );
});

CurrencyInput.displayName = 'CurrencyInput';

export default CurrencyInput;