import React, { useState, useEffect } from 'react';
import { User, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { apiService } from '../../shared/services';

const LoginPage = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [serverAwake, setServerAwake] = useState(true); // Cambiar a true por defecto

  useEffect(() => {
    // No intentar despertar el servidor
    setServerAwake(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validación local para funcionar sin backend
      if (formData.username === 'admin' && formData.password === 'garralda1') {
        // Simular respuesta exitosa
        const mockUser = {
          id: 1,
          name: 'Administrador',
          username: 'admin',
          email: 'admin@alliance.com',
          role: 'admin',
          permissions: ['all']
        };
        
        // Generar un token mock
        const mockToken = 'mock-token-' + Date.now();
        
        // Guardar en localStorage
        localStorage.setItem('authToken', mockToken);
        localStorage.setItem('currentUser', JSON.stringify(mockUser));
        
        // Llamar onLogin con los datos mock
        onLogin({
          success: true,
          token: mockToken,
          user: mockUser
        });
        
        return;
      }
      
      // Si no coinciden las credenciales locales, intentar con el backend
      const response = await apiService.login(formData.username, formData.password);
      
      if (response.success) {
        onLogin(response);
      } else {
        // Si el backend no responde, verificar credenciales locales
        if (formData.username === 'admin' && formData.password === 'garralda1') {
          // Login local exitoso
          const mockUser = {
            id: 1,
            name: 'Administrador',
            username: 'admin',
            email: 'admin@alliance.com',
            role: 'admin',
            permissions: ['all']
          };
          
          const mockToken = 'mock-token-' + Date.now();
          localStorage.setItem('authToken', mockToken);
          localStorage.setItem('currentUser', JSON.stringify(mockUser));
          
          onLogin({
            success: true,
            token: mockToken,
            user: mockUser
          });
        } else {
          setError('Usuario o contraseña incorrectos');
        }
      }
    } catch (err) {
      // Si hay error de conexión, usar validación local
      if (formData.username === 'admin' && formData.password === 'garralda1') {
        const mockUser = {
          id: 1,
          name: 'Administrador',
          username: 'admin',
          email: 'admin@alliance.com',
          role: 'admin',
          permissions: ['all']
        };
        
        const mockToken = 'mock-token-' + Date.now();
        localStorage.setItem('authToken', mockToken);
        localStorage.setItem('currentUser', JSON.stringify(mockUser));
        
        onLogin({
          success: true,
          token: mockToken,
          user: mockUser
        });
      } else {
        setError('Usuario o contraseña incorrectos');
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
          <p className="text-center text-gray-600 mb-6">Alliance F&R</p>
          
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