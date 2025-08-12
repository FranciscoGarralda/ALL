/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false, // Deshabilitado temporalmente para evitar problemas
  
  // ESLint con configuración relajada
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // Optimizaciones de producción - DESHABILITADAS temporalmente para debugging
  compiler: {
    removeConsole: false, // Mantener console.log para debugging
  },
  
  // Optimizaciones de rendimiento
  compress: true,
  poweredByHeader: false,
  
  // Optimización de imágenes
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  
  // Headers de seguridad - SIMPLIFICADOS para evitar problemas de CSP
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          }
        ],
      },
    ]
  },
  
  // Configuración de webpack para mejor manejo de chunks
  webpack: (config, { isServer }) => {
    // Ignorar warnings de módulos
    config.ignoreWarnings = [
      { module: /node_modules/ },
    ];
    
    // Optimizaciones de producción
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true
            }
          }
        }
      };
    }
    
    return config;
  },
  
  // Generar build ID único para evitar cache
  generateBuildId: async () => {
    return Date.now().toString();
  },
};

module.exports = nextConfig;