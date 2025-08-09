// Servicio de precarga para mejorar el rendimiento inicial
export const preloadService = {
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
  },

  // Precargar fuentes y recursos
  preloadResources() {
    if (typeof window === 'undefined') return;
    
    // Preconectar a la API
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = 'https://all-production-31a3.up.railway.app';
    document.head.appendChild(link);
    
    // DNS prefetch
    const dnsPrefetch = document.createElement('link');
    dnsPrefetch.rel = 'dns-prefetch';
    dnsPrefetch.href = 'https://all-production-31a3.up.railway.app';
    document.head.appendChild(dnsPrefetch);
  },

  // Inicializar todo
  init() {
    this.preloadResources();
    this.preloadComponents();
  }
};