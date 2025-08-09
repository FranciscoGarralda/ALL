const { checkDatabaseHealth, initializeDatabase } = require('../config/database-init');

let isHealthy = true;
let lastCheck = 0;
const CHECK_INTERVAL = 60000; // Verificar cada minuto

const databaseCheckMiddleware = async (req, res, next) => {
  // Para Railway pago, simplificar el middleware
  if (global.dbReady) {
    return next();
  }
  
  // Si es health check, dejar pasar siempre
  if (req.path === '/api/health') {
    return next();
  }
  
  // Si la DB no está lista, esperar un poco
  if (!global.dbReady) {
    // Dar 5 segundos para que la DB se inicialice
    const startTime = Date.now();
    while (!global.dbReady && (Date.now() - startTime) < 5000) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (!global.dbReady) {
      return res.status(503).json({
        success: false,
        message: 'Base de datos iniciándose. Por favor intenta en unos segundos.'
      });
    }
  }
  
  next();
};

module.exports = databaseCheckMiddleware;