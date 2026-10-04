const AUTH_RETURN_PATH_KEY = 'sancan:auth:return-path';

const isSafeInternalPath = (path: string) => path.startsWith('/') && !path.startsWith('//');

export function rememberAuthReturnPath(path: string) {
  if (typeof window === 'undefined' || !isSafeInternalPath(path)) return;
  try {
    sessionStorage.setItem(AUTH_RETURN_PATH_KEY, path);
  } catch {
    // Авторизация всё равно должна открыться, даже если storage недоступен.
  }
}

export function consumeAuthReturnPath() {
  if (typeof window === 'undefined') return null;
  try {
    const path = sessionStorage.getItem(AUTH_RETURN_PATH_KEY);
    sessionStorage.removeItem(AUTH_RETURN_PATH_KEY);
    return path && isSafeInternalPath(path) ? path : null;
  } catch {
    return null;
  }
}

