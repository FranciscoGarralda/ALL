import React from 'react';
import FormInput from './FormInput';
import CommissionTypeSwitch from './CommissionTypeSwitch';

const CommissionField = ({ 
  label = 'Comisión',
  name,
  value,
  onChange,
  commissionType = 'percentage',
  onCommissionTypeChange,
  error,
  required,
  className = '',
  ...rest
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-xs sm:text-sm font-medium text-gray-700">
          {label} {required && <span className="text-error-500 ml-1">*</span>}
        </label>
        <CommissionTypeSwitch 
          value={commissionType}
          onChange={onCommissionTypeChange}
        />
      </div>
      <FormInput
        name={name}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={commissionType === 'percentage' ? '0.00%' : '0.00'}
        error={error}
        required={required}
        inputMode="decimal"
        {...rest}
      />
    </div>
  );
};

export default CommissionField;