const STORAGE_KEY = 'gamelokal_theme';

const emitChange = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('theme-changed'));
  }
};

export const setTheme = (theme) => {
  const safeTheme = theme === 'light' ? 'light' : 'dark';
  localStorage.setItem(STORAGE_KEY, safeTheme);
  emitChange();
};

export const getTheme = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'light' ? 'light' : 'dark';
  } catch (error) {
    return 'dark';
  }
};

