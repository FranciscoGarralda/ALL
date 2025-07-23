import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import {
  Plus,
  Users,
  Wallet,
  List,
  DollarSign,
  TrendingUp,
  CreditCard,
  Receipt,
  Building2,
  UserCheck,
  ArrowUpDown,
  ArrowLeft,
  Search,
  Edit3,
  Phone,
  MapPin,
  Bell,
  User,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  XCircle,
  PlusCircle
} from 'lucide-react';

// Import our custom components
import { FormInput, FormSelect, FormFieldGroup } from '../components/base';
import { formatAmountWithCurrency } from '../utils/formatters.js';
import { 
  monedas, 
  cuentas, 
  socios, 
  estados, 
  proveedoresCC, 
  operaciones,
  tiposPago 
} from '../config/constants.js';
import { specificFieldsConfig, getFieldConfig } from '../config/fieldConfigs.js';
import { useFormState } from '../hooks/useFormState.js';

/**
 * Dynamic Form Field Groups Component
 */
function DynamicFormFieldGroups({ groups, formData, onFieldChange, errors }) {
  return (
    <div className="space-y-6">
      {groups.map((group, groupIndex) => (
        <FormFieldGroup
          key={groupIndex}
          fields={group}
          formData={formData}
          onFieldChange={onFieldChange}
          errors={errors}
        />
      ))}
    </div>
  );
}

/**
 * Operation Type Selector Component
 */
function OperationTypeSelector({ selectedOperation, selectedSubOperation, onOperationChange, onSubOperationChange }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      <FormSelect
        label="Tipo de Operación"
        value={selectedOperation}
        onChange={onOperationChange}
        options={[
          { value: '', label: 'Seleccionar operación' },
          ...Object.keys(operaciones).map(key => ({
            value: key,
            label: `${operaciones[key].icon} ${key.replace('_', ' ')}`
          }))
        ]}
        required
      />
      
      {selectedOperation && operaciones[selectedOperation]?.subMenu && (
        <FormSelect
          label="Sub-operación"
          value={selectedSubOperation}
          onChange={onSubOperationChange}
          options={[
            { value: '', label: 'Seleccionar sub-operación' },
            ...operaciones[selectedOperation].subMenu.map(sub => ({
              value: sub,
              label: sub
            }))
          ]}
          required
        />
      )}
    </div>
  );
}

/**
 * Mixed Payment Component
 */
function MixedPaymentSection({ formData, onFieldChange, errors }) {
  const [payments, setPayments] = useState([{ tipo: '', monto: '', moneda: 'PESO' }]);

  const addPayment = () => {
    setPayments([...payments, { tipo: '', monto: '', moneda: 'PESO' }]);
  };

  const removePayment = (index) => {
    const newPayments = payments.filter((_, i) => i !== index);
    setPayments(newPayments);
  };

  const updatePayment = (index, field, value) => {
    const newPayments = [...payments];
    newPayments[index] = { ...newPayments[index], [field]: value };
    setPayments(newPayments);
    onFieldChange('pagosMixtos', newPayments);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Pago Mixto</h3>
        <button
          type="button"
          onClick={addPayment}
          className="btn-secondary text-xs"
        >
          <PlusCircle className="w-4 h-4 mr-1" />
          Agregar Pago
        </button>
      </div>
      
      {payments.map((payment, index) => (
        <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600">Pago {index + 1}</span>
            {payments.length > 1 && (
              <button
                type="button"
                onClick={() => removePayment(index)}
                className="text-error-600 hover:text-error-700"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormSelect
              label="Tipo de Pago"
              value={payment.tipo}
              onChange={(value) => updatePayment(index, 'tipo', value)}
              options={tiposPago}
              required
            />
            <FormInput
              label="Monto"
              type="number"
              value={payment.monto}
              onChange={(value) => updatePayment(index, 'monto', value)}
              placeholder="0.00"
              required
            />
            <FormSelect
              label="Moneda"
              value={payment.moneda}
              onChange={(value) => updatePayment(index, 'moneda', value)}
              options={monedas}
              required
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Main Financial Operations Dashboard
 */
export default function FinancialOperationsDashboard() {
  const [selectedOperation, setSelectedOperation] = useState('');
  const [selectedSubOperation, setSelectedSubOperation] = useState('');
  const [showMixedPayment, setShowMixedPayment] = useState(false);

  // Initialize form state
  const {
    formData,
    errors,
    isLoading,
    isFormValid,
    hasChanges,
    updateField,
    updateFields,
    resetForm,
    submitForm,
    fieldConfig
  } = useFormState(selectedSubOperation, {
    fecha: new Date().toISOString().split('T')[0],
    estado: 'pendiente'
  });

  // Get field configuration for current operation
  const currentFieldConfig = useMemo(() => {
    if (!selectedSubOperation) return null;
    
    // Handle special cases for combined operations
    if (selectedOperation === 'CUENTAS_CORRIENTES' && (selectedSubOperation === 'INGRESO' || selectedSubOperation === 'EGRESO')) {
      return getFieldConfig('CUENTAS_CORRIENTES_INGRESO_EGRESO', { ...formData, subOperacion: selectedSubOperation });
    }
    
    if (selectedOperation === 'SOCIOS') {
      return getFieldConfig('SOCIOS_SHARED', formData);
    }
    
    if (selectedOperation === 'PRESTAMISTAS') {
      return getFieldConfig(`PRESTAMISTAS_${selectedSubOperation}`, formData);
    }
    
    return getFieldConfig(selectedSubOperation, formData);
  }, [selectedOperation, selectedSubOperation, formData]);

  // Reset form when operation changes
  useEffect(() => {
    resetForm();
    setShowMixedPayment(false);
  }, [selectedOperation, selectedSubOperation, resetForm]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = await submitForm(async (data) => {
      // Simulate API call
      console.log('Submitting form data:', data);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { id: Date.now(), ...data };
    });
    
    if (result.success) {
      alert('Operación guardada exitosamente!');
      resetForm();
      setSelectedOperation('');
      setSelectedSubOperation('');
    } else {
      alert('Error al guardar la operación');
    }
  };

  return (
    <>
      <Head>
        <title>Sistema Financiero - Gestión de Operaciones</title>
        <meta name="description" content="Sistema de gestión financiera multiplataforma" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-soft border-b border-gray-200">
          <div className="container-responsive py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-8 h-8 text-primary-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Sistema Financiero</h1>
                  <p className="text-sm text-gray-600">Gestión de Operaciones</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                  <Bell className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                  <User className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container-responsive py-8">
          <div className="max-w-4xl mx-auto">
            {/* Operation Form Card */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Nueva Operación Financiera
                </h2>
              </div>
              
              <form onSubmit={handleSubmit} className="card-body form-section">
                {/* Operation Type Selection */}
                <OperationTypeSelector
                  selectedOperation={selectedOperation}
                  selectedSubOperation={selectedSubOperation}
                  onOperationChange={setSelectedOperation}
                  onSubOperationChange={setSelectedSubOperation}
                />

                {/* Basic Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput
                    label="Fecha"
                    type="date"
                    name="fecha"
                    value={formData.fecha}
                    onChange={(value) => updateField('fecha', value)}
                    showDayName
                    required
                    error={errors.fecha}
                  />
                  <FormInput
                    label="Detalle / Observaciones"
                    name="detalle"
                    value={formData.detalle}
                    onChange={(value) => updateField('detalle', value)}
                    placeholder="Descripción de la operación..."
                    error={errors.detalle}
                  />
                </div>

                {/* Dynamic Operation-Specific Fields */}
                {currentFieldConfig && (
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-md font-medium text-gray-900 mb-4">
                      Campos Específicos - {selectedSubOperation}
                    </h3>
                    <DynamicFormFieldGroups
                      groups={currentFieldConfig.groups}
                      formData={formData}
                      onFieldChange={updateField}
                      errors={errors}
                    />
                  </div>
                )}

                {/* Estado y Por (if applicable) */}
                {currentFieldConfig?.includesEstadoYPor && (
                  <div className="border-t border-gray-200 pt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormSelect
                        label="Estado"
                        name="estado"
                        value={formData.estado}
                        onChange={(value) => updateField('estado', value)}
                        options={estados}
                        required
                        error={errors.estado}
                      />
                      <FormSelect
                        label="Realizado por"
                        name="por"
                        value={formData.por}
                        onChange={(value) => updateField('por', value)}
                        options={socios}
                        required
                        error={errors.por}
                      />
                    </div>
                  </div>
                )}

                {/* Mixed Payment Section */}
                {currentFieldConfig?.includesPagoMixto && (
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={showMixedPayment}
                          onChange={(e) => setShowMixedPayment(e.target.checked)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Habilitar Pago Mixto</span>
                      </label>
                    </div>
                    
                    {showMixedPayment && (
                      <MixedPaymentSection
                        formData={formData}
                        onFieldChange={updateField}
                        errors={errors}
                      />
                    )}
                  </div>
                )}

                {/* Summary Section for Buy/Sell Operations */}
                {(selectedSubOperation === 'COMPRA' || selectedSubOperation === 'VENTA') && formData.total && (
                  <div className="border-t border-gray-200 pt-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Resumen de la Operación</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Monto:</span>
                          <span className="ml-2 font-medium">
                            {formatAmountWithCurrency(formData.monto, formData.moneda)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Tipo de Cambio:</span>
                          <span className="ml-2 font-medium">
                            {formatAmountWithCurrency(formData.tc, formData.monedaTC)}
                          </span>
                        </div>
                        <div className="col-span-2 border-t border-gray-200 pt-2">
                          <span className="text-gray-600">Total:</span>
                          <span className="ml-2 font-semibold text-lg text-primary-600">
                            {formatAmountWithCurrency(formData.total, formData.monedaTC)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </form>

              {/* Form Actions */}
              <div className="card-footer">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {hasChanges ? 'Hay cambios sin guardar' : 'Sin cambios'}
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={resetForm}
                      disabled={!hasChanges}
                      className="btn-secondary disabled:opacity-50"
                    >
                      Limpiar
                    </button>
                    <button
                      type="submit"
                      onClick={handleSubmit}
                      disabled={!selectedSubOperation || !isFormValid || isLoading}
                      className="btn-primary disabled:opacity-50"
                    >
                      {isLoading ? 'Guardando...' : 'Guardar Operación'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Demo Information Card */}
            <div className="card mt-8">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Información del Sistema</h3>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Tipos de Operaciones</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {Object.entries(operaciones).map(([key, config]) => (
                        <li key={key} className="flex items-center">
                          <span className="mr-2">{config.icon}</span>
                          {key.replace('_', ' ')} - {config.subMenu.join(', ')}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Características</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>✅ Formularios dinámicos y responsivos</li>
                      <li>✅ Cálculos automáticos en tiempo real</li>
                      <li>✅ Validación de campos</li>
                      <li>✅ Soporte para múltiples monedas</li>
                      <li>✅ Pagos mixtos</li>
                      <li>✅ Optimizado para móvil y escritorio</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}