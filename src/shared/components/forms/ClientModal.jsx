import React, { useState, useRef, useCallback, useEffect } from 'react';
import { X, User, Phone, Mail, MapPin, Save } from 'lucide-react';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import { lockBodyScroll, unlockBodyScroll } from '../../utils/mobileUtils';

// import { handleValidationError, ERROR_SEVERITY } from '../../services/errorHandler';

const ClientModal = ({
  isOpen,
  onClose,
  onClientCreated,
  title = "Crear Nuevo Cliente"
}) => {
  console.log('ClientModal renderizado, isOpen:', isOpen);
  
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

  // Función básica para manejar Escape
  const handleModalNavigation = useCallback((currentField, event) => {
    switch (event.key) {
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

  // Manejar lock del scroll cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      lockBodyScroll();
      return () => {
        unlockBodyScroll();
      };
    }
  }, [isOpen]);

  // Manejar navegación con teclado y Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      // Escape cierra el modal
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      // Navegación con flechas solo dentro del modal
      if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        const modal = document.querySelector('.client-modal-content');
        if (!modal) return;

        const focusableElements = modal.querySelectorAll(
          'input:not([disabled]), select:not([disabled]), button:not([disabled]), textarea:not([disabled])'
        );
        
        const currentIndex = Array.from(focusableElements).indexOf(document.activeElement);
        
        if (currentIndex !== -1) {
          e.preventDefault();
          let nextIndex = currentIndex;
          
          if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            nextIndex = (currentIndex + 1) % focusableElements.length;
          } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            nextIndex = (currentIndex - 1 + focusableElements.length) % focusableElements.length;
          }
          
          focusableElements[nextIndex]?.focus();
        }
      }
    };

    // Agregar listener
    document.addEventListener('keydown', handleKeyDown);
    
    // Focus en el primer campo al abrir
    setTimeout(() => {
      const firstInput = document.querySelector('.client-modal-content input');
      firstInput?.focus();
    }, 100);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

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
      // Llamar a la función onClientCreated que se conecta con onSaveClient
      // Esto guardará el cliente en la base de datos
      const result = await onClientCreated(formData);
      
      // Si se guardó exitosamente
      if (result) {
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
        
        // Cerrar el modal
        onClose();
      }
    } catch (error) {
      console.error('Error creating client:', error);
      setErrors({ general: error.message || 'Error al crear el cliente. Verifica los datos ingresados.' });
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4 safe-top safe-bottom overflow-y-auto">
      <div className="bg-white rounded-xl shadow-large max-w-md w-full my-8 sm:my-12 max-h-[calc(100vh-8rem)] sm:max-h-[85vh] overflow-y-auto client-modal-content relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <User size={18} className="text-gray-800" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
            aria-label="Cerrar modal"
          >
            <X size={20} className="text-gray-700" />
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
            placeholder="12345678"
          />

          {/* Tipo de Cliente */}
          <FormSelect
            ref={(el) => registerField('tipo', el)}
            label="Tipo de Cliente"
            name="tipo"
            value={formData.tipo}
            onChange={(value) => handleInputChange('tipo', value)}
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
            placeholder="Calle, número, ciudad"
          />

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              ref={(el) => registerField('cancelar', el)}
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              ref={(el) => registerField('guardar', el)}
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-gray-900 hover:bg-slate-800 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 flex items-center space-x-2"
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