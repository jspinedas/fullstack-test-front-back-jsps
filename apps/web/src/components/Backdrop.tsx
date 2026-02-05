import React, { ReactNode } from 'react';

export interface BackdropProps {
  children: ReactNode;
  onClose?: () => void;
}

const Backdrop: React.FC<BackdropProps> = ({ children, onClose }) => {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  return (
    <div className="backdrop-overlay" onClick={handleBackdropClick}>
      <div className="backdrop-card">{children}</div>
    </div>
  );
};

export default Backdrop;
