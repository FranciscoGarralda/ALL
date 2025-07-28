import React, { useState } from 'react';
import { Plus, User, Search } from 'lucide-react';
import FormSelect from './FormSelect';
import ClientModal from './ClientModal';

const ClientSelect = ({
  label,
  value,
  onChange,
  clients = [],
  required = false,
  error = '',
  placeholder = 'Seleccionar cliente',
  className = '',
  onClientCreated,
  ...rest
}) => {
  const [showModal, setShowModal] = useState(false);

  // Convertir clientes a formato de opciones para FormSelect
  const clientOptions = [
    { value: '', label: placeholder },
    ...clients.map(client => ({
      value: client.id || client.nombre,
      label: `${client.nombre} ${client.apellido || ''}`.trim()
    }))
  ];

  const handleCreateClient = () => {
    setShowModal(true);
  };

  const handleClientCreated = (newClient) => {
    setShowModal(false);
    // Auto-seleccionar el cliente recién creado
    if (onChange) {
      onChange(newClient.id || newClient.nombre);
    }
    // Notificar al componente padre si hay callback
    if (onClientCreated) {
      onClientCreated(newClient);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  return (
    <div className="space-y-1">
      {/* Label */}
      {label && (
        <label className="block text-xs sm:text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}

      {/* Container para select + botón */}
      <div className="flex space-x-2">
        {/* Select de cliente */}
        <div className="flex-1">
          <FormSelect
            value={value}
            onChange={onChange}
            options={clientOptions}
            error={error}
            required={required}
            placeholder={placeholder}
            className={className}
            {...rest}
          />
        </div>

        {/* Botón para crear cliente */}
        <button
          type="button"
          onClick={handleCreateClient}
          className="flex-shrink-0 w-10 h-10 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex items-center justify-center transition-all duration-200 shadow-soft hover:shadow-medium focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 touch-target"
          title="Crear nuevo cliente"
          aria-label="Crear nuevo cliente"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Información adicional */}
      {clients.length === 0 && !error && (
        <p className="text-xs text-gray-500 mt-1 flex items-center">
          <User size={12} className="mr-1" />
          No hay clientes disponibles. Crea uno nuevo usando el botón +
        </p>
      )}

      {clients.length > 0 && !error && (
        <p className="text-xs text-gray-500 mt-1">
          {clients.length === 1 ? '1 cliente disponible' : `${clients.length} clientes disponibles`}
        </p>
      )}

      {/* Modal para crear cliente */}
      {showModal && (
        <ClientModal
          isOpen={showModal}
          onClose={handleModalClose}
          onClientCreated={handleClientCreated}
          title="Crear Nuevo Cliente"
        />
      )}
    </div>
  );
};

export default ClientSelect;