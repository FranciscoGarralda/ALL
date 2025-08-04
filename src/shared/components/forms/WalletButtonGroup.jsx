import React from 'react';

/**
 * Wallet Button Group Component
 * Renders wallet selection as buttons instead of dropdown
 */
export const WalletButtonGroup = React.forwardRef(({ 
  label, 
  value, 
  onChange, 

  name,
  required = false 
}, ref) => {
  const handleButtonClick = (buttonValue, buttonType) => {
    let newValue = value || '';
    
    if (buttonType === 'socio') {
      // NO auto-seleccionar tipo - solo seleccionar el socio
      const socioName = buttonValue.replace('_efectivo', '');
      newValue = socioName;
    } else {
      // Si es tipo, mantener el socio actual SOLO si ya hay uno seleccionado
      if (newValue && (newValue.includes('socio1') || newValue.includes('socio2') || newValue.includes('all'))) {
        const currentSocio = newValue.includes('socio2') ? 'socio2' : 
                            newValue.includes('all') ? 'all' : 'socio1';
        newValue = `${currentSocio}_${buttonValue}`;
      } else {
        // Si no hay valor o no hay socio seleccionado, no hacer nada
        return;
      }
    }
    
    onChange(newValue);
  };

  const isActive = (buttonValue, buttonType) => {
    if (!value) return false;
    
    if (buttonType === 'socio') {
      return value.startsWith(buttonValue);
    } else {
      return value.endsWith(buttonValue);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
              <div className="grid grid-cols-2 gap-3">
        {/* Primera fila: Socio 1, Socio 2 */}
        <button
          type="button"
          ref={ref}
          onClick={() => handleButtonClick('socio1', 'socio')}
          className={`px-4 py-2.5 text-sm font-medium flex items-center justify-center rounded-lg border transition-colors ${
            isActive('socio1', 'socio')
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-indigo-50 hover:border-gray-300'
          }`}
        >
          Socio 1
        </button>
        <button
          type="button"
          onClick={() => handleButtonClick('socio2', 'socio')}
          className={`px-4 py-2.5 text-sm font-medium flex items-center justify-center rounded-lg border transition-colors ${
            isActive('socio2', 'socio')
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-indigo-50 hover:border-gray-300'
          }`}
        >
          Socio 2
        </button>
        
        {/* Segunda fila: ALL, Efectivo/Digital combinado */}
        <button
          type="button"
          onClick={() => handleButtonClick('all', 'socio')}
          className={`px-4 py-2.5 text-sm font-medium flex items-center justify-center rounded-lg border transition-colors ${
            isActive('all', 'socio')
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-indigo-50 hover:border-gray-300'
          }`}
        >
          ALL
        </button>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleButtonClick('efectivo', 'type')}
            className={`px-4 py-2.5 text-sm font-medium flex items-center justify-center rounded-lg border transition-colors ${
              isActive('efectivo', 'type')
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-indigo-50 hover:border-gray-300'
            }`}
          >
            Efectivo
          </button>
          <button
            type="button"
            onClick={() => handleButtonClick('digital', 'type')}
            className={`px-4 py-2.5 text-sm font-medium flex items-center justify-center rounded-lg border transition-colors ${
              isActive('digital', 'type')
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-indigo-50 hover:border-gray-300'
            }`}
          >
            Digital
          </button>
        </div>
      </div>
      <input
        type="hidden"
        name={name}
        value={value || ''}
      />
    </div>
  );
});

WalletButtonGroup.displayName = 'WalletButtonGroup';

export default WalletButtonGroup;