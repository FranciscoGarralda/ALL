/**
 * FocusManager - Sistema COMPLETO de navegación por teclado
 * Maneja TODA la navegación: formularios, menús, submenús, dropdowns
 */

class FocusManager {
  constructor() {
    this.elements = [];
    this.currentIndex = -1;
    this.isActive = false;
    this.menuStack = []; // Stack para manejar menús anidados
    
    // Usar capture: false para no interferir con eventos normales
    document.addEventListener('keydown', this.handleGlobalKeyDown.bind(this), false);
  }

  // Registrar un elemento para navegación
  registerElement(element, options = {}) {
    if (!element) return;

    const elementData = {
      element,
      type: options.type || 'default',
      order: options.order || 0,
      disabled: options.disabled || false,
      onSelect: options.onSelect,
      onEnter: options.onEnter,
      onEscape: options.onEscape,
      isMenu: options.isMenu || false,
      menuItems: options.menuItems || [],
      parentMenu: options.parentMenu || null,
      openDropdown: options.openDropdown || null
    };

    // Insertar en orden
    const insertIndex = this.elements.findIndex(el => el.order > elementData.order);
    if (insertIndex === -1) {
      this.elements.push(elementData);
    } else {
      this.elements.splice(insertIndex, 0, elementData);
    }

    // console.log(`🔧 Elemento registrado: ${options.type}, total: ${this.elements.length}`);
  }

  // Desregistrar un elemento
  unregisterElement(element) {
    this.elements = this.elements.filter(el => el.element !== element);
    // console.log(`🗑️ Elemento desregistrado, total: ${this.elements.length}`);
  }

  // Activar navegación
  activate() {
    this.isActive = true;
    this.currentIndex = 0;
    this.updateFocus();
    document.body.classList.add('keyboard-navigation-active');
    // console.log('🎮 Navegación activada');
  }

  // Desactivar navegación
  deactivate() {
    this.isActive = false;
    this.currentIndex = -1;
    this.menuStack = [];
    this.clearFocus();
    this.closeAllMenus();
    document.body.classList.remove('keyboard-navigation-active');
    // console.log('🛑 Navegación desactivada');
  }

  // Manejar teclas globales - SOLO cuando sea necesario
  handleGlobalKeyDown(event) {
    // SOLO activar si se presiona una flecha Y no hay elementos focusados nativamente
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      // No activar si hay un input, select, textarea o button con foco
      const activeElement = document.activeElement;
      const isInteractiveElement = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'SELECT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.tagName === 'BUTTON' ||
        activeElement.contentEditable === 'true'
      );

      // Solo activar si NO estamos en un elemento interactivo y NO está activo
      if (!this.isActive && !isInteractiveElement && this.elements.length > 0) {
        event.preventDefault();
        event.stopPropagation();
        this.activate();
        return;
      }
    }

    // Solo procesar si está activo
    if (!this.isActive || this.elements.length === 0) return;

    // Si hay menús abiertos, manejar navegación de menú
    if (this.menuStack.length > 0) {
      this.handleMenuNavigation(event);
      return;
    }

    // Navegación normal
    const availableElements = this.elements.filter(el => !el.disabled);
    if (availableElements.length === 0) return;

    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        event.stopPropagation();
        this.moveFocus(-1);
        break;
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        event.stopPropagation();
        this.moveFocus(1);
        break;
      case 'Enter':
        event.preventDefault();
        event.stopPropagation();
        this.selectCurrent();
        break;
      case 'Escape':
        event.preventDefault();
        event.stopPropagation();
        this.deactivate();
        break;
      case 'Tab':
        // Permitir Tab normal, pero desactivar navegación
        this.deactivate();
        break;
    }
  }

  // Manejar navegación dentro de menús
  handleMenuNavigation(event) {
    const currentMenu = this.menuStack[this.menuStack.length - 1];
    if (!currentMenu) return;

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        event.stopPropagation();
        this.moveMenuFocus(currentMenu, -1);
        break;
      case 'ArrowDown':
        event.preventDefault();
        event.stopPropagation();
        this.moveMenuFocus(currentMenu, 1);
        break;
      case 'Enter':
        event.preventDefault();
        event.stopPropagation();
        this.selectMenuItem(currentMenu);
        break;
      case 'Escape':
        event.preventDefault();
        event.stopPropagation();
        this.closeCurrentMenu();
        break;
    }
  }

  // Mover foco en menú
  moveMenuFocus(menu, direction) {
    menu.selectedIndex += direction;

    // Wrap around
    if (menu.selectedIndex < 0) {
      menu.selectedIndex = menu.items.length - 1;
    } else if (menu.selectedIndex >= menu.items.length) {
      menu.selectedIndex = 0;
    }

    this.updateMenuFocus(menu);
          // console.log(`📋 Menú foco: ${menu.selectedIndex}/${menu.items.length}`);
  }

  // Actualizar foco visual en menú
  updateMenuFocus(menu) {
    // Limpiar foco anterior
    menu.items.forEach(item => {
      if (item.element) {
        item.element.classList.remove('keyboard-focused');
      }
    });

    // Establecer nuevo foco
    if (menu.selectedIndex >= 0 && menu.selectedIndex < menu.items.length) {
      const item = menu.items[menu.selectedIndex];
      if (item.element) {
        item.element.classList.add('keyboard-focused');
        item.element.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    }
  }

  // Seleccionar item de menú
  selectMenuItem(menu) {
    if (menu.selectedIndex >= 0 && menu.selectedIndex < menu.items.length) {
      const item = menu.items[menu.selectedIndex];
      // console.log(`✅ Seleccionando item de menú: ${item.text || item.value}`);
      
      if (item.onSelect) {
        item.onSelect(item);
      }
      
      this.closeCurrentMenu();
    }
  }

  // Abrir menú
  openMenu(menuElement, items, options = {}) {
    const menu = {
      element: menuElement,
      items: items,
      selectedIndex: 0,
      onClose: options.onClose
    };

    this.menuStack.push(menu);
    this.updateMenuFocus(menu);
    // console.log(`📂 Menú abierto, stack: ${this.menuStack.length}`);
  }

  // Cerrar menú actual
  closeCurrentMenu() {
    const menu = this.menuStack.pop();
    if (menu) {
      // Limpiar foco del menú
      menu.items.forEach(item => {
        if (item.element) {
          item.element.classList.remove('keyboard-focused');
        }
      });

      if (menu.onClose) {
        menu.onClose();
      }

      // console.log(`📁 Menú cerrado, stack: ${this.menuStack.length}`);
    }

    // Si no hay más menús, volver al foco principal
    if (this.menuStack.length === 0) {
      this.updateFocus();
    }
  }

  // Cerrar todos los menús
  closeAllMenus() {
    while (this.menuStack.length > 0) {
      this.closeCurrentMenu();
    }
  }

  // Mover el foco principal
  moveFocus(direction) {
    const availableElements = this.elements.filter(el => !el.disabled);
    if (availableElements.length === 0) return;

    this.currentIndex += direction;

    // Wrap around
    if (this.currentIndex < 0) {
      this.currentIndex = availableElements.length - 1;
    } else if (this.currentIndex >= availableElements.length) {
      this.currentIndex = 0;
    }

    this.updateFocus();
  }

  // Actualizar el foco visual principal
  updateFocus() {
    this.clearFocus();
    
    const availableElements = this.elements.filter(el => !el.disabled);
    if (this.currentIndex >= 0 && this.currentIndex < availableElements.length) {
      const element = availableElements[this.currentIndex];
      if (element.element) {
        element.element.focus();
        element.element.classList.add('keyboard-focused');
        document.body.classList.add('keyboard-navigation-active');
        
        // Scroll into view
        element.element.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest'
        });

        // console.log(`🎯 Foco en: ${element.type}, índice: ${this.currentIndex}`);
      }
    }
  }

  // Seleccionar elemento actual
  selectCurrent() {
    const availableElements = this.elements.filter(el => !el.disabled);
    if (this.currentIndex >= 0 && this.currentIndex < availableElements.length) {
      const element = availableElements[this.currentIndex];
      
      // console.log(`⏎ Seleccionando: ${element.type}`);
      
      // Si tiene onEnter personalizado, usarlo
      if (element.onEnter) {
        element.onEnter(element);
        return;
      }

      // Si tiene onSelect personalizado, usarlo
      if (element.onSelect) {
        element.onSelect(element);
        return;
      }

      // Comportamiento por defecto según tipo
      if (element.element) {
        switch (element.type) {
          case 'button':
            element.element.click();
            break;
          case 'select':
            this.handleSelectOpen(element);
            break;
          case 'autocomplete':
            this.handleAutocompleteOpen(element);
            break;
          case 'input':
            element.element.focus();
            break;
          default:
            element.element.click();
        }
      }
    }
  }

  // Manejar apertura de select
  handleSelectOpen(element) {
    const selectElement = element.element;
    // console.log(`📋 Abriendo select nativo`);
    
    // Para selects nativos, simplemente enfocar y simular click
    selectElement.focus();
    
    // Simular click para abrir el dropdown nativo
    const clickEvent = new MouseEvent('mousedown', {
      view: window,
      bubbles: true,
      cancelable: true
    });
    selectElement.dispatchEvent(clickEvent);
    
    // También simular el mouseup
    setTimeout(() => {
      const mouseUpEvent = new MouseEvent('mouseup', {
        view: window,
        bubbles: true,
        cancelable: true
      });
      selectElement.dispatchEvent(mouseUpEvent);
    }, 10);
  }

  // Manejar apertura de autocomplete
  handleAutocompleteOpen(element) {
    // console.log(`🔍 Intentando abrir autocomplete`);
    
    // Si el elemento tiene un método openDropdown, llamarlo
    if (element.openDropdown && typeof element.openDropdown === 'function') {
      element.openDropdown();
    } else {
      // Fallback: simular Enter en el elemento
      const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        bubbles: true,
        cancelable: true
      });
      element.element.dispatchEvent(enterEvent);
    }
  }

  // Limpiar foco visual
  clearFocus() {
    document.querySelectorAll('.keyboard-focused').forEach(el => {
      el.classList.remove('keyboard-focused');
    });
    document.body.classList.remove('keyboard-navigation-active');
  }

  // Limpiar todos los elementos
  clear() {
    this.elements = [];
    this.currentIndex = -1;
    this.isActive = false;
    this.menuStack = [];
    this.clearFocus();
  }

  // Obtener estado actual
  getState() {
    return {
      elementsCount: this.elements.length,
      currentIndex: this.currentIndex,
      isActive: this.isActive,
      menuStackDepth: this.menuStack.length
    };
  }
}

// Instancia global del FocusManager
export const focusManager = new FocusManager();

export default FocusManager;