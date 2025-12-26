export function showGlobalLoader(): void {
  setTimeout(() => {
    const globalLoadingBar = document.getElementById('global-loader');
    if (globalLoadingBar) {
      globalLoadingBar.style.visibility = 'visible';
    }
  }, 10);
}

export function hideGlobalLoader(): void {
  setTimeout(() => {
    const globalLoadingBar = document.getElementById('global-loader');
    if (globalLoadingBar) {
      globalLoadingBar.style.visibility = 'hidden';
    }
  }, 10);
}
