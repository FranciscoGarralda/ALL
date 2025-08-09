import React from 'react';

const SubOperationButtons = ({
  value,
  onChange,
  options = [],
  name,
  required = false,
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
    return `px-4 py-2.5 text-sm font-medium flex items-center justify-center rounded-lg border transition-all flex-1 ${
      readOnly
        ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-50'
        : isActive
          ? 'bg-gray-900 text-white border-gray-900'
          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
    }`;
  };

  // Determinar el número de columnas según la cantidad de opciones
  const getGridCols = () => {
    if (!options || !Array.isArray(options)) return 'grid-cols-1';
    if (options.length === 1) return 'grid-cols-1';
    if (options.length === 2) return 'grid-cols-2';
    if (options.length === 3) return 'grid-cols-3';
    if (options.length === 4) return 'grid-cols-2'; // 2x2 para 4 opciones
    return 'grid-cols-3'; // Por defecto
  };

  return (
    <div className={`${className}`}>
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
      
      <input
        type="hidden"
        name={name}
        value={value || ''}
      />
    </div>
  );
};

export default SubOperationButtons;