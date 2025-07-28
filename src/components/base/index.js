import React from 'react';

// Base form components exports
export { default as FormInput } from './FormInput';
export { default as FormSelect } from './FormSelect';
export { default as FormFieldGroup } from './FormFieldGroup';
export { default as ClientSelect } from './ClientSelect';
export { default as ClientAutocomplete } from './ClientAutocomplete';
export { default as ClientModal } from './ClientModal';
export { default as MixedPaymentGroup } from './MixedPaymentGroup';

/**
 * Wallet Button Group Component
 * Renders wallet selection as buttons instead of dropdown
 */
export const WalletButtonGroup = React.forwardRef(({ 
  label, 
  value, 
  onChange, 
  onKeyDown,
  name,
  required = false 
}, ref) => {
  const handleButtonClick = (buttonValue, buttonType) => {
    let newValue = value || '';
    
    if (buttonType === 'socio') {
      // Si es socio, mantener el tipo actual o poner efectivo por defecto
      const currentType = newValue.includes('digital') ? 'digital' : 'efectivo';
      newValue = buttonValue.replace('_efectivo', `_${currentType}`);
    } else {
      // Si es tipo, mantener el socio actual o poner socio1 por defecto
      const currentSocio = newValue.includes('socio2') ? 'socio2' : 'socio1';
      newValue = `${currentSocio}_${buttonValue}`;
    }
    
    onChange(newValue);
  };

  const isActive = (buttonValue, buttonType) => {
    if (!value) return false;
    
    if (buttonType === 'socio') {
      return value.startsWith(buttonValue.replace('_efectivo', ''));
    } else {
      return value.endsWith(buttonValue);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          ref={ref}
          onClick={() => handleButtonClick('socio1_efectivo', 'socio')}
          onKeyDown={onKeyDown}
          className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
            isActive('socio1_efectivo', 'socio')
              ? 'bg-primary-500 text-white border-primary-500'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          Socio 1
        </button>
        <button
          type="button"
          onClick={() => handleButtonClick('socio2_efectivo', 'socio')}
          onKeyDown={onKeyDown}
          className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
            isActive('socio2_efectivo', 'socio')
              ? 'bg-primary-500 text-white border-primary-500'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          Socio 2
        </button>
        <button
          type="button"
          onClick={() => handleButtonClick('efectivo', 'type')}
          onKeyDown={onKeyDown}
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
          onKeyDown={onKeyDown}
          className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
            isActive('digital', 'type')
              ? 'bg-primary-500 text-white border-primary-500'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          Digital
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

/**
 * Wallet TC Button Group Component (includes mixed payment)
 */
export const WalletTCButtonGroup = React.forwardRef(({ 
  label, 
  value, 
  onChange, 
  onKeyDown,
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
      // Si es socio, mantener el tipo actual o poner efectivo por defecto
      const currentType = newValue.includes('digital') ? 'digital' : 'efectivo';
      newValue = buttonValue.replace('_efectivo', `_${currentType}`);
    } else {
      // Si es tipo, mantener el socio actual o poner socio1 por defecto
      const currentSocio = newValue.includes('socio2') ? 'socio2' : 'socio1';
      newValue = `${currentSocio}_${buttonValue}`;
    }
    
    onChange(newValue);
  };

  const isActive = (buttonValue, buttonType) => {
    if (!value) return false;
    
    if (buttonType === 'special') {
      return value === buttonValue;
    }
    
    if (buttonType === 'socio') {
      return value.startsWith(buttonValue.replace('_efectivo', ''));
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
            onClick={() => handleButtonClick('socio1_efectivo', 'socio')}
            onKeyDown={onKeyDown}
            className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
              isActive('socio1_efectivo', 'socio')
                ? 'bg-primary-500 text-white border-primary-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Socio 1
          </button>
          <button
            type="button"
            onClick={() => handleButtonClick('socio2_efectivo', 'socio')}
            onKeyDown={onKeyDown}
            className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
              isActive('socio2_efectivo', 'socio')
                ? 'bg-primary-500 text-white border-primary-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Socio 2
          </button>
          <button
            type="button"
            onClick={() => handleButtonClick('efectivo', 'type')}
            onKeyDown={onKeyDown}
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
            onKeyDown={onKeyDown}
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
          onKeyDown={onKeyDown}
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

/**
 * Cuenta Button Group Component for Cuentas Corrientes
 * Layout: Socio 1, Socio 2, ALL (top row) + Digital, Efectivo (bottom row)
 */
export const CuentaButtonGroup = React.forwardRef(({ 
  value, 
  onChange, 
  onKeyDown, 
  label, 
  required = false,
  allowEfectivo = true,
  readOnly = false
}, ref) => {
  const handleButtonClick = (buttonValue) => {
    if (onChange && !readOnly) {
      onChange(buttonValue);
    }
  };

  const isActive = (buttonValue) => {
    return value === buttonValue;
  };

  const getButtonClasses = (buttonValue) => {
    return `px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
      isActive(buttonValue)
        ? 'bg-primary-500 text-white border-primary-500'
        : readOnly 
          ? 'bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed'
          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
    }`;
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="space-y-2">
        {/* Primera fila: Socio 1, Socio 2, ALL */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            ref={ref}
            onClick={() => handleButtonClick('socio1')}
            onKeyDown={onKeyDown}
            className={getButtonClasses('socio1')}
            disabled={readOnly}
          >
            Socio 1
          </button>
          <button
            type="button"
            onClick={() => handleButtonClick('socio2')}
            onKeyDown={onKeyDown}
            className={getButtonClasses('socio2')}
            disabled={readOnly}
          >
            Socio 2
          </button>
          <button
            type="button"
            onClick={() => handleButtonClick('ALL')}
            onKeyDown={onKeyDown}
            className={getButtonClasses('ALL')}
            disabled={readOnly}
          >
            ALL
          </button>
        </div>
        
        {/* Segunda fila: Digital, Efectivo */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleButtonClick('digital')}
            onKeyDown={onKeyDown}
            className={getButtonClasses('digital')}
            disabled={readOnly}
          >
            Digital
          </button>
          {allowEfectivo && (
            <button
              type="button"
              onClick={() => handleButtonClick('efectivo')}
              onKeyDown={onKeyDown}
              className={getButtonClasses('efectivo')}
              disabled={readOnly}
            >
              Efectivo
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

// Re-export utility functions from other modules for convenience
export { formatAmountWithCurrency } from '../../utils/formatters';
export { 
  monedas, 
  cuentas, 
  socios, 
  estados, 
  proveedoresCC, 
  operaciones,
  tiposPago,
  prioridades,
  periodos,
  walletTypes,
  walletTypesTC
} from '../../config/constants';
export { 
  specificFieldsConfig, 
  getFieldConfig, 
  validateFieldConfig 
} from '../../config/fieldConfigs';