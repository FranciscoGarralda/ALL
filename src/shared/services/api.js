// API Service para conectar con el backend
class ApiService {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://all-production-31a3.up.railway.app';
    this.token = null;
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
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // Manejo de respuestas
  async handleResponse(response) {
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error en la petición');
    }
    
    return data;
  }

  // AUTH ENDPOINTS
  async login(username, password) {
    const response = await fetch(`${this.baseURL}/api/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ username, password })
    });
    
    const data = await this.handleResponse(response);
    
    if (data.token) {
      this.setToken(data.token);
    }
    
    return data;
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
    const response = await fetch(`${this.baseURL}/api/movements`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(movementData)
    });
    
    return this.handleResponse(response);
  }

  async updateMovement(id, movementData) {
    const response = await fetch(`${this.baseURL}/api/movements/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(movementData)
    });
    
    return this.handleResponse(response);
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
    
    return this.handleResponse(response);
  }

  async updateClient(id, clientData) {
    const response = await fetch(`${this.baseURL}/api/clients/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(clientData)
    });
    
    return this.handleResponse(response);
  }

  async deleteClient(id) {
    const response = await fetch(`${this.baseURL}/api/clients/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    
    return this.handleResponse(response);
  }
}

// Exportar instancia única
const apiService = new ApiService();
export default apiService;