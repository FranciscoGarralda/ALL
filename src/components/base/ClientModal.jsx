import React, { useState } from 'react';
import { X, User, Phone, Mail, MapPin, Save } from 'lucide-react';
import FormInput from './FormInput';
import FormSelect from './FormSelect';

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
        id: Date.now().toString(), // ID temporal
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
      setErrors({ general: 'Error al crear el cliente. Intenta nuevamente.' });
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
              label="Nombre"
              name="nombre"
              value={formData.nombre}
              onChange={(value) => handleInputChange('nombre', value)}
              placeholder="Ingresa el nombre"
              required
              error={errors.nombre}
            />
            <FormInput
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
            label="DNI"
            name="dni"
            value={formData.dni}
            onChange={(value) => handleInputChange('dni', value)}
            placeholder="12345678"
          />

          {/* Tipo de Cliente */}
          <FormSelect
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
            label="Dirección"
            name="direccion"
            value={formData.direccion}
            onChange={(value) => handleInputChange('direccion', value)}
            placeholder="Calle, número, ciudad"
          />

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
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