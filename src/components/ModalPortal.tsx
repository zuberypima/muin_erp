import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

interface ModalPortalProps {
  children: React.ReactNode;
}

const ModalPortal: React.FC<ModalPortalProps> = ({ children }) => {
  useEffect(() => {
    // Prevent body scrolling behind the modal backdrop
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  return ReactDOM.createPortal(children, document.body);
};

export default ModalPortal;
