// Servicio para despertar el servidor de Railway
class ServerWakeService {
  constructor() {
    this.baseURL = 'https://all-production-31a3.up.railway.app';
    this.isAwake = false;
    this.wakePromise = null;
  }

  async wakeServer() {
    // Si ya está despierto, no hacer nada
    if (this.isAwake) return true;
    
    // Si ya hay un intento en progreso, esperar
    if (this.wakePromise) return this.wakePromise;
    
    // Intentar despertar el servidor
    this.wakePromise = this._attemptWake();
    return this.wakePromise;
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
        this.isAwake = true;
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
          this.isAwake = true;
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
    this.isAwake = false;
    this.wakePromise = null;
  }
}

export const serverWakeService = new ServerWakeService();