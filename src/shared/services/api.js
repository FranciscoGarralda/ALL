// API Service para conectar con el backend
import { cacheService } from './cache';

class ApiService {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    this.token = null;
    this.abortController = null;
    this.loadToken();
  }

  // Cargar token desde localStorage
  loadToken() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('authToken');
    }
  }

  // Guardar token
  setToken(token) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  }

  // Limpiar token
  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  }

  // Headers por defecto
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // console.log('API: Token actual:', this.token);
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    // console.log('API: Headers finales:', headers);
    
    return headers;
  }

  // Manejo de respuestas
  async handleResponse(response) {
    let data;
    try {
      data = await response.json();
    } catch (e) {
      // Si no hay JSON en la respuesta
      data = { message: 'Error en el servidor' };
    }
    
    if (!response.ok) {
      const error = new Error(data.message || 'Error en la petición');
      error.response = { data, status: response.status };
      throw error;
    }
    
    return data;
  }

  // AUTH ENDPOINTS
  async login(username, password) {
    try {
      // Aumentar timeout a 30 segundos para Railway
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      // console.log('Intentando login con:', { username, baseURL: this.baseURL });
      
      const response = await fetch(`${this.baseURL}/api/auth/login`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ username, password }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const data = await this.handleResponse(response);
      
      if (data.token) {
        this.setToken(data.token);
      }
      
      return data;
    } catch (error) {
      console.error('Error en login:', error);
      
      if (error.name === 'AbortError') {
        throw new Error('El servidor está tardando en responder. Por favor intenta en unos segundos.');
      }
      
      if (error.message?.includes('Failed to fetch')) {
        throw new Error('No se puede conectar al servidor. Verifica tu conexión.');
      }
      
      throw error;
    }
  }

  async logout() {
    this.clearToken();
    return { success: true };
  }

  async getMe() {
    const response = await fetch(`${this.baseURL}/api/auth/me`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    
    return this.handleResponse(response);
  }

  // MOVEMENTS ENDPOINTS
  async getMovements(filters = {}) {
    const queryString = new URLSearchParams(filters).toString();
    const response = await fetch(`${this.baseURL}/api/movements?${queryString}`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    
    const data = await this.handleResponse(response);
    return data.data || [];
  }

  async createMovement(movementData) {
    // console.log('API: Creando movimiento con datos:', movementData);
    
    const response = await fetch(`${this.baseURL}/api/movements`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(movementData)
    });
    
    // console.log('API: Response status:', response.status);
    
    const result = await this.handleResponse(response);
    // console.log('API: Resultado:', result);
    
    return result.data || result;
  }

  async updateMovement(id, movementData) {
    const response = await fetch(`${this.baseURL}/api/movements/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(movementData)
    });
    
    const result = await this.handleResponse(response);
    return result.data || result;
  }

  async deleteMovement(id) {
    const response = await fetch(`${this.baseURL}/api/movements/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    
    return this.handleResponse(response);
  }

  // CLIENTS ENDPOINTS
  async getClients(filters = {}) {
    const queryString = new URLSearchParams(filters).toString();
    const response = await fetch(`${this.baseURL}/api/clients?${queryString}`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    
    const data = await this.handleResponse(response);
    return data.data || [];
  }

  async createClient(clientData) {
    const response = await fetch(`${this.baseURL}/api/clients`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(clientData)
    });
    
    const result = await this.handleResponse(response);
    return result.data || result;
  }

  async updateClient(id, clientData) {
    const response = await fetch(`${this.baseURL}/api/clients/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(clientData)
    });
    
    const result = await this.handleResponse(response);
    return result.data || result;
  }

  async deleteClient(id) {
    const response = await fetch(`${this.baseURL}/api/clients/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    
    return this.handleResponse(response);
  }

  // USER MANAGEMENT ENDPOINTS
  async getUsers() {
    const response = await fetch(`${this.baseURL}/api/users`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    
    const data = await this.handleResponse(response);
    return data.data || [];
  }

  async createUser(userData) {
    const response = await fetch(`${this.baseURL}/api/users`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(userData)
    });
    
    return this.handleResponse(response);
  }

  async updateUser(id, userData) {
    const response = await fetch(`${this.baseURL}/api/users/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(userData)
    });
    
    return this.handleResponse(response);
  }

  async deleteUser(id) {
    const response = await fetch(`${this.baseURL}/api/users/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    
    return this.handleResponse(response);
  }
}

// Exportar instancia única
const apiService = new ApiService();
export default apiService;