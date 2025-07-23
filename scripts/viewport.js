function updateViewportHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

updateViewportHeight();
window.addEventListener('resize', updateViewportHeight);
