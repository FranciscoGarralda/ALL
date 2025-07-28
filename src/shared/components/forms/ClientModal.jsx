import React, { useState, useRef, useCallback } from 'react';
import { X, User, Phone, Mail, MapPin, Save } from 'lucide-react';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
// import { handleValidationError, ERROR_SEVERITY } from '../../services/errorHandler';

const ClientModal = ({
  isOpen,
  onClose,
  onClientCreated,
  title = "Crear Nuevo Cliente"
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    dni: '',
    direccion: '',
    tipo: 'operaciones' // Default tipo
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Referencias para navegación
  const fieldRefs = useRef({});
  
  // Función para registrar referencias de campos
  const registerField = useCallback((fieldName, ref) => {
    if (ref) {
      fieldRefs.current[fieldName] = ref;
    }
  }, []);

  // Función para navegación en el modal
  const handleModalNavigation = useCallback((currentField, event) => {
    const fieldOrder = ['nombre', 'apellido', 'telefono', 'email', 'dni', 'direccion', 'tipo', 'guardar', 'cancelar'];
    const currentIndex = fieldOrder.indexOf(currentField);

    // Prevenir comportamiento por defecto
    if (['Enter', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Función para enfocar un campo
    const focusField = (fieldName) => {
      const fieldRef = fieldRefs.current[fieldName];
      if (fieldRef) {
        if (fieldRef.focus) {
          fieldRef.focus();
        } else if (fieldRef.querySelector) {
          const input = fieldRef.querySelector('input, select, button');
          if (input) input.focus();
        }
      }
    };

    switch (event.key) {
      case 'Enter':
        // Enter en botones ejecuta la acción
        if (currentField === 'guardar') {
          handleSubmit();
        } else if (currentField === 'cancelar') {
          onClose();
        }
        // En otros campos, ir al siguiente
        else if (currentIndex < fieldOrder.length - 1) {
          const nextField = fieldOrder[currentIndex + 1];
          focusField(nextField);
        }
        break;

      case 'ArrowDown':
      case 'ArrowRight':
        // Ir al siguiente campo
        if (currentIndex < fieldOrder.length - 1) {
          const nextField = fieldOrder[currentIndex + 1];
          focusField(nextField);
        }
        break;

      case 'ArrowUp':
      case 'ArrowLeft':
        // Ir al campo anterior
        if (currentIndex > 0) {
          const prevField = fieldOrder[currentIndex - 1];
          focusField(prevField);
        }
        break;

      case 'Escape':
        // Escape cierra el modal
        onClose();
        break;
    }
  }, [onClose]);

  const tiposCliente = [
    { value: 'operaciones', label: 'Operaciones' },
    { value: 'prestamistas', label: 'Prestamistas' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es obligatorio';
    }

    if (!formData.tipo) {
      newErrors.tipo = 'El tipo de cliente es obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simular creación del cliente
      const newClient = {
        id: Date.now(), // ID numérico para coincidir con handleSaveClient
        ...formData,
        fechaCreacion: new Date().toISOString()
      };

      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 500));

      // Notificar al componente padre
      onClientCreated(newClient);

      // Resetear formulario
      setFormData({
        nombre: '',
        apellido: '',
        telefono: '',
        email: '',
        dni: '',
        direccion: '',
        tipo: 'operaciones'
      });
      setErrors({});

          } catch (error) {
        console.error('Error creating client:', error);
        setErrors({ general: 'Error al crear el cliente. Verifica los datos ingresados.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-large max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
              <User size={18} className="text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
            aria-label="Cerrar modal"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error general */}
          {errors.general && (
            <div className="p-3 bg-error-50 border border-error-200 rounded-lg">
              <p className="text-sm text-error-600">{errors.general}</p>
            </div>
          )}

          {/* Nombre y Apellido */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              ref={(el) => registerField('nombre', el)}
              label="Nombre"
              name="nombre"
              value={formData.nombre}
              onChange={(value) => handleInputChange('nombre', value)}
              onKeyDown={(e) => handleModalNavigation('nombre', e)}
              placeholder="Ingresa el nombre"
              required
              error={errors.nombre}
            />
            <FormInput
              ref={(el) => registerField('apellido', el)}
              label="Apellido"
              name="apellido"
              value={formData.apellido}
              onChange={(value) => handleInputChange('apellido', value)}
              onKeyDown={(e) => handleModalNavigation('apellido', e)}
              placeholder="Ingresa el apellido"
            />
          </div>

          {/* Teléfono y Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              ref={(el) => registerField('telefono', el)}
              label="Teléfono"
              name="telefono"
              type="tel"
              value={formData.telefono}
              onChange={(value) => handleInputChange('telefono', value)}
              onKeyDown={(e) => handleModalNavigation('telefono', e)}
              placeholder="+54 9 11 1234-5678"
              required
              error={errors.telefono}
            />
            <FormInput
              ref={(el) => registerField('email', el)}
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={(value) => handleInputChange('email', value)}
              onKeyDown={(e) => handleModalNavigation('email', e)}
              placeholder="cliente@email.com"
            />
          </div>

          {/* DNI */}
          <FormInput
            ref={(el) => registerField('dni', el)}
            label="DNI"
            name="dni"
            value={formData.dni}
            onChange={(value) => handleInputChange('dni', value)}
            onKeyDown={(e) => handleModalNavigation('dni', e)}
            placeholder="12345678"
          />

          {/* Tipo de Cliente */}
          <FormSelect
            ref={(el) => registerField('tipo', el)}
            label="Tipo de Cliente"
            name="tipo"
            value={formData.tipo}
            onChange={(value) => handleInputChange('tipo', value)}
            onKeyDown={(e) => handleModalNavigation('tipo', e)}
            options={tiposCliente}
            required
            error={errors.tipo}
          />

          {/* Dirección */}
          <FormInput
            ref={(el) => registerField('direccion', el)}
            label="Dirección"
            name="direccion"
            value={formData.direccion}
            onChange={(value) => handleInputChange('direccion', value)}
            onKeyDown={(e) => handleModalNavigation('direccion', e)}
            placeholder="Calle, número, ciudad"
          />

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              ref={(el) => registerField('cancelar', el)}
              type="button"
              onClick={handleClose}
              onKeyDown={(e) => handleModalNavigation('cancelar', e)}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              ref={(el) => registerField('guardar', el)}
              type="submit"
              onKeyDown={(e) => handleModalNavigation('guardar', e)}
              disabled={isLoading}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creando...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Crear Cliente</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientModal;