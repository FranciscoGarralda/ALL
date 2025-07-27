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
  const walletOptions = [
    { value: 'socio1_efectivo', label: 'Socio 1', type: 'socio' },
    { value: 'socio2_efectivo', label: 'Socio 2', type: 'socio' },
    { value: 'efectivo', label: 'Efectivo', type: 'type' },
    { value: 'digital', label: 'Digital', type: 'type' }
  ];

  const handleButtonClick = (buttonValue) => {
    onChange(buttonValue);
  };

  const isActive = (buttonValue) => {
    return value === buttonValue;
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
          onClick={() => handleButtonClick('socio1_efectivo')}
          onKeyDown={onKeyDown}
          className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
            isActive('socio1_efectivo')
              ? 'bg-primary-500 text-white border-primary-500'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          Socio 1 Efectivo
        </button>
        <button
          type="button"
          onClick={() => handleButtonClick('socio2_efectivo')}
          onKeyDown={onKeyDown}
          className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
            isActive('socio2_efectivo')
              ? 'bg-primary-500 text-white border-primary-500'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          Socio 2 Efectivo
        </button>
        <button
          type="button"
          onClick={() => handleButtonClick('socio1_digital')}
          onKeyDown={onKeyDown}
          className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
            isActive('socio1_digital')
              ? 'bg-primary-500 text-white border-primary-500'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          Socio 1 Digital
        </button>
        <button
          type="button"
          onClick={() => handleButtonClick('socio2_digital')}
          onKeyDown={onKeyDown}
          className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
            isActive('socio2_digital')
              ? 'bg-primary-500 text-white border-primary-500'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          Socio 2 Digital
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
  const walletOptions = [
    { value: 'socio1_efectivo', label: 'Socio 1', type: 'socio' },
    { value: 'socio2_efectivo', label: 'Socio 2', type: 'socio' },
    { value: 'efectivo', label: 'Efectivo', type: 'type' },
    { value: 'digital', label: 'Digital', type: 'type' },
    { value: 'pago_mixto', label: 'Pago Mixto', type: 'special' }
  ];

  const handleButtonClick = (buttonValue) => {
    onChange(buttonValue);
  };

  const isActive = (buttonValue) => {
    return value === buttonValue;
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
            onClick={() => handleButtonClick('socio1_efectivo')}
            onKeyDown={onKeyDown}
            className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
              isActive('socio1_efectivo')
                ? 'bg-primary-500 text-white border-primary-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Socio 1 Efectivo
          </button>
          <button
            type="button"
            onClick={() => handleButtonClick('socio2_efectivo')}
            onKeyDown={onKeyDown}
            className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
              isActive('socio2_efectivo')
                ? 'bg-primary-500 text-white border-primary-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Socio 2 Efectivo
          </button>
          <button
            type="button"
            onClick={() => handleButtonClick('socio1_digital')}
            onKeyDown={onKeyDown}
            className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
              isActive('socio1_digital')
                ? 'bg-primary-500 text-white border-primary-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Socio 1 Digital
          </button>
          <button
            type="button"
            onClick={() => handleButtonClick('socio2_digital')}
            onKeyDown={onKeyDown}
            className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
              isActive('socio2_digital')
                ? 'bg-primary-500 text-white border-primary-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Socio 2 Digital
          </button>
        </div>
        <button
          type="button"
          onClick={() => handleButtonClick('pago_mixto')}
          onKeyDown={onKeyDown}
          className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors h-full ${
            isActive('pago_mixto')
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