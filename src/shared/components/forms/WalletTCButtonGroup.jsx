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
      onChange(buttonValue);
      return;
    }

    let newValue = value || '';
    
    if (buttonType === 'socio') {
      // NO auto-seleccionar tipo - solo seleccionar el socio
      const socioName = buttonValue.replace('_efectivo', '');
      newValue = socioName;
    } else {
      // Si es tipo, mantener el socio actual SOLO si ya hay uno seleccionado
      if (newValue && (newValue.includes('socio1') || newValue.includes('socio2'))) {
        const currentSocio = newValue.includes('socio2') ? 'socio2' : 'socio1';
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
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="grid grid-cols-3 gap-2">
        <div className="grid grid-cols-2 gap-2 col-span-2">
          <button
            type="button"
            ref={ref}
            onClick={() => handleButtonClick('socio1', 'socio')}
            
            className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
              isActive('socio1', 'socio')
                ? 'bg-primary-500 text-white border-primary-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Socio 1
          </button>
          <button
            type="button"
            onClick={() => handleButtonClick('socio2', 'socio')}
            
            className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
              isActive('socio2', 'socio')
                ? 'bg-primary-500 text-white border-primary-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Socio 2
          </button>
          <button
            type="button"
            onClick={() => handleButtonClick('efectivo', 'type')}
            
            className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
              isActive('efectivo', 'type')
                ? 'bg-primary-500 text-white border-primary-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Efectivo
          </button>
          <button
            type="button"
            onClick={() => handleButtonClick('digital', 'type')}
            
            className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
              isActive('digital', 'type')
                ? 'bg-primary-500 text-white border-primary-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Digital
          </button>
        </div>
        <button
          type="button"
          onClick={() => handleButtonClick('pago_mixto', 'special')}
          
          className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors h-full ${
            isActive('pago_mixto', 'special')
              ? 'bg-primary-500 text-white border-primary-500'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          Pago Mixto
        </button>
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