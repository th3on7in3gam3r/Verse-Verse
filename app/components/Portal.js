'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function Portal({ children }) {
  const elRef = useRef(null);
  if (!elRef.current) {
    elRef.current = document.createElement('div');
    elRef.current.setAttribute('data-portal', 'true');
  }

  useEffect(() => {
    document.body.appendChild(elRef.current);
    return () => {
      try {
        document.body.removeChild(elRef.current);
      } catch (e) {
        /* ignore */
      }
    };
  }, []);

  return createPortal(children, elRef.current);
}
