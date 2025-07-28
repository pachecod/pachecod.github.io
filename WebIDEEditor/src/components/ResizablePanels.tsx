import React, { ReactNode } from 'react';

// Simplified implementation of resizable panels

interface PanelGroupProps {
  children: ReactNode;
  direction: 'horizontal' | 'vertical';
  className?: string;
}

interface PanelProps {
  children: ReactNode;
  defaultSize: number;
  minSize?: number;
  className?: string;
}

interface PanelResizeHandleProps {
  className?: string;
}

export const PanelGroup: React.FC<PanelGroupProps> = ({ 
  children, 
  direction, 
  className = '' 
}) => {
  return (
    <div 
      className={`flex ${direction === 'horizontal' ? 'flex-row' : 'flex-col'} ${className} h-full`}
    >
      {children}
    </div>
  );
};

export const Panel: React.FC<PanelProps> = ({ 
  children, 
  defaultSize, 
  minSize, 
  className = '' 
}) => {
  // In a real implementation, we'd use the defaultSize and minSize
  // For now, we'll just use flexbox
  return (
    <div className={`flex-1 min-w-0 min-h-0 overflow-auto ${className}`} style={{ flex: defaultSize }}>
      {children}
    </div>
  );
};

export const PanelResizeHandle: React.FC<PanelResizeHandleProps> = ({ 
  className = '' 
}) => {
  return (
    <div className={`${className}`}></div>
  );
};