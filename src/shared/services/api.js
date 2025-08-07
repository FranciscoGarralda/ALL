// Servicio API para comunicarse con el backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.token = null;
    this.loadToken();
  }

  // Cargar token del localStorage al iniciar
  loadToken() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  // Guardar token
  setToken(token) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  // Obtener token actual
  getToken() {
    return this.token;
  }

  // Método base para todas las peticiones
  async request(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    // Agregar token si existe
    const token = this.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en la solicitud');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // ===== MÉTODOS DE AUTENTICACIÓN =====
  
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async updatePassword(currentPassword, newPassword) {
    return this.request('/auth/updatepassword', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  logout() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  // ===== MÉTODOS DE MOVIMIENTOS =====
  
  async getMovements(filters = {}) {
    // TEMPORAL: Usar endpoint público
    const query = new URLSearchParams(filters).toString();
    const url = `/public/movements?${query}`;
    
    try {
      const response = await fetch(`${this.baseURL}${url}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar movimientos');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async getMovement(id) {
    return this.request(`/movements/${id}`);
  }

  async createMovement(data) {
    return this.request('/movements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMovement(id, data) {
    return this.request(`/movements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteMovement(id) {
    return this.request(`/movements/${id}`, {
      method: 'DELETE',
    });
  }

  async getMovementStats() {
    return this.request('/movements/stats/summary');
  }

  // ===== MÉTODOS DE CLIENTES =====
  
  async getClients(filters = {}) {
    const query = new URLSearchParams(filters).toString();
    return this.request(`/clients?${query}`);
  }

  async getClient(id) {
    return this.request(`/clients/${id}`);
  }

  async createClient(data) {
    return this.request('/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateClient(id, data) {
    return this.request(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteClient(id) {
    return this.request(`/clients/${id}`, {
      method: 'DELETE',
    });
  }

  // ===== MÉTODOS DE USUARIOS (ADMIN) =====
  
  async getUsers() {
    return this.request('/users');
  }

  async getUser(id) {
    return this.request(`/users/${id}`);
  }

  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id, userData) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async toggleUserStatus(id, isActive) {
    return this.request(`/users/${id}/activate`, {
      method: 'PUT',
      body: JSON.stringify({ isActive }),
    });
  }

  async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // ===== MÉTODO DE SALUD =====
  
  async checkHealth() {
    return this.request('/health');
  }
}

// Exportar una instancia única (singleton)
const apiService = new ApiService();
export default apiService;