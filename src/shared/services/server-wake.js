// Server Wake Service - Mantiene el servidor activo
class ServerWakeService {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    this.isWaking = false;
    this.retryCount = 0;
    this.maxRetries = 3;
  }

  async wakeServer() {
    if (this.isWaking) {
      return this.wakePromise;
    }
    
    this.isWaking = true;
    this.wakePromise = this._performWake();
    
    try {
      const result = await this.wakePromise;
      return result;
    } finally {
      this.isWaking = false;
      this.wakePromise = null;
    }
  }

  async _performWake() {
    // Intentar despertar el servidor
    return this._attemptWake();
  }

  async _attemptWake() {
    console.log('🔄 Despertando servidor Railway...');
    
    try {
      // Hacer ping al endpoint de health
      const response = await fetch(`${this.baseURL}/api/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 segundos para el ping
      });
      
      if (response.ok) {
        console.log('✅ Servidor activo');
        return true;
      }
    } catch (error) {
      console.log('⏳ Servidor iniciándose...');
    }
    
    // Si falla, intentar nuevamente
    let attempts = 0;
    const maxAttempts = 6; // 30 segundos total
    
    while (attempts < maxAttempts) {
      attempts++;
      
      try {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Esperar 5 segundos
        
        const response = await fetch(`${this.baseURL}/api/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        });
        
        if (response.ok) {
          console.log('✅ Servidor listo después de', attempts * 5, 'segundos');
          return true;
        }
      } catch (error) {
        console.log(`⏳ Intento ${attempts}/${maxAttempts}...`);
      }
    }
    
    throw new Error('El servidor no responde. Por favor intenta más tarde.');
  }

  reset() {

  }
}

export const serverWakeService = new ServerWakeService();