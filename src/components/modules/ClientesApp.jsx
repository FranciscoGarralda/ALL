import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Edit3,
  Phone,
  MapPin,
  User,
  Trash2,
  ArrowLeft,
  TrendingUp,
  CreditCard,
  Bell
} from 'lucide-react';
import { FormInput, FormSelect } from '../base';

/** COMPONENTE PRINCIPAL DE CLIENTES */
function ClientesApp({ clientes, onSaveClient, onDeleteClient }) {
  const [vista, setVista] = useState('lista'); // 'lista', 'form', 'analytics'
  const [clienteEditando, setClienteEditando] = useState(null);
  const [clienteAnalytics, setClienteAnalytics] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  // Funciones de navegación
  const crearNuevoCliente = () => {
    setClienteEditando(null);
    setVista('form');
  };

  const editarCliente = (cliente) => {
    setClienteEditando(cliente);
    setVista('form');
  };

  const eliminarCliente = (clienteId) => {
    const clienteAEliminar = clientes.find(c => c.id === clienteId);
    if (clienteAEliminar) {
      const confirmacion = window.confirm(
        `¿Estás seguro de eliminar a ${clienteAEliminar.nombre} ${clienteAEliminar.apellido}?`
      );
      if (confirmacion) {
        onDeleteClient(clienteId);
      }
    }
  };

  const guardarCliente = (clienteData) => {
    onSaveClient(clienteData);
    setVista('lista');
    setClienteEditando(null);
  };

  const verAnalytics = (cliente) => {
    setClienteAnalytics(cliente);
    setVista('analytics');
  };

  const volverALista = () => {
    setVista('lista');
    setClienteEditando(null);
    setClienteAnalytics(null);
  };

  // Función para calcular frecuencia de operaciones
  const calcularFrecuencia = (cliente) => {
    if (!cliente.operaciones || cliente.operaciones.length < 2) return 30;

    const fechas = cliente.operaciones.map(op => new Date(op.fecha)).sort((a, b) => a - b);
    let totalDias = 0;

    for (let i = 1; i < fechas.length; i++) {
      const diasEntre = Math.floor((fechas[i] - fechas[i-1]) / (1000 * 60 * 60 * 24));
      totalDias += diasEntre;
    }

    return Math.round(totalDias / (fechas.length - 1));
  };

  // Función para determinar estado de contacto
  const getEstadoContacto = (cliente) => {
    if (!cliente.ultimaOperacion) return { color: 'bg-gray-100 text-gray-600', texto: 'Sin datos' };

    const dias = Math.floor((new Date() - new Date(cliente.ultimaOperacion)) / (1000 * 60 * 60 * 24));
    const frecuencia = calcularFrecuencia(cliente);

    if (dias > frecuencia * 1.5) return { color: 'bg-error-100 text-error-600', texto: 'Contactar urgente' };
    if (dias > frecuencia) return { color: 'bg-warning-100 text-warning-600', texto: 'Contactar pronto' };
    return { color: 'bg-success-100 text-success-600', texto: 'Activo' };
  };

  // Filtrar clientes por búsqueda
  const clientesFiltrados = useMemo(() => {
    return clientes.filter(cliente =>
      `${cliente.nombre} ${cliente.apellido}`.toLowerCase().includes(busqueda.toLowerCase()) ||
      cliente.telefono.includes(busqueda) ||
      cliente.dni.includes(busqueda)
    );
  }, [clientes, busqueda]);

  // Separar por tipo
  const clientesOperaciones = clientesFiltrados.filter(c => c.tipoCliente === 'operaciones');
  const clientesPrestamistas = clientesFiltrados.filter(c => c.tipoCliente === 'prestamistas');

  // Renderizado condicional según la vista
  if (vista === 'form') {
    return (
      <FormularioCliente 
        cliente={clienteEditando} 
        onSave={guardarCliente} 
        onCancel={volverALista} 
      />
    );
  }

  if (vista === 'analytics') {
    return (
      <AnalyticsCliente 
        cliente={clienteAnalytics} 
        onBack={volverALista}
        calcularFrecuencia={calcularFrecuencia}
      />
    );
  }

  // Vista principal - Lista de clientes
  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6 safe-top safe-bottom lg:pt-6 pt-16">
      {/* Header */}
      <div className="card mb-4 sm:mb-6">
        <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-100">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <User size={20} className="sm:w-6 sm:h-6 text-primary-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">Gestión de Clientes</h1>
                <p className="text-xs sm:text-sm text-gray-500">
                  {clientes.length} cliente{clientes.length !== 1 ? 's' : ''} registrado{clientes.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <button 
              onClick={crearNuevoCliente} 
              className="btn-primary flex items-center justify-center gap-2 touch-target w-full sm:w-auto"
            >
              <Plus size={18} />
              <span>Nuevo Cliente</span>
            </button>
          </div>
        </div>

        {/* Búsqueda */}
        <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-100">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, teléfono o DNI..."
              className="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        {/* Lista de clientes por categoría */}
        <div className="p-3 sm:p-4 lg:p-6 space-y-6 sm:space-y-8">
          {/* Clientes de Operaciones */}
          {clientesOperaciones.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <TrendingUp size={18} className="text-primary-600 flex-shrink-0" />
                <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800">
                  Clientes de Operaciones ({clientesOperaciones.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {clientesOperaciones.map((cliente) => (
                  <ClienteCard
                    key={cliente.id}
                    cliente={cliente}
                    onEdit={editarCliente}
                    onViewAnalytics={verAnalytics}
                    onDelete={eliminarCliente}
                    calcularFrecuencia={calcularFrecuencia}
                    getEstadoContacto={getEstadoContacto}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Clientes Prestamistas */}
          {clientesPrestamistas.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <CreditCard size={18} className="text-warning-600 flex-shrink-0" />
                <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800">
                  Clientes Prestamistas ({clientesPrestamistas.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {clientesPrestamistas.map((cliente) => (
                  <ClienteCard
                    key={cliente.id}
                    cliente={cliente}
                    onEdit={editarCliente}
                    onViewAnalytics={verAnalytics}
                    onDelete={eliminarCliente}
                    calcularFrecuencia={calcularFrecuencia}
                    getEstadoContacto={getEstadoContacto}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Estado vacío */}
          {clientesFiltrados.length === 0 && (
            <div className="text-center py-8 sm:py-12">
              <User size={40} className="sm:w-12 sm:h-12 mx-auto text-gray-300 mb-3 sm:mb-4" />
              {busqueda ? (
                <div>
                  <p className="text-sm sm:text-base text-gray-500 mb-2 px-4">No se encontraron clientes que coincidan con "{busqueda}"</p>
                  <button
                    onClick={() => setBusqueda('')}
                    className="text-primary-600 hover:text-primary-700 text-sm"
                  >
                    Limpiar búsqueda
                  </button>
                </div>
              ) : (
                <div className="px-4">
                  <p className="text-sm sm:text-base text-gray-500 mb-4">No hay clientes registrados</p>
                  <button
                    onClick={crearNuevoCliente}
                    className="btn-primary touch-target"
                  >
                    Crear primer cliente
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** COMPONENTE TARJETA DE CLIENTE */
function ClienteCard({ cliente, onEdit, onViewAnalytics, onDelete, calcularFrecuencia, getEstadoContacto }) {
  const getDiasDesdeUltimaOperacion = () => {
    if (!cliente.ultimaOperacion) return 'Nunca';
    const dias = Math.floor((new Date() - new Date(cliente.ultimaOperacion)) / (1000 * 60 * 60 * 24));
    if (dias === 0) return 'Hoy';
    if (dias === 1) return 'Ayer';
    return `${dias} días`;
  };

  const estado = getEstadoContacto(cliente);
  const frecuencia = calcularFrecuencia(cliente);

  return (
    <div className="card hover:shadow-medium transition-all duration-200 hover:scale-102">
      <div className="p-3 sm:p-4 space-y-3">
        {/* Header con nombre y estado */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
              {cliente.nombre} {cliente.apellido}
            </h3>
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estado.color}`}>
                {estado.texto}
              </span>
              {cliente.tipoCliente && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  cliente.tipoCliente === 'operaciones' 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'bg-warning-100 text-warning-700'
                }`}>
                  {cliente.tipoCliente === 'operaciones' ? 'Operaciones' : 'Prestamista'}
                </span>
              )}
            </div>
          </div>
          
          {/* Botones de acción */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button 
              onClick={() => onViewAnalytics(cliente)} 
              className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors touch-target"
              title="Ver análisis"
            >
              <TrendingUp size={14} />
            </button>
            <button 
              onClick={() => onEdit(cliente)} 
              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors touch-target"
              title="Editar cliente"
            >
              <Edit3 size={14} />
            </button>
            <button 
              onClick={() => onDelete(cliente.id)} 
              className="p-2 text-error-600 hover:bg-error-50 rounded-lg transition-colors touch-target"
              title="Eliminar cliente"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Información de contacto */}
        <div className="space-y-1.5 text-xs sm:text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Phone size={12} className="text-gray-400 flex-shrink-0" />
            <span className="truncate">{cliente.telefono}</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard size={12} className="text-gray-400 flex-shrink-0" />
            <span className="truncate">DNI: {cliente.dni}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={12} className="text-gray-400 flex-shrink-0" />
            <span className="truncate" title={cliente.direccion}>{cliente.direccion}</span>
          </div>
        </div>

        {/* Métricas del cliente */}
        <div className="border-t pt-2 flex flex-col sm:flex-row sm:justify-between text-xs text-gray-500 gap-1">
          <span className="truncate">Última: {getDiasDesdeUltimaOperacion()}</span>
          <span className="truncate">Cada {frecuencia} días • {cliente.totalOperaciones || 0} ops</span>
        </div>
      </div>
    </div>
  );
}

/** COMPONENTE FORMULARIO DE CLIENTE */
function FormularioCliente({ cliente, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    nombre: cliente?.nombre || '',
    apellido: cliente?.apellido || '',
    telefono: cliente?.telefono || '',
    direccion: cliente?.direccion || '',
    dni: cliente?.dni || '',
    tipoCliente: cliente?.tipoCliente || '',
  });

  const [errores, setErrores] = useState({});

  const validarFormulario = () => {
    const nuevosErrores = {};
    
    if (!formData.nombre.trim()) nuevosErrores.nombre = 'El nombre es obligatorio';
    if (!formData.apellido.trim()) nuevosErrores.apellido = 'El apellido es obligatorio';
    if (!formData.telefono.trim()) nuevosErrores.telefono = 'El teléfono es obligatorio';
    if (!formData.dni.trim()) nuevosErrores.dni = 'El DNI es obligatorio';
    if (!formData.direccion.trim()) nuevosErrores.direccion = 'La dirección es obligatoria';
    if (!formData.tipoCliente) nuevosErrores.tipoCliente = 'Debe seleccionar el tipo de cliente';

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = () => {
    if (!validarFormulario()) {
      return;
    }
    
    onSave({ 
      ...cliente, 
      ...formData, 
      id: cliente?.id || Date.now(),
      operaciones: cliente?.operaciones || [],
      ultimaOperacion: cliente?.ultimaOperacion || null,
      totalOperaciones: cliente?.totalOperaciones || 0,
      volumenTotal: cliente?.volumenTotal || 0,
      createdAt: cliente?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error al empezar a escribir
    if (errores[field]) {
      setErrores(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6 safe-top safe-bottom lg:pt-6 pt-16">
      <div className="max-w-2xl mx-auto">
        <div className="card">
          {/* Header */}
          <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <button 
                onClick={onCancel} 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-target flex-shrink-0"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                  {cliente ? 'Editar Cliente' : 'Nuevo Cliente'}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500">
                  {cliente ? 'Modifica la información del cliente' : 'Completa los datos del nuevo cliente'}
                </p>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <div className="p-3 sm:p-4 lg:p-6">
            <div className="space-y-4 sm:space-y-6">
              {/* Nombres */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <FormInput
                    label="Nombre"
                    value={formData.nombre}
                    onChange={(value) => handleInputChange('nombre', value)}
                    placeholder="Ingrese el nombre"
                    required
                    error={errores.nombre}
                  />
                </div>
                <div>
                  <FormInput
                    label="Apellido"
                    value={formData.apellido}
                    onChange={(value) => handleInputChange('apellido', value)}
                    placeholder="Ingrese el apellido"
                    required
                    error={errores.apellido}
                  />
                </div>
              </div>

              {/* Contacto */}
              <FormInput
                label="Teléfono"
                type="tel"
                value={formData.telefono}
                onChange={(value) => handleInputChange('telefono', value)}
                placeholder="+54 9 11 1234-5678"
                required
                error={errores.telefono}
              />

              <FormInput
                label="DNI"
                value={formData.dni}
                onChange={(value) => handleInputChange('dni', value)}
                placeholder="12.345.678"
                required
                error={errores.dni}
              />

              <FormInput
                label="Dirección"
                value={formData.direccion}
                onChange={(value) => handleInputChange('direccion', value)}
                placeholder="Av. Corrientes 1234, CABA"
                required
                error={errores.direccion}
              />

              {/* Tipo de cliente */}
              <FormSelect
                label="Tipo de Cliente"
                value={formData.tipoCliente}
                onChange={(value) => handleInputChange('tipoCliente', value)}
                options={[
                  { value: '', label: 'Seleccionar tipo de cliente' },
                  { value: 'operaciones', label: 'Cliente de Operaciones' },
                  { value: 'prestamistas', label: 'Cliente Prestamista' }
                ]}
                required
                error={errores.tipoCliente}
              />

              {/* Información adicional */}
              <div className="bg-primary-50 p-3 sm:p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <Bell size={14} className="text-primary-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs sm:text-sm text-primary-700">
                    <p className="font-medium mb-1">Información automática</p>
                    <p>Las métricas de frecuencia de operación, última operación y volumen total se calcularán automáticamente basándose en el historial de movimientos.</p>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col gap-3 pt-4 border-t border-gray-200 sm:flex-row">
                <button 
                  onClick={onCancel} 
                  className="btn-secondary flex-1 touch-target"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSubmit} 
                  className="btn-primary flex-1 touch-target"
                >
                  {cliente ? 'Actualizar Cliente' : 'Crear Cliente'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** COMPONENTE ANALYTICS DE CLIENTE */
function AnalyticsCliente({ cliente, onBack, calcularFrecuencia }) {
  const getRecomendacion = () => {
    if (!cliente.ultimaOperacion) return 'Contactar para establecer primera operación';

    const dias = Math.floor((new Date() - new Date(cliente.ultimaOperacion)) / (1000 * 60 * 60 * 24));
    const frecuencia = calcularFrecuencia(cliente);

    if (dias > frecuencia * 1.5) return 'Contactar urgentemente - Cliente inactivo por mucho tiempo';
    if (dias > frecuencia) return 'Contactar pronto - Se está retrasando según su patrón habitual';
    return 'Cliente activo - Seguimiento normal según frecuencia esperada';
  };

  const frecuencia = calcularFrecuencia(cliente);
  const recomendacion = getRecomendacion();

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6 safe-top safe-bottom lg:pt-6 pt-16">
      <div className="max-w-6xl mx-auto">
        <div className="card">
          {/* Header */}
          <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <button 
                onClick={onBack} 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-target flex-shrink-0"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                  Análisis de {cliente.nombre} {cliente.apellido}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500">
                  Métricas y patrones de comportamiento del cliente
                </p>
              </div>
            </div>
          </div>

          {/* Analytics */}
          <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
            {/* Métricas principales */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-primary-50 rounded-lg p-3 sm:p-4">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary-600 truncate">
                  {cliente.totalOperaciones || 0}
                </div>
                <div className="text-xs sm:text-sm text-primary-600 font-medium">Operaciones Totales</div>
              </div>

              <div className="bg-success-50 rounded-lg p-3 sm:p-4">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-success-600 truncate">
                  ${(cliente.volumenTotal || 0).toLocaleString()}
                </div>
                <div className="text-xs sm:text-sm text-success-600 font-medium">Volumen Total</div>
              </div>

              <div className="bg-warning-50 rounded-lg p-3 sm:p-4">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-warning-600">
                  {frecuencia}
                </div>
                <div className="text-xs sm:text-sm text-warning-600 font-medium">Días de Frecuencia</div>
              </div>

              <div className="bg-error-50 rounded-lg p-3 sm:p-4">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-error-600 truncate">
                  {cliente.ultimaOperacion ? 
                    Math.floor((new Date() - new Date(cliente.ultimaOperacion)) / (1000 * 60 * 60 * 24)) : 
                    'N/A'
                  }
                </div>
                <div className="text-xs sm:text-sm text-error-600 font-medium">Días Desde Última Op.</div>
              </div>
            </div>

            {/* Análisis de frecuencia */}
            <div className="bg-warning-50 rounded-lg p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <TrendingUp size={16} className="text-warning-600 flex-shrink-0" />
                <span className="font-semibold text-gray-900 text-sm sm:text-base">Patrón de Operaciones</span>
              </div>
              <p className="text-xs sm:text-sm text-warning-700">
                <strong>Frecuencia calculada:</strong> Este cliente opera cada <strong>{frecuencia} días</strong> en promedio.
                {cliente.operaciones && cliente.operaciones.length > 1 && (
                  <span> (Basado en {cliente.operaciones.length} operaciones históricas)</span>
                )}
              </p>
            </div>

            {/* Recomendaciones */}
            <div className="bg-primary-50 rounded-lg p-3 sm:p-4">
              <div className="flex items-start gap-2">
                <Bell size={16} className="text-primary-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-gray-900 block mb-1 sm:mb-2 text-sm sm:text-base">Recomendación de Contacto</span>
                  <p className="text-xs sm:text-sm text-primary-700">{recomendacion}</p>
                </div>
              </div>
            </div>

            {/* Información del cliente */}
            <div className="border-t pt-4 sm:pt-6">
              <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Información de Contacto</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-gray-400 flex-shrink-0" />
                  <span className="truncate"><strong>Teléfono:</strong> {cliente.telefono}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard size={14} className="text-gray-400 flex-shrink-0" />
                  <span className="truncate"><strong>DNI:</strong> {cliente.dni}</span>
                </div>
                <div className="flex items-center gap-2 sm:col-span-2">
                  <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                  <span className="truncate"><strong>Dirección:</strong> {cliente.direccion}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClientesApp;
export { ClienteCard, FormularioCliente, AnalyticsCliente };