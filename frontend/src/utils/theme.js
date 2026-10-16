export const DARK_MODE_STORAGE_KEY = 'unilink.dark-mode';

function userThemeKey(userId) {
  return userId ? `${DARK_MODE_STORAGE_KEY}.${userId}` : DARK_MODE_STORAGE_KEY;
}

export function isDarkModeEnabled(userId) {
  return localStorage.getItem(userThemeKey(userId)) === 'true';
}

export function applyDarkMode(enabled, userId) {
  document.documentElement.classList.toggle('dark', enabled);
  localStorage.setItem(userThemeKey(userId), String(enabled));
  window.dispatchEvent(new Event('unilink:theme-changed'));
}

export function initializeTheme() {
  let userId = null;
  try {
    userId = JSON.parse(localStorage.getItem('unilink.user') || 'null')?.id || null;
  } catch {
    // A missing or invalid cached user means no account-specific theme is available.
  }
  document.documentElement.classList.toggle('dark', isDarkModeEnabled(userId));
}
