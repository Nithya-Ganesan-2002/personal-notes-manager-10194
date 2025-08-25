/**
 * Utilities to safely detect browser APIs in SSR and strict lint environments.
 */

// PUBLIC_INTERFACE
export function isBrowser(): boolean {
  /** Returns true when running in a browser environment. */
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

// PUBLIC_INTERFACE
export function getDocument(): Document | null {
  /** Returns the global document when available, otherwise null. */
  return isBrowser() ? document : null;
}

// PUBLIC_INTERFACE
export function getLocalStorage(): Storage | null {
  /** Returns the global localStorage when available, otherwise null. */
  try {
    if (isBrowser() && typeof window.localStorage !== 'undefined') {
      return window.localStorage;
    }
  } catch {
    // Access might throw in some sandboxed environments
  }
  return null;
}
