// SSR-safe utilities to prevent hydration issues

let idCounter = 0;

/**
 * Generate a unique ID that's deterministic across SSR and client
 * @param prefix - Optional prefix for the ID
 * @returns A unique ID string
 */
export function generateId(prefix = 'id'): string {
  return `${prefix}-${++idCounter}`;
}

/**
 * Check if we're in a browser environment
 * @returns true if running in browser, false if SSR
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Safe window access - returns undefined during SSR
 * @param callback - Function that accesses window
 * @returns Result of callback or undefined during SSR
 */
export function safeWindow<T>(callback: (window: Window) => T): T | undefined {
  return isBrowser() ? callback(window) : undefined;
}

/**
 * Safe document access - returns undefined during SSR
 * @param callback - Function that accesses document
 * @returns Result of callback or undefined during SSR
 */
export function safeDocument<T>(callback: (document: Document) => T): T | undefined {
  return isBrowser() ? callback(document) : undefined;
}

/**
 * Get current timestamp in a way that's consistent between SSR and client
 * @returns Current timestamp or 0 during SSR
 */
export function safeTimestamp(): number {
  return isBrowser() ? Date.now() : 0;
}

/**
 * Generate a random number that's consistent between SSR and client
 * @returns Random number or 0 during SSR
 */
export function safeRandom(): number {
  return isBrowser() ? Math.random() : 0;
}

/**
 * Hook to check if component has mounted (for conditional rendering)
 * @returns true after component mounts, false during SSR
 */
import { useEffect, useState } from 'react';

export function useIsClient(): boolean {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}

/**
 * Hook for SSR-safe IDs
 * @param prefix - Optional prefix for the ID
 * @returns A stable ID
 */
export function useId(prefix = 'id'): string {
  const [id] = useState(() => generateId(prefix));
  return id;
}
