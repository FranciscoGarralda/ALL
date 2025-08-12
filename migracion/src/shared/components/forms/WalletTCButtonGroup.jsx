import React from 'react';

/**
 * Wallet TC Button Group Component (includes mixed payment)
 */
export const WalletTCButtonGroup = React.forwardRef(({ 
  label, 
  value, 
  onChange, 

  name,
  required = false 
}, ref) => {
  const handleButtonClick = (buttonValue, buttonType) => {
    if (buttonType === 'special') {
      // Si ya está seleccionado pago_mixto y clickean de nuevo, deseleccionar
      if (value === 'pago_mixto' && buttonValue === 'pago_mixto') {
        onChange('');
      } else {
        onChange(buttonValue);
      }
      return;
    }
    
    // Si pago_mixto está seleccionado, no permitir seleccionar otros botones
    if (value === 'pago_mixto') {
      return;
    }

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
    
    if (buttonType === 'special') {
      return value === buttonValue;
    }
    
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
      <div className="space-y-2">
        {/* Primera fila: Socio 1, Socio 2, ALL */}
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            ref={ref}
            onClick={() => handleButtonClick('socio1', 'socio')}
            className={`px-4 py-2.5 text-sm font-medium flex items-center justify-center rounded-lg border transition-colors ${
              value === 'pago_mixto'
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50'
                : isActive('socio1', 'socio')
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            Socio 1
          </button>
          <button
            type="button"
            onClick={() => handleButtonClick('socio2', 'socio')}
            className={`px-4 py-2.5 text-sm font-medium flex items-center justify-center rounded-lg border transition-colors ${
              value === 'pago_mixto'
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50'
                : isActive('socio2', 'socio')
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            Socio 2
          </button>
          <button
            type="button"
            onClick={() => handleButtonClick('all', 'socio')}
            className={`px-4 py-2.5 text-sm font-medium flex items-center justify-center rounded-lg border transition-colors ${
              value === 'pago_mixto'
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50'
                : isActive('all', 'socio')
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            ALL
          </button>
        </div>
        
        {/* Segunda fila: Efectivo, Digital */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleButtonClick('efectivo', 'type')}
            className={`px-4 py-2.5 text-sm font-medium flex items-center justify-center rounded-lg border transition-colors ${
              value === 'pago_mixto'
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50'
                : isActive('efectivo', 'type')
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            Efectivo
          </button>
          <button
            type="button"
            onClick={() => handleButtonClick('digital', 'type')}
            className={`px-4 py-2.5 text-sm font-medium flex items-center justify-center rounded-lg border transition-colors ${
              value === 'pago_mixto'
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50'
                : isActive('digital', 'type')
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            Digital
          </button>
        </div>
        
        {/* Tercera fila: Pago Mixto */}
        <div className="grid grid-cols-1">
          <button
            type="button"
            onClick={() => handleButtonClick('pago_mixto', 'special')}
            className={`px-4 py-2.5 text-sm font-medium flex items-center justify-center rounded-lg border transition-colors ${
              isActive('pago_mixto', 'special')
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            Pago Mixto
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

WalletTCButtonGroup.displayName = 'WalletTCButtonGroup';

export default WalletTCButtonGroup;