import { useEffect, useRef, useCallback } from 'react';
import { focusManager } from '../services/FocusManager';

/**
 * Hook simplificado para navegación por teclado
 * Funciona de manera más directa y confiable
 */
export const useKeyboardNavigation = () => {
  const elementsRef = useRef(new Map());

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      // Desregistrar todos los elementos de este hook
      elementsRef.current.forEach((element) => {
        focusManager.unregisterElement(element);
      });
      elementsRef.current.clear();
    };
  }, []);

  // Función para crear ref que registra automáticamente
  const createElementRef = useCallback((elementId, options = {}) => {
    return (element) => {
      // Desregistrar elemento anterior si existe
      const prevElement = elementsRef.current.get(elementId);
      if (prevElement) {
        focusManager.unregisterElement(prevElement);
      }

      if (element) {
        // Registrar nuevo elemento
        elementsRef.current.set(elementId, element);
        focusManager.registerElement(element, {
          type: options.type || 'default',
          order: options.order || 0,
          disabled: options.disabled || false,
          onSelect: options.onSelect,
          openDropdown: options.openDropdown
        });
      } else {
        // Limpiar referencia si el elemento es null
        elementsRef.current.delete(elementId);
      }
    };
  }, []);

  // Función para activar manualmente la navegación
  const activateNavigation = useCallback(() => {
    focusManager.activate();
  }, []);

  // Función para desactivar la navegación
  const deactivateNavigation = useCallback(() => {
    focusManager.deactivate();
  }, []);

  return {
    createElementRef,
    activateNavigation,
    deactivateNavigation
  };
};

/**
 * Hook específico para formularios
 */
export const useFormKeyboardNavigation = (formId, options = {}) => {
  return useKeyboardNavigation();
};

/**
 * Hook específico para menús
 */
export const useMenuKeyboardNavigation = (menuId, options = {}) => {
  return useKeyboardNavigation();
};

/**
 * Hook específico para listas
 */
export const useListKeyboardNavigation = (listId, options = {}) => {
  return useKeyboardNavigation();
};

/**
 * Hook específico para navegación horizontal
 */
export const useHorizontalKeyboardNavigation = (toolbarId, options = {}) => {
  return useKeyboardNavigation();
};

export default useKeyboardNavigation;