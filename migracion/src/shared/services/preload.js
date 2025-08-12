// Preload Service - Optimiza la carga inicial
class PreloadService {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    this.preloaded = new Set();
  }

  // Precargar recursos críticos
  preloadCriticalResources() {
    if (typeof window === 'undefined') return;

    // Preconectar al backend
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = this.baseURL;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);

    // DNS prefetch como fallback
    const dnsPrefetch = document.createElement('link');
    dnsPrefetch.rel = 'dns-prefetch';
    dnsPrefetch.href = this.baseURL;
    document.head.appendChild(dnsPrefetch);

    // Precargar fuentes críticas
    this.preloadFonts();
  }

  // Precargar componentes críticos
  preloadComponents() {
    if (typeof window === 'undefined') return;
    
    // Precargar componentes más usados
    const componentsToPreload = [
      () => import('../../features/financial-operations/FinancialOperationsApp'),
      () => import('../../features/movements/MovimientosApp'),
      () => import('../../features/clients/ClientesApp')
    ];
    
    // Cargar en segundo plano después de 2 segundos
    setTimeout(() => {
      componentsToPreload.forEach(load => {
        load().catch(() => {}); // Ignorar errores de precarga
      });
    }, 2000);
  }

  // Precargar fuentes
  preloadFonts() {
    // Aquí se pueden agregar fuentes críticas si se necesitan
  }

  // Inicializar todo
  init() {
    this.preloadCriticalResources();
    this.preloadComponents();
  }
}

// Exportar instancia única
const preloadService = new PreloadService();
export default preloadService;