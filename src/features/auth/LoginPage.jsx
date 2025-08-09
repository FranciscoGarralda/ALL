import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { apiService } from '../../shared/services';
import { serverWakeService } from '../../shared/services/server-wake';

export default function LoginPage({ onLoginSuccess }) {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverAwake, setServerAwake] = useState(false);
  
  // Despertar servidor al cargar la página
  useEffect(() => {
    serverWakeService.wakeServer()
      .then(() => setServerAwake(true))
      .catch(err => setError('El servidor está iniciándose. Por favor espera unos segundos.'));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validación básica
    if (!formData.username || !formData.password) {
      setError('Por favor ingresa usuario y contraseña');
      return;
    }
    
    setLoading(true);

    try {
      // Asegurarse de que el servidor esté despierto
      if (!serverAwake) {
        setError('Conectando con el servidor...');
        await serverWakeService.wakeServer();
        setServerAwake(true);
        setError('');
      }
      
              const response = await apiService.login(formData.username, formData.password);
        
        if (response.success) {
          console.log('Login exitoso, usuario:', response.user);
          console.log('Permisos recibidos:', response.user.permissions);
          onLoginSuccess(response.user);
        } else {
        // Mensajes de error más específicos
        if (response.message?.includes('credentials')) {
          setError('Usuario o contraseña incorrectos');
        } else if (response.message?.includes('not found')) {
          setError('Usuario no encontrado');
        } else {
          setError(response.message || 'Error al iniciar sesión. Intenta nuevamente.');
        }
      }
    } catch (err) {
      console.error('Error de login:', err);
      
      // Manejo específico de errores
      if (err.message?.includes('Failed to fetch')) {
        setError('Error de conexión. Verifica tu internet.');
      } else if (err.message?.includes('credentials')) {
        setError('Usuario o contraseña incorrectos');
      } else {
        setError('Error al iniciar sesión. Intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Sistema Financiero
          </h2>
          
          {!serverAwake && !error && (
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 text-sm text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-600"></div>
                Conectando con el servidor...
              </div>
            </div>
          )}
          
          {serverAwake && (
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 text-sm text-green-600">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                Servidor conectado
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center justify-between">
                <span>{error}</span>
                <button
                  type="button"
                  onClick={() => setError('')}
                  className="text-red-400 hover:text-red-600"
                >
                  ✕
                </button>
              </div>
            )}
            
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Usuario (no email)
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                autoFocus
                value={formData.username}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                placeholder="Ingresa tu usuario"
                disabled={loading}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 pr-10"
                  placeholder="Ingresa tu contraseña"
                  disabled={loading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !loading) {
                      handleSubmit(e);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gray-900 hover:bg-gray-800'
              }`}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}