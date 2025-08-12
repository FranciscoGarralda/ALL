/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // ESLint con configuración relajada
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // Optimizaciones de producción
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // Optimizaciones de rendimiento
  compress: true,
  poweredByHeader: false,
  
  // Optimización de imágenes
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  
  // Headers de seguridad
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
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