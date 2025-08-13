// Manage browser history for SPA navigation
// Uses HTML5 History API to keep Back/Forward within the single page

document.addEventListener('DOMContentLoaded', () => {
  // Set initial state for the reflection screen
  history.replaceState({ screen: 'reflection' }, '', window.location.pathname);

  let suppressPush = false;

  function pushState(screen, hash) {
    if (suppressPush) return;
    history.pushState({ screen }, '', hash);
  }

  const openMemory = document.getElementById('open-memory');
  const memoryLink = document.getElementById('memory-link');
  const aboutLink = document.getElementById('about-link');
  const reflectionLink = document.getElementById('reflection-link');
  const logo = document.getElementById('logo');
  const returnButton = document.getElementById('return-button');

  openMemory?.addEventListener('click', () => pushState('memory', '#memory'));
  memoryLink?.addEventListener('click', () => pushState('memory', '#memory'));
  aboutLink?.addEventListener('click', () => pushState('about', '#about'));
  reflectionLink?.addEventListener('click', () => pushState('reflection', '#'));
  logo?.addEventListener('click', () => pushState('reflection', '#'));
  returnButton?.addEventListener('click', () => pushState('reflection', '#'));

  window.addEventListener('popstate', (e) => {
    suppressPush = true;
    const screen = e.state?.screen || 'reflection';
    switch (screen) {
      case 'memory':
        openMemory?.click();
        break;
      case 'about':
        aboutLink?.click();
        break;
      default:
        if (window.returnToReflection) window.returnToReflection();
    }
    // Allow pushState again after navigation completes
    setTimeout(() => { suppressPush = false; }, 0);
  });
});
