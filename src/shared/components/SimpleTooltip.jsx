import React, { useState } from 'react';

const SimpleTooltip = ({ children, content, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (e) => {
    setIsVisible(true);
    updatePosition(e);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  const handleMouseMove = (e) => {
    if (isVisible) {
      updatePosition(e);
    }
  };

  const updatePosition = (e) => {
    setMousePosition({
      x: e.clientX,
      y: e.clientY
    });
  };

  const getTooltipStyle = () => {
    const offset = 10;
    let x = mousePosition.x;
    let y = mousePosition.y;

    switch (position) {
      case 'top':
        y = y - offset - 40;
        x = x - 60; // Centrar aproximadamente
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

    return {
      position: 'fixed',
      top: `${y}px`,
      left: `${x}px`,
      zIndex: 9999,
      backgroundColor: '#1f2937',
      color: 'white',
      padding: '6px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: '500',
      whiteSpace: 'nowrap',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      pointerEvents: 'none',
      maxWidth: '200px',
      wordWrap: 'break-word',
      whiteSpace: 'normal'
    };
  };

  return (
    <>
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        style={{ display: 'inline-block' }}
      >
        {children}
      </div>
      
      {isVisible && content && (
        <div style={getTooltipStyle()}>
          {content}
        </div>
      )}
    </>
  );
};

export default SimpleTooltip;