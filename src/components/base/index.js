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
        {walletOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            ref={option.value === 'socio1_efectivo' ? ref : null}
            onClick={() => handleButtonClick(option.value, option.type)}
            onKeyDown={onKeyDown}
            className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
              isActive(option.value, option.type)
                ? 'bg-primary-500 text-white border-primary-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {option.label}
          </button>
        ))}
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
        {walletOptions.slice(0, 3).map((option) => (
          <button
            key={option.value}
            type="button"
            ref={option.value === 'socio1_efectivo' ? ref : null}
            onClick={() => handleButtonClick(option.value, option.type)}
            onKeyDown={onKeyDown}
            className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
              isActive(option.value, option.type)
                ? 'bg-primary-500 text-white border-primary-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {walletOptions.slice(3).map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleButtonClick(option.value, option.type)}
            onKeyDown={onKeyDown}
            className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
              isActive(option.value, option.type)
                ? 'bg-primary-500 text-white border-primary-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {option.label}
          </button>
        ))}
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