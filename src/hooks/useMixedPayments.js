import { useCallback } from 'react';
import { specificFieldsConfig } from '../config/fieldConfigs';

/**
 * Custom hook for managing mixed payments functionality
 * Provides standardized functions for mixed payment operations
 */
export const useMixedPayments = (formData, setFormData) => {
  
  // Check if mixed payment is active
  const isMixedPaymentActive = useCallback(() => {
    return formData.walletTC === 'pago_mixto';
  }, [formData.walletTC]);

  // Handle mixed payment field changes
  const handleMixedPaymentChange = useCallback((id, field, value) => {
    setFormData(prev => {
      const updatedPayments = prev.mixedPayments.map(payment =>
        payment.id === id ? { ...payment, [field]: value } : payment
      );

      let newTotal = prev.total;
      const expectedTotal = parseFloat(prev.expectedTotalForMixedPayments) || 0;

      if (prev.walletTC === 'pago_mixto') {
        if (field === 'monto') {
          const changedPaymentIndex = updatedPayments.findIndex(p => p.id === id);

          if (changedPaymentIndex !== 0) {
            const sumOfOtherPaymentsExcludingFirst = updatedPayments.slice(1).reduce((sum, p) => sum + (parseFloat(p.monto) || 0), 0);
            updatedPayments[0].monto = (expectedTotal - sumOfOtherPaymentsExcludingFirst).toFixed(2);
          }
        }
        newTotal = updatedPayments.reduce((sum, payment) => sum + (parseFloat(payment.monto) || 0), 0).toFixed(2);
      }

      return { ...prev, mixedPayments: updatedPayments, total: newTotal };
    });
  }, [setFormData]);

  // Add new mixed payment
  const addMixedPayment = useCallback(() => {
    setFormData(prev => {
      // Determine if we're in wallet mode
      let configKey = prev.subOperacion;
      if (['INGRESO', 'EGRESO'].includes(prev.subOperacion) && prev.operacion === 'CUENTAS_CORRIENTES') {
        configKey = 'CUENTAS_CORRIENTES_INGRESO_EGRESO';
      } else if (['INGRESO', 'SALIDA', 'PRESTAMO', 'DEVOLUCION'].includes(prev.subOperacion) && prev.operacion === 'SOCIOS') {
        configKey = 'SOCIOS_SHARED';
      } else if (prev.subOperacion === 'PRESTAMO' && prev.operacion === 'PRESTAMISTAS') {
        configKey = 'PRESTAMISTAS_PRESTAMO';
      } else if (prev.subOperacion === 'RETIRO' && prev.operacion === 'PRESTAMISTAS') {
        configKey = 'PRESTAMISTAS_RETIRO';
      } else if (prev.subOperacion === 'TRANSFERENCIA' && prev.operacion === 'INTERNAS') {
        configKey = 'TRANSFERENCIA';
      }

      // specificFieldsConfig imported at top
      const isWalletMode = specificFieldsConfig[configKey]?.pagoMixtoWalletMode;
      
      const newPayment = isWalletMode 
        ? { id: Date.now(), wallet: '', monto: '' }
        : { id: Date.now(), cuenta: '', monto: '' };
      
      const newPayments = [...prev.mixedPayments, newPayment];
      let newTotal = prev.total;
      if (prev.walletTC === 'pago_mixto') {
        newTotal = newPayments.reduce((sum, payment) => sum + (parseFloat(payment.monto) || 0), 0).toFixed(2);
      }
      
      return {
        ...prev,
        mixedPayments: newPayments,
        total: newTotal
      };
    });
  }, [setFormData]);

  // Remove mixed payment
  const removeMixedPayment = useCallback((id) => {
    setFormData(prev => {
      const filteredPayments = prev.mixedPayments.filter(payment => payment.id !== id);
      let newTotal = prev.total;
      const expectedTotal = parseFloat(prev.expectedTotalForMixedPayments) || 0;

      if (prev.walletTC === 'pago_mixto') {
        if (id === prev.mixedPayments[0].id && filteredPayments.length > 0) {
          const sumOfRemainingPayments = filteredPayments.slice(1).reduce((sum, p) => sum + (parseFloat(p.monto) || 0), 0);
          filteredPayments[0].monto = (expectedTotal - sumOfRemainingPayments).toFixed(2);
        } else if (filteredPayments.length > 0) {
          const sumOfOtherPaymentsExcludingFirst = filteredPayments.slice(1).reduce((sum, p) => sum + (parseFloat(p.monto) || 0), 0);
          filteredPayments[0].monto = (expectedTotal - sumOfOtherPaymentsExcludingFirst).toFixed(2);
        } else {
          filteredPayments.push({ id: Date.now(), cuenta: '', monto: '' });
        }
        newTotal = filteredPayments.reduce((sum, payment) => sum + (parseFloat(payment.monto) || 0), 0).toFixed(2);
      }

      return {
        ...prev,
        mixedPayments: filteredPayments,
        total: newTotal
      };
    });
  }, [setFormData]);

  // Validate mixed payments
  const validateMixedPayments = useCallback(() => {
    if (formData.walletTC === 'pago_mixto') {
      const totalMixedPayments = formData.mixedPayments.reduce((sum, payment) => sum + (parseFloat(payment.monto) || 0), 0);
      const expectedTotal = parseFloat(formData.expectedTotalForMixedPayments) || 0;

      if (Math.abs(totalMixedPayments - expectedTotal) > 0.01) {
        return {
          isValid: false,
          error: `El total de pagos mixtos (${totalMixedPayments.toFixed(2)}) no coincide con el valor esperado (${expectedTotal.toFixed(2)})`
        };
      }
    }
    return { isValid: true, error: null };
  }, [formData.walletTC, formData.mixedPayments, formData.expectedTotalForMixedPayments]);

  return {
    isMixedPaymentActive,
    handleMixedPaymentChange,
    addMixedPayment,
    removeMixedPayment,
    validateMixedPayments
  };
};