import React, { useState, useCallback } from 'react';

const SimpleTooltip = ({ children, content, position = 'top' }) => {
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0 });

  const showTooltip = useCallback((e) => {
    const offset = 10;
    let x = e.clientX;
    let y = e.clientY;

    switch (position) {
      case 'top':
        y = y - offset - 40;
        x = x - 60;
        break;
      case 'bottom':
        y = y + offset;
        x = x - 60;
        break;
      case 'left':
        x = x - offset - 120;
        y = y - 20;
        break;
      case 'right':
        x = x + offset;
        y = y - 20;
        break;
      default:
        y = y - offset - 40;
        x = x - 60;
    }

    setTooltip({ visible: true, x, y });
  }, [position]);

  const hideTooltip = useCallback(() => {
    setTooltip(prev => ({ ...prev, visible: false }));
  }, []);

  const updateTooltip = useCallback((e) => {
    if (tooltip.visible) {
      const offset = 10;
      let x = e.clientX;
      let y = e.clientY;

      switch (position) {
        case 'top':
          y = y - offset - 40;
          x = x - 60;
          break;
        case 'bottom':
          y = y + offset;
          x = x - 60;
          break;
        case 'left':
          x = x - offset - 120;
          y = y - 20;
          break;
        case 'right':
          x = x + offset;
          y = y - 20;
          break;
        default:
          y = y - offset - 40;
          x = x - 60;
      }

      setTooltip({ visible: true, x, y });
    }
  }, [tooltip.visible, position]);

  return (
    <>
      <div
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onMouseMove={updateTooltip}
        style={{ display: 'inline-block' }}
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
            backgroundColor: '#1f2937',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '500',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            pointerEvents: 'none',
            maxWidth: '200px',
            wordWrap: 'break-word',
            whiteSpace: 'normal'
          }}
        >
          {content}
        </div>
      )}
    </>
  );
};

export default SimpleTooltip;