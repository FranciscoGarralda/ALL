/**
 * Notification System Component
 * Displays error messages and notifications to users
 */

import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';

const NotificationSystem = ({ onNotificationCallback }) => {
  const [notifications, setNotifications] = useState([]);

  // Register this component to receive notifications
  useEffect(() => {
    if (onNotificationCallback) {
      onNotificationCallback((message, type = 'info', duration = 5000) => {
        const id = Date.now() + Math.random();
        const notification = {
          id,
          message,
          type,
          duration,
          timestamp: new Date()
        };

        setNotifications(prev => [...prev, notification]);

        // Auto-remove notification after duration
        if (duration > 0) {
          setTimeout(() => {
            removeNotification(id);
          }, duration);
        }
      });
    }
  }, [onNotificationCallback]);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getNotificationStyles = (type) => {
    const baseStyles = "flex items-start p-4 mb-3 rounded-lg shadow-lg border-l-4 animate-fadeIn";
    
    switch (type) {
      case 'error':
        return `${baseStyles} bg-red-50 border-red-500 text-red-800`;
      case 'success':
        return `${baseStyles} bg-green-50 border-green-500 text-green-800`;
      case 'warning':
        return `${baseStyles} bg-yellow-50 border-yellow-500 text-yellow-800`;
      default:
        return `${baseStyles} bg-indigo-50 border-indigo-500 text-indigo-800`;
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={getNotificationStyles(notification.type)}
        >
          <div className="flex-shrink-0 mr-3">
            {getNotificationIcon(notification.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">
              {notification.message}
            </p>
            <p className="text-xs opacity-75 mt-1">
              {notification.timestamp.toLocaleTimeString()}
            </p>
          </div>
          
          <button
            onClick={() => removeNotification(notification.id)}
            className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

// Hook for easy notification usage
export const useNotifications = () => {
  const [notificationHandler, setNotificationHandler] = useState(null);

  const showNotification = (message, type = 'info', duration = 5000) => {
    if (notificationHandler) {
      notificationHandler(message, type, duration);
    }
  };

  const showError = (message, duration = 7000) => {
    showNotification(message, 'error', duration);
  };

  const showSuccess = (message, duration = 4000) => {
    showNotification(message, 'success', duration);
  };

  const showWarning = (message, duration = 5000) => {
    showNotification(message, 'warning', duration);
  };

  const showInfo = (message, duration = 4000) => {
    showNotification(message, 'info', duration);
  };

  return {
    NotificationComponent: ({ onReady }) => {
      useEffect(() => {
        if (onReady) {
          onReady(setNotificationHandler);
        }
      }, [onReady]);

      return (
        <NotificationSystem 
          onNotificationCallback={(handler) => {
            setNotificationHandler(() => handler);
            if (onReady) onReady(handler);
          }} 
        />
      );
    },
    showNotification,
    showError,
    showSuccess,
    showWarning,
    showInfo
  };
};

export default NotificationSystem;