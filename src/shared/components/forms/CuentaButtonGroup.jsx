import React from 'react';

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
  // Parseamos el valor para obtener socio y tipo
  const [socio, tipo] = (value || '').split('_');
  
  const handleSocioClick = (socioValue) => {
    if (onChange && !readOnly) {
      const newValue = tipo ? `${socioValue}_${tipo}` : socioValue;
      onChange(newValue);
    }
  };

  const handleTipoClick = (tipoValue) => {
    if (onChange && !readOnly) {
      const newValue = socio ? `${socio}_${tipoValue}` : tipoValue;
      onChange(newValue);
    }
  };

  const isSocioActive = (socioValue) => {
    return socio === socioValue;
  };

  const isTipoActive = (tipoValue) => {
    return tipo === tipoValue;
  };

  const getSocioButtonClasses = (socioValue) => {
    return `px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
      isSocioActive(socioValue)
        ? 'bg-primary-500 text-white border-primary-500'
        : readOnly 
          ? 'bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed'
          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
    }`;
  };

  const getTipoButtonClasses = (tipoValue) => {
    return `px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
      isTipoActive(tipoValue)
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
            onClick={() => handleSocioClick('socio1')}
            onKeyDown={onKeyDown}
            className={getSocioButtonClasses('socio1')}
            disabled={readOnly}
          >
            Socio 1
          </button>
          <button
            type="button"
            onClick={() => handleSocioClick('socio2')}
            onKeyDown={onKeyDown}
            className={getSocioButtonClasses('socio2')}
            disabled={readOnly}
          >
            Socio 2
          </button>
          <button
            type="button"
            onClick={() => handleSocioClick('all')}
            onKeyDown={onKeyDown}
            className={getSocioButtonClasses('all')}
            disabled={readOnly}
          >
            ALL
          </button>
        </div>
        
        {/* Segunda fila: Digital, Efectivo */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleTipoClick('digital')}
            onKeyDown={onKeyDown}
            className={getTipoButtonClasses('digital')}
            disabled={readOnly}
          >
            Digital
          </button>
          {allowEfectivo && (
            <button
              type="button"
              onClick={() => handleTipoClick('efectivo')}
              onKeyDown={onKeyDown}
              className={getTipoButtonClasses('efectivo')}
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

CuentaButtonGroup.displayName = 'CuentaButtonGroup';

export default CuentaButtonGroup;