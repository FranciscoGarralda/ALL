import React, { useState, useRef, useEffect } from 'react';
import { Plus, User, ChevronDown, X } from 'lucide-react';
import ClientModal from './ClientModal';

const ClientAutocomplete = ({
  label,
  value,
  onChange,
  clients = [],
  required = false,
  error = '',
  placeholder = 'Buscar o seleccionar cliente',
  className = '',
  onClientCreated,
  ...rest
}) => {
  const [showModal, setShowModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [filteredClients, setFilteredClients] = useState([]);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Inicializar inputValue con el cliente seleccionado
  useEffect(() => {
    if (value && clients.length > 0) {
      const selectedClient = clients.find(client => 
        (client.id || client.nombre) === value
      );
      if (selectedClient) {
        setInputValue(`${selectedClient.nombre} ${selectedClient.apellido || ''}`.trim());
      }
    } else if (!value) {
      setInputValue('');
    }
  }, [value, clients]);

  // Filtrar clientes basado en el input
  useEffect(() => {
    if (!inputValue.trim()) {
      setFilteredClients(clients.slice(0, 10)); // Mostrar primeros 10
    } else {
      const filtered = clients.filter(client => {
        const fullName = `${client.nombre} ${client.apellido || ''}`.toLowerCase();
        const searchTerm = inputValue.toLowerCase();
        return fullName.includes(searchTerm) || 
               client.telefono?.includes(searchTerm) ||
               client.dni?.includes(searchTerm);
      }).slice(0, 10);
      setFilteredClients(filtered);
    }
  }, [inputValue, clients]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsOpen(true);
    
    // Si se borra el input, limpiar la selección
    if (!newValue.trim()) {
      onChange('');
    }
  };

  const handleClientSelect = (client) => {
    const clientValue = client.id || client.nombre;
    const clientLabel = `${client.nombre} ${client.apellido || ''}`.trim();
    
    setInputValue(clientLabel);
    onChange(clientValue);
    setIsOpen(false);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleCreateClient = () => {
    setShowModal(true);
  };

  const handleClientCreated = (newClient) => {
    setShowModal(false);
    
    // Auto-seleccionar el cliente recién creado
    const clientValue = newClient.id || newClient.nombre;
    const clientLabel = `${newClient.nombre} ${newClient.apellido || ''}`.trim();
    
    setInputValue(clientLabel);
    onChange(clientValue);
    
    // Notificar al componente padre
    if (onClientCreated) {
      onClientCreated(newClient);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const clearSelection = () => {
    setInputValue('');
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-1" ref={dropdownRef}>
      {/* Label */}
      {label && (
        <label className="block text-xs sm:text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}

      {/* Container para input + botón */}
      <div className="flex space-x-2">
        {/* Input con dropdown */}
        <div className="flex-1 relative">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              placeholder={placeholder}
              className={`w-full px-3 py-2 text-base border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-gray-400 sm:px-4 sm:py-2.5 sm:text-sm ${
                error 
                  ? 'border-error-500 focus:ring-error-500' 
                  : 'bg-white text-gray-900 border-gray-300 hover:border-gray-400'
              } ${className}`}
              {...rest}
            />
            
            {/* Botón limpiar */}
            {inputValue && (
              <button
                type="button"
                onClick={clearSelection}
                className="absolute right-8 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
            
            {/* Icono dropdown */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              } text-gray-500`} />
            </div>
          </div>

          {/* Dropdown de opciones */}
          {isOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredClients.length > 0 ? (
                filteredClients.map((client, index) => (
                  <button
                    key={client.id || client.nombre || index}
                    type="button"
                    onClick={() => handleClientSelect(client)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User size={16} className="text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {client.nombre} {client.apellido || ''}
                        </p>
                        {client.telefono && (
                          <p className="text-xs text-gray-500 truncate">
                            {client.telefono}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  {inputValue ? 'No se encontraron clientes' : 'No hay clientes disponibles'}
                </div>
              )}
            </div>
          )}
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
      {!isOpen && clients.length === 0 && !error && (
        <p className="text-xs text-gray-500 mt-1 flex items-center">
          <User size={12} className="mr-1" />
          No hay clientes disponibles. Crea uno nuevo usando el botón +
        </p>
      )}

      {!isOpen && clients.length > 0 && !error && (
        <p className="text-xs text-gray-500 mt-1">
          {clients.length === 1 ? '1 cliente disponible' : `${clients.length} clientes disponibles`}
        </p>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-error-600 mt-1 flex items-center">
          <X size={12} className="mr-1" />
          {error}
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

export default ClientAutocomplete;