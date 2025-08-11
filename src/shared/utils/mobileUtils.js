/**
 * Utilidades para mejorar la experiencia móvil
 */

// Detectar si es un dispositivo móvil
export const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  ) || window.innerWidth < 768;
};

// Detectar si es iOS
export const isIOS = () => {
  if (typeof window === 'undefined') return false;
  
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
};

// Prevenir scroll del body cuando un modal está abierto
export const lockBodyScroll = () => {
  if (typeof document === 'undefined') return;
  
  const scrollY = window.scrollY;
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollY}px`;
  document.body.style.width = '100%';
};

// Restaurar scroll del body
export const unlockBodyScroll = () => {
  if (typeof document === 'undefined') return;
  
  const scrollY = document.body.style.top;
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  window.scrollTo(0, parseInt(scrollY || '0') * -1);
};

// Mejorar el focus en inputs para móvil
export const focusWithKeyboard = (element) => {
  if (!element) return;
  
  // En iOS, necesitamos un pequeño delay
  if (isIOS()) {
    setTimeout(() => {
      element.focus();
      // Scroll al elemento
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  } else {
    element.focus();
  }
};

// Detectar orientación
export const getOrientation = () => {
  if (typeof window === 'undefined') return 'portrait';
  
  return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
};

// Obtener altura segura del viewport (considerando notch)
export const getSafeViewportHeight = () => {
  if (typeof window === 'undefined') return '100vh';
  
  // Usar CSS env() para dispositivos con notch
  const height = window.innerHeight;
  const safeAreaTop = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-top)') || '0'
  );
  const safeAreaBottom = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-bottom)') || '0'
  );
  
  return height - safeAreaTop - safeAreaBottom;
};

// Detectar si hay overflow horizontal
export const hasHorizontalOverflow = () => {
  if (typeof document === 'undefined') return false;
  
  return document.documentElement.scrollWidth > document.documentElement.clientWidth;
};

// Arreglar overflow horizontal
export const fixHorizontalOverflow = () => {
  if (typeof document === 'undefined') return;
  
  // Encontrar elementos que causan overflow
  const all = document.getElementsByTagName('*');
  const overflowingElements = [];
  
  for (let i = 0; i < all.length; i++) {
    const element = all[i];
    if (element.offsetWidth > document.documentElement.offsetWidth) {
      overflowingElements.push({
        element,
        width: element.offsetWidth
      });
      
      // Aplicar fix temporal
      element.style.maxWidth = '100vw';
      element.style.overflowX = 'auto';
    }
  }
  
  if (overflowingElements.length > 0) {
    console.warn('Elementos causando overflow horizontal:', overflowingElements);
  }
  
  return overflowingElements;
};

// Mejorar el rendimiento del scroll
export const enableSmoothScroll = () => {
  if (typeof document === 'undefined') return;
  
  document.documentElement.style.scrollBehavior = 'smooth';
  
  // En iOS, mejorar el scroll con -webkit-overflow-scrolling
  if (isIOS()) {
    document.documentElement.style.webkitOverflowScrolling = 'touch';
  }
};

// Deshabilitar pull-to-refresh en PWA
export const disablePullToRefresh = () => {
  if (typeof document === 'undefined') return;
  
  let startY = 0;
  
  document.addEventListener('touchstart', (e) => {
    startY = e.touches[0].pageY;
  }, { passive: false });
  
  document.addEventListener('touchmove', (e) => {
    const y = e.touches[0].pageY;
    // Prevenir pull-to-refresh si estamos en el top
    if (window.pageYOffset === 0 && y > startY) {
      e.preventDefault();
    }
  }, { passive: false });
};

export default {
  isMobileDevice,
  isIOS,
  lockBodyScroll,
  unlockBodyScroll,
  focusWithKeyboard,
  getOrientation,
  getSafeViewportHeight,
  hasHorizontalOverflow,
  fixHorizontalOverflow,
  enableSmoothScroll,
  disablePullToRefresh
};