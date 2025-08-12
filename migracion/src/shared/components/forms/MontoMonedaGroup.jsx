import React from 'react';
import CurrencyInput from './CurrencyInput';
import ButtonSelectGroup from './ButtonSelectGroup';

const MontoMonedaGroup = ({
  montoValue,
  monedaValue,
  onMontoChange,
  onMonedaChange,
  montoName = 'monto',
  monedaName = 'moneda',
  monedaOptions = [],
  montoError = '',
  monedaError = '',
  montoRequired = true,
  monedaRequired = true,
  montoReadOnly = false,
  monedaReadOnly = false,
  montoPlaceholder = '0.00',
  className = ''
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Label compartido para Monto y Moneda */}
      <label className="block text-sm font-medium text-gray-700">
        Monto {montoRequired && <span className="text-red-500">*</span>}
      </label>
      
      {/* Input de monto */}
      <CurrencyInput
        name={montoName}
        value={montoValue}
        onChange={onMontoChange}
        placeholder={montoPlaceholder}
        required={montoRequired}
        error={montoError}
        readOnly={montoReadOnly}
        hideLabel={true} // No mostrar label en el input
      />
      
      {/* Botones de moneda debajo */}
      <ButtonSelectGroup
        name={monedaName}
        value={monedaValue}
        onChange={onMonedaChange}
        options={monedaOptions}
        required={monedaRequired}
        error={monedaError}
        readOnly={monedaReadOnly}
        hideLabel={true} // No mostrar label en los botones
      />
    </div>
  );
};

export default MontoMonedaGroup;