const STORAGE_KEY = 'gamelokal_auth';

const emitChange = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth-changed'));
  }
};

export const setAuth = (authData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
  emitChange();
};

export const getAuth = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    return null;
  }
};

export const clearAuth = () => {
  localStorage.removeItem(STORAGE_KEY);
  emitChange();
};

export const getToken = () => {
  const auth = getAuth();
  return auth?.token;
};
