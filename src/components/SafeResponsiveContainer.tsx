import React, { useState, useEffect, useRef } from 'react';

interface SafeResponsiveContainerProps {
  children: React.ReactElement;
  width?: string | number;
  height?: string | number;
  minHeight?: number;
}

export const SafeResponsiveContainer: React.FC<SafeResponsiveContainerProps> = ({ 
  children, 
  width = "100%", 
  height = "100%",
  minHeight
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width: w, height: h } = entries[0].contentRect;
      
      setDimensions({
        width: Math.floor(w) || 300,
        height: Math.floor(h) || 300
      });
    });

    resizeObserver.observe(container);
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    minHeight: minHeight ? `${minHeight}px` : undefined,
    position: 'relative',
  };

  const resolvedWidth = dimensions.width || (typeof width === 'number' ? width : 300);
  const resolvedHeight = dimensions.height || (typeof height === 'number' ? height : 300);

  return (
    <div ref={containerRef} style={style} className="w-full h-full relative">
      {React.cloneElement(children as React.ReactElement<any>, {
        width: resolvedWidth,
        height: resolvedHeight,
      })}
    </div>
  );
};
