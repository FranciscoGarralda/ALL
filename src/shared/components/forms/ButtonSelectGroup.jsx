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
  className = '',
  hideLabel = false // Nueva prop para ocultar el label
}) => {
  const handleButtonClick = (optionValue) => {
    if (!readOnly) {
      onChange(optionValue);
    }
  };

  const getButtonClasses = (optionValue) => {
    const isActive = value === optionValue;
    const baseClasses = isMoneda 
      ? 'px-3 py-2 text-sm font-medium flex items-center justify-center rounded-lg border transition-all'
      : 'px-4 py-2.5 text-sm font-medium flex items-center justify-center rounded-lg border transition-all';
    
    return `${baseClasses} ${
      readOnly
        ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-50'
        : isActive
          ? 'bg-indigo-600 text-white border-indigo-600'
          : 'bg-white text-gray-600 border-gray-200 hover:bg-indigo-50 hover:border-gray-300'
    }`;
  };

  // Para monedas, usar flex en línea horizontal
  const isMoneda = name?.includes('moneda') || name?.includes('Moneda');
  
  // Si hay más de 6 opciones, usar grid de 3 columnas
  const getGridCols = () => {
    if (isMoneda) {
      // Para monedas, distribuir mejor según la cantidad
      if (options.length === 7) return 'grid-cols-4 sm:grid-cols-4'; // 4 arriba, 3 abajo
      if (options.length === 8) return 'grid-cols-4 sm:grid-cols-4'; // 4 y 4
      if (options.length === 6) return 'grid-cols-3 sm:grid-cols-3'; // 3 y 3
      if (options.length === 5) return 'grid-cols-3 sm:grid-cols-3'; // 3 arriba, 2 abajo
      return 'grid-cols-2 sm:grid-cols-4';
    }
    // Para operaciones (6 opciones), usar 3 columnas
    if (options.length === 6) return 'grid-cols-2 sm:grid-cols-3';
    return options.length > 6 ? 'grid-cols-3' : options.length > 3 ? 'grid-cols-2' : 'grid-cols-1';
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {label && !hideLabel && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className={`grid ${getGridCols()} gap-2`}>
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