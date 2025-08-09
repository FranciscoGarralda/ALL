const https = require('https');

console.log('🔍 Verificando estado del backend en Railway...\n');

const checkDeployment = () => {
  const options = {
    hostname: 'all-production-31a3.up.railway.app',
    path: '/api/health',
    method: 'GET',
    timeout: 10000
  };

  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log('✅ Backend está ACTIVO en Railway');
        console.log('📍 URL: https://all-production-31a3.up.railway.app');
        console.log('🔄 Estado:', data);
        
        // Verificar versión
        checkVersion();
      } else {
        console.log('⚠️ Backend respondió con código:', res.statusCode);
        console.log('Respuesta:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Error al conectar con Railway:', error.message);
    console.log('\nPosibles causas:');
    console.log('1. El servidor está iniciándose (espera 2-3 minutos)');
    console.log('2. Railway está desplegando cambios');
    console.log('3. El servidor está dormido (se despertará automáticamente)');
  });

  req.on('timeout', () => {
    req.destroy();
    console.error('⏱️ Timeout - El servidor está tardando en responder');
    console.log('Esto es normal si Railway está desplegando o el servidor está dormido');
  });

  req.end();
};

const checkVersion = () => {
  // Verificar si tiene los últimos cambios
  const options = {
    hostname: 'all-production-31a3.up.railway.app',
    path: '/api/system/status',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer dummy' // Solo para verificar que el endpoint existe
    },
    timeout: 5000
  };

  const req = https.request(options, (res) => {
    if (res.statusCode === 401) {
      console.log('\n✅ Endpoint de sistema existe (requiere autenticación)');
      console.log('📦 El backend tiene las últimas actualizaciones');
    } else if (res.statusCode === 404) {
      console.log('\n⚠️ El backend NO tiene las últimas actualizaciones');
      console.log('🔄 Railway debería actualizar automáticamente en 2-3 minutos');
    }
  });

  req.on('error', () => {
    // Ignorar errores en esta verificación
  });

  req.end();
};

// Información sobre Railway
console.log('📌 INFORMACIÓN DE RAILWAY:');
console.log('- Railway despliega automáticamente cuando haces push a GitHub');
console.log('- El despliegue tarda entre 2-5 minutos');
console.log('- En plan gratuito, el servidor se duerme después de inactividad');
console.log('- Se despierta automáticamente con el primer request\n');

// Ejecutar verificación
checkDeployment();