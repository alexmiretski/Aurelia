// scripts/about.js

document.addEventListener('DOMContentLoaded', () => {
  const aboutScreen = document.getElementById('about-screen');
  const aboutLink = document.getElementById('about-link');
  const backButton = document.getElementById('about-back');
  const logo = document.getElementById('logo');
  const fab = document.getElementById('hi-fab');
  const timelineLauncher = document.getElementById('timeline-launcher');
  const soundPrompt = document.getElementById('sound-prompt');
  const heroCanvas = document.getElementById('hero-blob-canvas');
  const mainScreen = document.getElementById('main-screen');
  const memoryScreen = document.getElementById('memory-screen');

  /** Allow vertical scrolling on about screen */
  if (aboutScreen) {
    aboutScreen.style.overflowY = 'auto';
  }

  // Accessibility helper functions
  function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  }

  function focusFirstInteractiveElement(container) {
    const focusable = container?.querySelector('button, [tabindex="0"], input, select, textarea, [href]');
    focusable?.focus();
  }

  // Check if user prefers reduced motion
  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function showReflectionScreen() {
    // Hide about screen
    aboutScreen.classList.remove('fade-in');
    aboutScreen.classList.add('fade-out');

    // Announce screen change
    announceToScreenReader('Returned to reflection screen');

    setTimeout(() => {
      aboutScreen.classList.add('hidden');

      // Show main reflection screen
      mainScreen?.classList.remove('hidden');
      mainScreen?.classList.remove('fade-out');
      mainScreen?.classList.add('fade-in');

      // Show FAB and timeline launcher
      fab?.classList.remove('hidden', 'fade-out');
      fab?.classList.add('fade-in');

      timelineLauncher?.classList.remove('hidden', 'fade-out');
      timelineLauncher?.classList.add('fade-in');

      // Restore background elements
      soundPrompt?.style.removeProperty('display');
      heroCanvas?.style.removeProperty('display');
      
      // Force hero blob to be visible and restart animation
      const heroBlob = document.getElementById('hero-blob-canvas');
      if (heroBlob) {
        heroBlob.style.display = 'block';
        heroBlob.style.opacity = '1';
        
        // Restart the blob animation if needed
        if (window.startHeroBlob) {
          window.startHeroBlob();
        }
      }

      // Restart reflection cleanly
      if (window.clearStaggeredDisplay) {
        window.clearStaggeredDisplay();
      }
      if (window.originalIntro && window.displaySentencesStaggered) {
        setTimeout(() => window.displaySentencesStaggered(window.originalIntro), 450);
      }

      // Restore memory UI for future use
      document.getElementById('blob-access-layer')?.classList.add('hidden');
      document.getElementById('memory-reveal')?.classList.add('hidden');
      document.getElementById('about-back')?.classList.add('hidden');
      
      const mainNav = document.getElementById('main-nav');
      mainNav?.classList.add('visible');

      // Focus management - focus the first interactive element
      setTimeout(() => {
        focusFirstInteractiveElement(mainScreen);
      }, 100);
    }, 500);
  }

  // Enhanced about link handler with keyboard support
  function handleAboutNavigation(e) {
    e?.preventDefault();

    // Check if we're coming from memory screen
    const isMemory = memoryScreen?.classList.contains('show');
    
    if (isMemory) {
      // Fade out memory screen
      memoryScreen.classList.remove('show', 'fade-in');
      memoryScreen.classList.add('fade-out');
      
      // Hide memory UI elements
      const blobAccessLayer = document.getElementById('blob-access-layer');
      const revealBox = document.getElementById('memory-reveal');
      const backButton = document.getElementById('about-back');
      
      blobAccessLayer?.classList.add('hidden');
      revealBox?.classList.add('hidden');
      backButton?.classList.remove('fade-in');
      backButton?.classList.add('fade-out');
      
      // Stop memory animation
      window.stopMemoryFlow?.();
      
      // Re-enable scrolling
      document.body.classList.remove('noscroll');
      
      // Clean up memory screen after fade
      setTimeout(() => {
        memoryScreen.classList.add('hidden');
        memoryScreen.classList.remove('fade-out');
        backButton?.classList.add('hidden');
      
      }, 800);
    } else {
      // Coming from reflection screen - hide FAB and timeline
      fab?.classList.add('fade-out');
      timelineLauncher?.classList.add('fade-out');
      
      setTimeout(() => {
        fab?.classList.add('hidden');
        timelineLauncher?.classList.add('hidden');
      }, 500);
    }

    // Show about screen after a delay
    setTimeout(() => {
      aboutScreen.classList.remove('hidden', 'fade-out');
      aboutScreen.classList.add('fade-in');
      aboutLink?.classList.remove('visible');

      // Announce screen change
      announceToScreenReader('Viewing who she is');
      
      // Gently fade in about content and segments
      const aboutContent = document.querySelector('.about-content');
      aboutContent?.classList.remove('visible');

      setTimeout(() => {
        aboutContent?.classList.add('visible');

        const segmentEls = document.querySelectorAll('.segment');
        segmentEls.forEach((el, i) => {
          el.classList.remove('visible');
          // Respect reduced motion preference
          const delay = prefersReducedMotion() ? 0 : i * 100;
          setTimeout(() => el.classList.add('visible'), delay);
        });

        scatterSegments();
      }, 100);

      // Hide reflection-specific background elements
      soundPrompt?.style.setProperty('display', 'none');
      heroCanvas?.style.setProperty('display', 'none');

      // Fade out main screen if visible
      mainScreen?.classList.add('fade-out');
      setTimeout(() => {
        mainScreen?.classList.add('hidden');
      }, 500);

      // Focus management - focus the about content after animation
      setTimeout(() => {
        const firstFocusable = aboutScreen.querySelector('button, [tabindex="0"]');
        if (firstFocusable) {
          firstFocusable.focus();
        } else {
          // If no focusable elements, make the about content focusable for screen readers
          aboutContent?.setAttribute('tabindex', '-1');
          aboutContent?.focus();
        }
      }, 600);
      
    }, isMemory ? 800 : 500);
  }

  // Enhanced back navigation with keyboard support
  function handleBackNavigation(e) {
    e?.preventDefault();
    
    aboutScreen.classList.remove('fade-in');
    aboutScreen.classList.add('fade-out');

    setTimeout(() => {
      showReflectionScreen();
    }, 500);
  }

  // Event listeners with keyboard support
  if (aboutLink) {
    aboutLink.addEventListener('click', handleAboutNavigation);
    aboutLink.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleAboutNavigation();
      }
    });
  }

  if (backButton) {
    backButton.addEventListener('click', handleBackNavigation);
    backButton.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleBackNavigation();
      }
    });
  }

  if (logo) {
    logo.addEventListener('click', () => {
      if (!aboutScreen.classList.contains('hidden')) {
        handleBackNavigation();
      }
    });
    
    logo.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && !aboutScreen.classList.contains('hidden')) {
        e.preventDefault();
        handleBackNavigation();
      }
    });
  }

  // Enhanced text rotation with accessibility improvements
  const segments = document.querySelectorAll('.segment');
  function scatterSegments() {
    if (!segments.length) return;
    if (aboutScreen.classList.contains('hidden')) return;
    const container = document.querySelector('.living-text');
    if (!container) return;
    const containerWidth = container.clientWidth;
    segments.forEach(seg => {
      const segWidth = seg.offsetWidth;
      const maxOffset = Math.max(containerWidth - segWidth, 0);
      const offset = Math.random() * maxOffset;
      seg.style.marginLeft = `${offset}px`;
    });
  }

  window.addEventListener('resize', scatterSegments);
  let lastIndex = -1;
  let rotationActive = true;

  // Pause text rotation if user prefers reduced motion
  if (prefersReducedMotion()) {
    rotationActive = false;
  }

  // Allow users to pause/resume text rotation with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !aboutScreen.classList.contains('hidden')) {
      rotationActive = !rotationActive;
      const status = rotationActive ? 'resumed' : 'paused';
      announceToScreenReader(`Text animation ${status}`);
    }
  });

  function rotateRandomSegment() {
    if (!segments.length || !rotationActive) {
      setTimeout(rotateRandomSegment, 3000);
      return;
    }

    let index;
    do {
      index = Math.floor(Math.random() * segments.length);
    } while (index === lastIndex);

    lastIndex = index;
    const span = segments[index];
    const current = span.textContent;
    const variants = [span.dataset.alt, span.dataset.alt2].filter(v => v && v !== current);

    if (!variants.length) {
      setTimeout(rotateRandomSegment, 3000);
      return;
    }

    const next = variants[Math.floor(Math.random() * variants.length)];

    // Add aria-live region for text changes
    if (!span.hasAttribute('aria-live')) {
      span.setAttribute('aria-live', 'polite');
      span.setAttribute('aria-atomic', 'true');
    }

    span.classList.add('fade-out');

    setTimeout(() => {
      span.textContent = next;
      span.classList.remove('fade-out');
      span.classList.add('fade-in');

      // Remove fade-in after it completes
      setTimeout(() => span.classList.remove('fade-in'), 1600);

      // Wait before triggering the next rotation
      setTimeout(rotateRandomSegment, 3000);
    }, prefersReducedMotion() ? 100 : 1600); // Faster transition if reduced motion
  }

  // Start text rotation after initial page load
  setTimeout(() => {
    if (rotationActive) {
      rotateRandomSegment();
    }
  }, 3000);

  // Update active navigation state when about screen is shown
  function updateActiveNavItem() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    
    if (!aboutScreen.classList.contains('hidden')) {
      document.getElementById('about-link')?.classList.add('active');
    }
  }

  // Observer to update navigation state when about screen visibility changes
  const aboutObserver = new MutationObserver(() => {
    updateActiveNavItem();
  });

  if (aboutScreen) {
    aboutObserver.observe(aboutScreen, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
  }
});