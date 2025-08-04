import React from 'react';

const ButtonSelectGroup = ({
  label,
  value,
  onChange,
  options = [],
  name,
  required = false,
  error = '',
  readOnly = false,
  className = ''
}) => {
  const handleButtonClick = (optionValue) => {
    if (!readOnly) {
      onChange(optionValue);
    }
  };

  const getButtonClasses = (optionValue) => {
    const isActive = value === optionValue;
    const baseClasses = isMoneda 
      ? 'px-3 py-2 text-sm font-medium flex items-center justify-center rounded-lg border transition-all flex-1'
      : 'px-4 py-2.5 text-sm font-medium flex items-center justify-center rounded-lg border transition-all';
    
    return `${baseClasses} ${
      readOnly
        ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-50'
        : isActive
          ? 'bg-gray-900 text-white border-gray-900'
          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
    }`;
  };

  // Para monedas, usar flex en línea horizontal
  const isMoneda = name?.includes('moneda') || name?.includes('Moneda');
  
  // Si hay más de 6 opciones, usar grid de 3 columnas
  const gridCols = options.length > 6 ? 'grid-cols-3' : options.length > 3 ? 'grid-cols-2' : 'grid-cols-1';

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className={isMoneda ? 'flex gap-2 justify-start' : `grid ${gridCols} gap-2`}>
        {options.map((option) => {
          const optionValue = typeof option === 'object' ? option.value : option;
          const optionLabel = typeof option === 'object' ? option.label : option;
          
          return (
            <button
              key={optionValue}
              type="button"
              onClick={() => handleButtonClick(optionValue)}
              className={getButtonClasses(optionValue)}
              disabled={readOnly}
            >
              {optionLabel}
            </button>
          );
        })}
      </div>
      
      {error && (
        <p className="text-xs text-red-600 mt-2">
          {error}
        </p>
      )}
      
      <input
        type="hidden"
        name={name}
        value={value || ''}
      />
    </div>
  );
};

export default ButtonSelectGroup;