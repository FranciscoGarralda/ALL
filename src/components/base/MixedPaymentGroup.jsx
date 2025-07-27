import React, { forwardRef } from 'react';
import { Plus, X } from 'lucide-react';
import { safeParseFloat, safeArray } from '../../utils/safeOperations';
import FormSelect from './FormSelect';
import CurrencyInput from './CurrencyInput';

// Opciones para socio
const socioOptions = [
  { value: 'socio1', label: 'Socio 1' },
  { value: 'socio2', label: 'Socio 2' },
];

// Opciones para tipo de pago
const tipoOptions = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'digital', label: 'Digital' },
];

const MixedPaymentGroup = ({
  payments = [],
  onPaymentChange,
  onAddPayment,
  onRemovePayment,
  totalExpected = 0,
  currency = 'PESO',
  onKeyDown,
  registerField
}) => {
  // Validación defensiva - VERSIÓN SEGURA
  const safePayments = safeArray(payments);
  
  // Calcular total de pagos - VERSIÓN SEGURA
  const totalPayments = safePayments.reduce((sum, payment) => {
    return sum + safeParseFloat(payment?.monto, 0);
  }, 0);

  // Verificar si el total coincide - VERSIÓN SEGURA
  const safeExpectedTotal = safeParseFloat(totalExpected, 0);
  const isBalanced = Math.abs(totalPayments - safeExpectedTotal) < 0.01;
  const difference = safeExpectedTotal - totalPayments;

  // Mostrar por defecto 2 pagos, máximo 4
  const paymentsToShow = Math.max(2, safePayments.length);
  const displayPayments = [];
  
  for (let i = 0; i < paymentsToShow && i < 4; i++) {
    displayPayments.push(safePayments[i] || { id: i + 1, socio: '', tipo: '', monto: '' });
  }

  return (
    <div className="space-y-4">
      {/* Título de sección */}
      <div className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-2">
        Configuración de Pago Mixto
      </div>

      {/* Pagos individuales - SIN RECUADRE, campos normales */}
      {displayPayments.map((payment, index) => (
        <div key={payment.id || index} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {/* Selector de Socio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Socio {index + 1}
            </label>
            <FormSelect
              ref={(el) => registerField && registerField(`mixedPayment_${index}_socio`, el)}
              name={`mixedPayment_${index}_socio`}
              value={payment.socio || ''}
              onChange={(value) => onPaymentChange(payment.id || index + 1, 'socio', value)}
              onKeyDown={(e) => onKeyDown && onKeyDown(`mixedPayment_${index}_socio`, e)}
              options={socioOptions}
              placeholder="Seleccionar socio"
              required
            />
          </div>

          {/* Selector de Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <FormSelect
              ref={(el) => registerField && registerField(`mixedPayment_${index}_tipo`, el)}
              name={`mixedPayment_${index}_tipo`}
              value={payment.tipo || ''}
              onChange={(value) => onPaymentChange(payment.id || index + 1, 'tipo', value)}
              onKeyDown={(e) => onKeyDown && onKeyDown(`mixedPayment_${index}_tipo`, e)}
              options={tipoOptions}
              placeholder="Seleccionar tipo"
              required
            />
          </div>

          {/* Campo de Monto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto
            </label>
            <CurrencyInput
              ref={(el) => registerField && registerField(`mixedPayment_${index}_monto`, el)}
              name={`mixedPayment_${index}_monto`}
              value={payment.monto || ''}
              onChange={(value) => onPaymentChange(payment.id || index + 1, 'monto', value)}
              onKeyDown={(e) => onKeyDown && onKeyDown(`mixedPayment_${index}_monto`, e)}
              placeholder="0.00"
              required
            />
          </div>

          {/* Botón de eliminar (solo si hay más de 2 pagos) */}
          <div className="flex items-end">
            {safePayments.length > 2 && index >= 2 && (
              <button
                ref={(el) => registerField && registerField(`mixedPayment_${index}_remove`, el)}
                type="button"
                onClick={() => onRemovePayment(payment.id || index + 1)}
                onKeyDown={(e) => onKeyDown && onKeyDown(`mixedPayment_${index}_remove`, e)}
                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                title="Eliminar pago"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Botón para añadir pago (solo si hay menos de 4) */}
      {safePayments.length < 4 && (
        <div className="flex justify-start">
          <button
            ref={(el) => registerField && registerField('mixedPayment_add', el)}
            type="button"
            onClick={onAddPayment}
            onKeyDown={(e) => onKeyDown && onKeyDown('mixedPayment_add', e)}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded-lg transition-colors border border-primary-200 hover:border-primary-300"
          >
            <Plus size={16} />
            <span>Añadir Pago</span>
          </button>
        </div>
      )}

      {/* Resumen de totales - SIN RECUADRE */}
      <div className="pt-2 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Total Pagos:</span>
            <span className="ml-2 font-medium text-gray-900">
              ${totalPayments.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Esperado:</span>
            <span className="ml-2 font-medium text-gray-900">
              ${totalExpected.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
        
        {!isBalanced && (
          <div className="mt-2 text-sm">
            <span className={`font-medium ${difference > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {difference > 0 ? 'Falta:' : 'Sobra:'} ${Math.abs(difference).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MixedPaymentGroup;