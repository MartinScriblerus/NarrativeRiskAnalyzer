import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Creates a portal to a DOM element with the given id.
 * If the element does not exist, it will be created and appended to body.
 */
export function usePortal(id: string) {
  const [rootElement, setRootElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let element = document.getElementById(id);

    if (!element) {
      element = document.createElement('div');
      element.id = id;
      document.body.appendChild(element);
    }

    setRootElement(element);

    return () => {
      // Optional: remove element to clean up
      // document.body.removeChild(element);
    };
  }, [id]);

  return rootElement;
}

/**
 * A Portal component to wrap children and render them into a portal root
 */
interface PortalProps {
  children: ReactNode;
  containerId: string;
}

export function Portal({ children, containerId }: PortalProps) {
  const portalRoot = usePortal(containerId);

  if (!portalRoot) return null;

  return createPortal(children, portalRoot);
}
