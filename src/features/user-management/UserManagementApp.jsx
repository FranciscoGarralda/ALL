import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Edit3,
  Trash2,
  Shield,
  Eye,
  EyeOff,
  Save,
  X,
  Check,
  AlertCircle
} from 'lucide-react';
import { apiService } from '../../shared/services';

// Módulos disponibles en el sistema
const SYSTEM_MODULES = [
  { id: 'operaciones', name: 'Operaciones Financieras', icon: '💰' },
  { id: 'clientes', name: 'Clientes', icon: '👥' },
  { id: 'movimientos', name: 'Movimientos', icon: '📊' },
  { id: 'pendientes', name: 'Pendientes de Retiro', icon: '⏰' },
  { id: 'gastos', name: 'Gastos', icon: '📝' },
  { id: 'cuentas-corrientes', name: 'Cuentas Corrientes', icon: '🏢' },
  { id: 'prestamistas', name: 'Prestamistas', icon: '💳' },
  { id: 'comisiones', name: 'Comisiones', icon: '💵' },
  { id: 'utilidad', name: 'Utilidad', icon: '📈' },
  { id: 'arbitraje', name: 'Arbitraje', icon: '🔄' },
  { id: 'saldos', name: 'Saldos', icon: '💼' },
  { id: 'caja', name: 'Caja Diaria', icon: '🧮' },
  { id: 'rentabilidad', name: 'Rentabilidad', icon: '📊' },
  { id: 'stock', name: 'Stock', icon: '📦' },
  { id: 'saldos-iniciales', name: 'Saldos Iniciales', icon: '⚙️' }
];

const ROLES = [
  { id: 'admin', name: 'Administrador', description: 'Acceso total al sistema' },
  { id: 'operator', name: 'Operador', description: 'Acceso a operaciones y consultas' },
  { id: 'viewer', name: 'Visualizador', description: 'Solo lectura' }
];

function UserManagementApp() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'operator',
    permissions: [],
    active: true
  });

  useEffect(() => {
    loadUsers();
  }, []);
  
  // Auto-reparar si hay error de base de datos
  useEffect(() => {
    if (error && (error.includes('relation') || error.includes('does not exist') || error.includes('500'))) {
      console.log('🔧 Error detectado, intentando auto-reparación...');
      setTimeout(() => {
        fixUserSystem();
      }, 1000);
    }
  }, [error]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUsers();
      setUsers(response);
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validaciones básicas
    if (!formData.name || !formData.email) {
      setError('Nombre y email son requeridos');
      return;
    }

    if (!editingUser && !formData.password) {
      setError('La contraseña es requerida para nuevos usuarios');
      return;
    }

    setSaving(true);
    try {
      if (editingUser) {
        const updateData = { ...formData };
        // No enviar password vacío en actualización
        if (!updateData.password) {
          delete updateData.password;
        }
        await apiService.updateUser(editingUser.id, updateData);
        setSuccess('Usuario actualizado correctamente');
      } else {
        await apiService.createUser(formData);
        setSuccess('Usuario creado correctamente');
      }
      
      await loadUsers();
      resetForm();
    } catch (error) {
      console.error('Error saving user:', error);
      // Mejor manejo de errores del backend
      if (error.response?.data?.message) {
        setError(error.response.data.message);
        // Si el error indica que necesita reparación
        if (error.response?.data?.requiresFix) {
          setShowFixButton(true);
        }
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('Error al guardar usuario. Por favor, intente nuevamente.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;

    try {
      await apiService.deleteUser(userId);
      setSuccess('Usuario eliminado correctamente');
      await loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Error al eliminar usuario');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Don't show existing password
      role: user.role,
      permissions: user.permissions || [],
      active: user.active !== false
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'operator',
      permissions: [],
      active: true
    });
    setEditingUser(null);
    setShowForm(false);
  };

  const togglePermission = (moduleId) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(moduleId)
        ? prev.permissions.filter(p => p !== moduleId)
        : [...prev.permissions, moduleId]
    }));
  };

  const selectAllPermissions = () => {
    setFormData(prev => ({
      ...prev,
      permissions: SYSTEM_MODULES.map(m => m.id)
    }));
  };

  const clearAllPermissions = () => {
    setFormData(prev => ({
      ...prev,
      permissions: []
    }));
  };

  const fixUserSystem = async () => {
    try {
      setError('');
      setSuccess('Ejecutando verificación del sistema...');
      
      // Usar el método interno de apiService para obtener headers
      const token = localStorage.getItem('token');
      const response = await fetch('https://all-production-31a3.up.railway.app/api/system/fix-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Sistema reparado correctamente. Recargando usuarios...');
        await loadUsers();
        setError('');
      } else {
        setError(data.message || 'Error al reparar el sistema');
      }
    } catch (error) {
      console.error('Error fixing system:', error);
      setError('Error al ejecutar la reparación del sistema');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-soft p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-gray-800" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
                <p className="text-sm text-gray-600">Administra usuarios y permisos del sistema</p>
              </div>
            </div>
            {!showForm && (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowForm(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus size={18} />
                  Nuevo Usuario
                </button>
                {error && (
                  <button
                    onClick={fixUserSystem}
                    className="btn-secondary flex items-center gap-2 animate-pulse"
                    title="Reparar sistema automáticamente"
                  >
                    <Shield size={18} />
                    Reparar Sistema
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
            <AlertCircle size={18} />
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
            <Check size={18} />
            {success}
          </div>
        )}

        {/* User Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-soft p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">
              {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña {editingUser && '(dejar vacío para mantener actual)'}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="form-input"
                    required={!editingUser}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rol
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="form-select"
                  >
                    {ROLES.map(role => (
                      <option key={role.id} value={role.id}>
                        {role.name} - {role.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Permissions */}
              {formData.role !== 'admin' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Permisos de Acceso
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={selectAllPermissions}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        Seleccionar todos
                      </button>
                      <span className="text-gray-400">|</span>
                      <button
                        type="button"
                        onClick={clearAllPermissions}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Limpiar todos
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-lg max-h-96 overflow-y-auto">
                    {SYSTEM_MODULES.map(module => (
                      <label
                        key={module.id}
                        className="flex items-center gap-2 p-3 hover:bg-white rounded-lg cursor-pointer transition-colors bg-white border border-gray-200"
                      >
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(module.id)}
                          onChange={() => togglePermission(module.id)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                        />
                        <span className="text-sm flex-shrink-0">{module.icon}</span>
                        <span className="text-sm text-gray-700 truncate">{module.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Status */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="active" className="text-sm text-gray-700">
                  Usuario activo
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      {editingUser ? 'Actualizar' : 'Crear'} Usuario
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Users List */}
        <div className="bg-white rounded-xl shadow-soft overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Usuarios del Sistema</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Cargando usuarios...
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No hay usuarios registrados
            </div>
          ) : (
            <>
              {/* Vista móvil */}
              <div className="lg:hidden">
                {users.map(user => (
                  <div key={user.id} className="p-4 border-b border-gray-200 last:border-b-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{user.name}</h3>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Rol:</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800'
                            : user.role === 'operator'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          <Shield size={12} className="mr-1" />
                          {ROLES.find(r => r.id === user.role)?.name || user.role}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Estado:</span>
                        {user.active !== false ? (
                          <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                            <Check size={14} />
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-600 text-sm">
                            <X size={14} />
                            Inactivo
                          </span>
                        )}
                      </div>
                      
                      {user.role !== 'admin' && user.permissions && user.permissions.length > 0 && (
                        <div>
                          <span className="text-sm text-gray-500">Permisos:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {user.permissions?.map(perm => {
                              const module = SYSTEM_MODULES.find(m => m.id === perm);
                              return module ? (
                                <span
                                  key={perm}
                                  className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
                                >
                                  {module.icon} {module.name}
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Vista desktop */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Permisos
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {user.email}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800'
                            : user.role === 'operator'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          <Shield size={12} className="mr-1" />
                          {ROLES.find(r => r.id === user.role)?.name || user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {user.role === 'admin' ? (
                          <span className="text-sm text-gray-500">Acceso total</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {user.permissions?.slice(0, 3).map(perm => {
                              const module = SYSTEM_MODULES.find(m => m.id === perm);
                              return module ? (
                                <span
                                  key={perm}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700"
                                  title={module.name}
                                >
                                  {module.icon}
                                </span>
                              ) : null;
                            })}
                            {user.permissions?.length > 3 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
                                +{user.permissions.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {user.active !== false ? (
                          <span className="inline-flex items-center gap-1 text-green-600">
                            <Check size={16} />
                            <span className="text-sm">Activo</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-600">
                            <X size={16} />
                            <span className="text-sm">Inactivo</span>
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserManagementApp;