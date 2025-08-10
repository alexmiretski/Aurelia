// scripts/meta-date.js
// Utility function to reveal the meta date element using fade classes.
function revealMetaDate() {
  const meta = document.getElementById('meta-date');
  if (!meta) return;

  meta.style.visibility = 'visible';
  // Force reflow to ensure visibility is applied before opacity change
  void meta.offsetWidth;
  meta.classList.remove('fade-out');
  meta.classList.add('fade-in');
}

// Expose globally so other scripts can use the same implementation
window.revealMetaDate = revealMetaDate;
