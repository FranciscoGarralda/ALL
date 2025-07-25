import React from 'react';
import { Plus, X, Wallet } from 'lucide-react';
import FormInput from './FormInput';
import { walletTypes } from '../../config/constants';
import { formatAmountWithCurrency } from '../../utils/formatters';

const WalletPaymentGroup = ({
  payments = [],
  onPaymentChange,
  onAddPayment,
  onRemovePayment,
  totalExpected = 0,
  currency = 'PESO',
  isActive = false,
  onToggle,
  className = ''
}) => {
  // Validación defensiva
  const safePayments = Array.isArray(payments) ? payments : [];
  
  // Calcular total de pagos
  const totalPayments = safePayments.reduce((sum, payment) => {
    return sum + (parseFloat(payment?.monto) || 0);
  }, 0);

  // Verificar si el total coincide
  const isBalanced = Math.abs(totalPayments - totalExpected) < 0.01;
  const difference = totalExpected - totalPayments;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Toggle de Pago Mixto */}
      <div className="flex items-center space-x-2">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            className="form-checkbox h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
            checked={isActive}
            onChange={(e) => onToggle(e.target.checked)}
          />
          <span className="text-sm font-medium text-gray-700 flex items-center space-x-1">
            <Wallet size={16} className="text-gray-500" />
            <span>Pago Mixto</span>
          </span>
        </label>
      </div>

      {/* Contenido del Pago Mixto */}
      {isActive && (
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-700">
              Detalle de Pago Mixto
            </h4>
            <div className="text-xs text-gray-500">
              {safePayments.length} {safePayments.length === 1 ? 'pago' : 'pagos'}
            </div>
          </div>

          {/* Lista de Pagos */}
          <div className="space-y-3">
            {safePayments.map((payment, index) => (
              <WalletPaymentItem
                key={payment?.id || index}
                payment={payment}
                index={index}
                onPaymentChange={onPaymentChange}
                onRemove={onRemovePayment}
                showRemove={safePayments.length > 1}
              />
            ))}
          </div>

          {/* Botón Añadir Pago */}
          <button
            type="button"
            onClick={onAddPayment}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-400 hover:text-primary-600 transition-all duration-200 touch-target"
          >
            <Plus size={16} />
            <span className="text-sm font-medium">Añadir Pago</span>
          </button>

          {/* Resumen de Totales */}
          <div className="pt-3 border-t border-gray-200 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Total Pagos:</span>
              <span className="font-medium text-gray-900">
                {formatAmountWithCurrency(totalPayments, currency)}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Valor Operación:</span>
              <span className="font-medium text-gray-900">
                {formatAmountWithCurrency(totalExpected, currency)}
              </span>
            </div>

            {/* Indicador de Balance */}
            {totalPayments > 0 && (
              <div className={`flex justify-between items-center text-sm font-medium rounded-lg px-3 py-2 ${
                isBalanced 
                  ? 'bg-success-50 text-success-700 border border-success-200' 
                  : difference > 0 
                    ? 'bg-warning-50 text-warning-700 border border-warning-200'
                    : 'bg-error-50 text-error-700 border border-error-200'
              }`}>
                <span>
                  {isBalanced 
                    ? '✓ Pagos Balanceados' 
                    : difference > 0 
                      ? `Falta: ${formatAmountWithCurrency(difference, currency)}`
                      : `Exceso: ${formatAmountWithCurrency(Math.abs(difference), currency)}`
                  }
                </span>
                {isBalanced && <span>✓</span>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Componente para cada item de pago individual
const WalletPaymentItem = ({
  payment = {},
  index = 0,
  onPaymentChange,
  onRemove,
  showRemove = true
}) => {
  const handleWalletChange = (walletValue) => {
    if (onPaymentChange && payment?.id) {
      onPaymentChange(payment.id, 'wallet', walletValue);
    }
  };

  const handleMontoChange = (monto) => {
    if (onPaymentChange && payment?.id) {
      onPaymentChange(payment.id, 'monto', monto);
    }
  };

  const handleRemove = () => {
    if (onRemove && payment?.id) {
      onRemove(payment.id);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 bg-white rounded-lg border border-gray-200">
      {/* Número de Pago */}
      <div className="sm:col-span-1 flex items-center justify-center">
        <div className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-medium">
          {index + 1}
        </div>
      </div>

      {/* Selector de Wallet */}
      <div className="sm:col-span-6">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Wallet
        </label>
        <div className="grid grid-cols-2 gap-2">
          {walletTypes.map((wallet) => (
            <label
              key={wallet.value}
              className={`flex items-center justify-center p-2 border rounded-lg cursor-pointer transition-all duration-200 text-xs ${
                payment?.wallet === wallet.value
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name={`wallet-${payment?.id || index}`}
                value={wallet.value}
                checked={payment?.wallet === wallet.value}
                onChange={(e) => handleWalletChange(e.target.value)}
                className="sr-only"
              />
              <span className="font-medium">{wallet.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Monto */}
      <div className="sm:col-span-4">
        <FormInput
          label="Monto"
          type="number"
          value={payment?.monto || ''}
          onChange={handleMontoChange}
          placeholder="0.00"
          className="text-sm"
        />
      </div>

      {/* Botón Eliminar */}
      <div className="sm:col-span-1 flex items-end justify-center">
        {showRemove && (
          <button
            type="button"
            onClick={handleRemove}
            className="p-2 text-error-600 hover:bg-error-50 rounded-lg transition-colors duration-200 touch-target"
            title="Eliminar pago"
            aria-label="Eliminar pago"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default WalletPaymentGroup;