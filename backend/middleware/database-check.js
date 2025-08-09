const { checkDatabaseHealth, initializeDatabase } = require('../config/database-init');

let isHealthy = true;
let lastCheck = 0;
const CHECK_INTERVAL = 60000; // Verificar cada minuto

const databaseCheckMiddleware = async (req, res, next) => {
  try {
    // Solo verificar periódicamente, no en cada request
    const now = Date.now();
    if (now - lastCheck > CHECK_INTERVAL) {
      lastCheck = now;
      const health = await checkDatabaseHealth();
      isHealthy = health.healthy;
      
      if (!isHealthy) {
        console.log('⚠️ Base de datos no saludable, intentando reparar...');
        try {
          await initializeDatabase();
          isHealthy = true;
          console.log('✅ Base de datos reparada automáticamente');
        } catch (error) {
          console.error('❌ No se pudo reparar la base de datos:', error);
        }
      }
    }
    
    // Si la base de datos no está saludable, intentar repararla
    if (!isHealthy) {
      // Para endpoints críticos, intentar reparar inmediatamente
      if (req.path.includes('/users') || req.path.includes('/auth')) {
        console.log('🔧 Intentando reparación de emergencia...');
        await initializeDatabase();
        isHealthy = true;
      }
    }
    
    next();
  } catch (error) {
    console.error('Error en middleware de verificación:', error);
    next(); // Continuar aunque falle la verificación
  }
};

module.exports = databaseCheckMiddleware;