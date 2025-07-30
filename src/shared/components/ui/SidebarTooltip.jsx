import React, { useState, useCallback } from 'react';

const SidebarTooltip = ({ children, content, disabled = false }) => {
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0 });

  const showTooltip = useCallback((e) => {
    if (disabled) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.right + 8; // 8px a la derecha del contenedor
    const y = rect.top + (rect.height / 2) - 18; // Centrado verticalmente (ajustado)
    
    setTooltip({ visible: true, x, y });
  }, [disabled]);

  const hideTooltip = useCallback(() => {
    setTooltip(prev => ({ ...prev, visible: false }));
  }, []);

  return (
    <>
      <div
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        className="w-full"
      >
        {children}
      </div>
      
      {tooltip.visible && content && (
        <div
          style={{
            position: 'fixed',
            top: `${tooltip.y}px`,
            left: `${tooltip.x}px`,
            zIndex: 9999,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '8px 14px',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: '600',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            letterSpacing: '0.025em'
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: '-5px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: 0,
              height: 0,
              borderTop: '5px solid transparent',
              borderBottom: '5px solid transparent',
              borderRight: '5px solid #667eea',
              filter: 'drop-shadow(-1px 0 1px rgba(0, 0, 0, 0.1))'
            }}
          />
          {content}
        </div>
      )}
    </>
  );
};

export default SidebarTooltip;