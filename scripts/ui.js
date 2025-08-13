// scripts/ui.js

let selectedTheme = null;

// Duration (ms) to keep elements visible during fade-out before hiding
const FADE_OUT_DURATION = 1000;


// Background color management system
const ScreenBackgrounds = {
  reflection: 'rgba(26, 15, 29, 0.75)', // Dark dream with 75% opacity
  memory: 'rgba(29, 15, 15, 0.75)',     // Dark ache with 75% opacity
  about: 'rgba(15, 26, 29, 0.75)',      // Dark drift with 75% opacity
  timeline: 'rgba(35, 32, 28, 0.75)'   // Warm charcoal with film grain feel
};


function setScreenBackground(screenName) {
  console.log(`🎨 Setting background for ${screenName} screen`);
  
  // Remove all screen classes
  document.body.classList.remove('screen-reflection', 'screen-memory', 'screen-about', 'screen-timeline');
  
  // Add the new screen class
  document.body.classList.add(`screen-${screenName}`);
  
  // Update the actual body background color directly
  if (ScreenBackgrounds[screenName]) {
    document.body.style.backgroundColor = ScreenBackgrounds[screenName];
    console.log(`🌀 Updated background to: ${ScreenBackgrounds[screenName]}`);
  }
}

function fadeOutHeroBlob() {
  const blob = document.getElementById('hero-blob-canvas');
  if (blob) {
    blob.style.opacity = '0';
  }
}

function enterFullscreen() {
  const elem = document.documentElement;
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen(); // Safari
  } else if (elem.msRequestFullscreen) {
    elem.msRequestFullscreen(); // IE11
  }
}

function fadeInHeroBlob() {
  const blob = document.getElementById('hero-blob-canvas');
  if (blob) {
    // Reset display property first
    blob.style.display = 'block';
    // Small delay to ensure display change is processed
    setTimeout(() => {
      blob.style.opacity = '1';
    }, 10);
  }
}

function closeFabMenuIfOpen(skipRestore = false) {
  const fabToggle = document.getElementById("fab-toggle");
  const fabMenu = document.getElementById("fab-menu");

  if (!fabMenu.classList.contains("fab-hidden")) {
    fabToggle?.classList.remove("open");
    fabMenu?.classList.add("fab-hidden");

    // Clear theme and unlock hero blob
    selectedTheme = null;
    const blobCanvas = document.getElementById("hero-blob-canvas");
    blobCanvas?.classList.remove("theme-locked");

    if (!skipRestore) {
      // Restore original intro if needed
      if (window.originalIntro && window.displaySentencesStaggered) {
        window.clearStaggeredDisplay?.();
        setTimeout(() => window.displaySentencesStaggered(window.originalIntro), 450);
      }

      // Restore the original date line without theme
      const today = new Date();
      const timelineStartDate = new Date('2025-07-24');
      const msPerDay = 1000 * 60 * 60 * 24;
      const dayNumber = Math.floor((today - timelineStartDate) / msPerDay) + 1;
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      updateMetaDateSmoothly(`Day ${dayNumber} of becoming • ${today.toLocaleDateString('en-US', options)}`);
    }
  }
}


document.addEventListener('DOMContentLoaded', () => {
  const audio = document.getElementById('bg-audio');
  const muteButton = document.getElementById('mute-button');
  const fabToggle = document.getElementById("fab-toggle");
  const fabMenu = document.getElementById("fab-menu");
  const fab = document.getElementById('hi-fab');
  const timelineLauncher = document.getElementById('timeline-launcher');
  const timelineContainer = document.getElementById('timeline-container');
  const timelineOpen = document.getElementById('timeline-open');
  const timelineToggle = document.getElementById('timeline-toggle');
  const timelineClose = document.getElementById('timeline-close');
  const bead = document.getElementById('timeline-bead');
  const progressEl = document.getElementById('timeline-progress');
  const timelineBar = document.getElementById('timeline-bar');
  const metaDate = document.getElementById('meta-date');
  const timelineControls = document.getElementById('timeline-controls');
  const aboutScreen = document.getElementById('about-screen');
  const returnButton = document.getElementById('return-button');
  // Scroll detection for navigation overlay
  let scrollTimeout;

  function handleScroll() {
    const aboutVisible = aboutScreen && !aboutScreen.classList.contains('hidden');
    const isMemoryScreen = document.getElementById('memory-screen')?.classList.contains('show');

    const scrollPosition = aboutVisible ? aboutScreen.scrollTop : window.scrollY;

    // Only apply on smaller screens and when on about/memory screens
    if (window.innerWidth <= 1024 && (aboutVisible || isMemoryScreen)) {
      if (scrollPosition > 20) {
        document.body.classList.add('scrolling');
      } else {
        document.body.classList.remove('scrolling');
      }
    }

    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const pos = aboutVisible ? aboutScreen.scrollTop : window.scrollY;
      if (pos <= 20) {
        document.body.classList.remove('scrolling');
      }
    }, 150);
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  aboutScreen?.addEventListener('scroll', handleScroll, { passive: true });

  function removeScrollingState() {
    document.body.classList.remove("scrolling");
  }

  // Hamburger menu functionality
const hamburgerButton = document.getElementById('hamburger-button');
const isMobile = window.innerWidth <= 768;

// Function to handle hamburger visibility
function updateHamburgerVisibility() {
  const shouldShowHamburger = mainNav?.classList.contains('visible') || hamburgerButton?.classList.contains('visible');
  
  if (window.innerWidth <= 768 && shouldShowHamburger) {
    hamburgerButton?.classList.add('visible');
  }
}

// Hamburger click handler
hamburgerButton?.addEventListener('click', () => {
  const isOpen = hamburgerButton.classList.contains('open');
  
  if (isOpen) {
    // Close menu
    hamburgerButton.classList.remove('open');
    mainNav.classList.remove('mobile-open');
    mainNav.classList.remove('visible'); // Add this
    
    // Allow body scroll again
    document.body.style.overflow = '';
  } else {
    // Open menu
    hamburgerButton.classList.add('open');
    mainNav.classList.add('mobile-open', 'visible');
    
    // Update active state when opening
    updateActiveNavItem(); // Add this
    
    // Prevent body scroll when menu is open
    document.body.style.overflow = 'hidden';
  }
});

// Close menu when clicking nav items on mobile
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
      hamburgerButton?.classList.remove('open');
      mainNav?.classList.remove('mobile-open');
      mainNav?.classList.remove('visible'); // Add this
      document.body.style.overflow = '';
    }
  });
});

// Handle window resize
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const wasMobile = isMobile;
    const isNowMobile = window.innerWidth <= 768;
    
    if (wasMobile !== isNowMobile) {
      // Reset menu state on breakpoint change
      hamburgerButton?.classList.remove('open');
      mainNav?.classList.remove('mobile-open');
      document.body.style.overflow = '';
    }
    
    updateHamburgerVisibility();
  }, 250);
});

  // Navigation elements
  const mainNav = document.getElementById('main-nav');
  const reflectionLink = document.getElementById('reflection-link');
  const memoryLink = document.getElementById('memory-link');

  const supportButton = document.getElementById('support-button');

  supportButton?.addEventListener('click', () => {
    window.open('https://ko-fi.com/supportaurelia', '_blank');
  });

  supportButton?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      window.open('https://ko-fi.com/supportaurelia', '_blank');
    }
  });

  // Feature flag to toggle old CTA
  window.SHOW_STRONG_CTA = false;

  // Attach analytics
  const link = document.getElementById('support-link');
  if (link) {
    link.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('support_link_clicked', {
        detail: { location: 'footer', variant: 'gentle_v1' }
      }));
    });
  }

  // Quick revert helper if needed
  if (window.SHOW_STRONG_CTA) {
    document.getElementById('support-block')?.classList.add('hidden');
    document.getElementById('strong-cta')?.classList.remove('hidden');
  }


  // Global references
  window.bead = bead;
  window.progressEl = progressEl;

  const msPerDay = 1000 * 60 * 60 * 24;
  const timelineStartDate = new Date('2025-07-24');
  const today = new Date();
  const dayNumber = Math.floor((today - timelineStartDate) / msPerDay) + 1;
  const options = { year: 'numeric', month: 'long', day: 'numeric' };

  function formatMetaDate(day, dateObj) {
    return `Day ${day} of becoming • ${dateObj.toLocaleDateString('en-US', options)}`;
  }


  function estimateSentenceDuration(sentence) {
    const words = sentence.split(' ').length;
    return words * 480 + 2000; // ~480ms per word + 2s between reflections
  }
  

  let isDragging = false;
  let percent = 0;
  let progressInterval = null;
  let isPlaying = false;
  let lastTimelineIndex = -1;
  let timelineIndex = 0;
  let isTimelinePlaying = false;
  let isResumingTimeline = false;
  

  // Mute logic
  muteButton?.addEventListener('click', () => {
    audio.muted = !audio.muted;
    document.getElementById('sound-icon')?.classList.toggle('muted', audio.muted);
    if (!audio.muted) audio.play().catch(() => {});
  });

  // FAB toggle
// FAB toggle
// Update the FAB toggle handler in ui.js (around line 180)
fabToggle?.addEventListener("click", () => {
  fabToggle.classList.toggle("open");
  fabMenu.classList.toggle("fab-hidden");

  if (fabMenu.classList.contains("fab-hidden")) {
    // Menu is closing
    selectedTheme = null;
    const blobCanvas = document.getElementById("hero-blob-canvas");
    if (blobCanvas) {
      blobCanvas.classList.remove("theme-locked");
    }
    
    // Restore original intro and date
    if (window.originalIntro) {
      window.clearStaggeredDisplay?.();
      setTimeout(() => window.displaySentencesStaggered(window.originalIntro), 450);
    }
    
    // Restore the original date line without theme
    const today = new Date();
    const timelineStartDate = new Date('2025-07-24');
    const msPerDay = 1000 * 60 * 60 * 24;
    const dayNumber = Math.floor((today - timelineStartDate) / msPerDay) + 1;
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    updateMetaDateSmoothly(`Day ${dayNumber} of becoming • ${today.toLocaleDateString('en-US', options)}`);
  }
});

let themeLocked = false;


 // Theme button logic
// Replace the theme button logic in ui.js (around line 200-230)

// Theme button logic
document.querySelectorAll('[data-theme]').forEach(btn => {
  btn.addEventListener('click', e => {
    if (themeLocked) return;
    themeLocked = true;
    setTimeout(() => themeLocked = false, 1000);

    const theme = e.target.dataset.theme;

    // ✅ NEW: Activate the clicked button visually
    document.querySelectorAll('#fab-menu button.active').forEach(b => {
      b.classList.remove('active');
      b.classList.add('fading-out');
      setTimeout(() => b.classList.remove('fading-out'), 400); // matches transition time
    });
    e.currentTarget.classList.add('active');

    // ✅ FIXED: Ensure graceful transition between themes
    if (window.isDisplaying) {
      // If text is currently displaying, clear it gracefully
      window.clearStaggeredDisplay();
      
      // Wait for the fade-out to complete before showing new theme
      setTimeout(() => {
        window.loadThemeSentence(theme);
        window.showThemeMeta(theme);
      }, 450); // Slightly longer than the fade-out duration (400ms)
    } else {
      // If no text is displaying, show immediately
      window.loadThemeSentence(theme);
      window.showThemeMeta(theme);
    }

    selectedTheme = theme;

    const blobCanvas = document.getElementById("hero-blob-canvas");
    if (blobCanvas) {
      const color = window.getThemeColor?.(theme);
      if (color) {
        blobCanvas.style.setProperty('--blob-color', color);
        blobCanvas.classList.add("theme-locked");
      }
    }
  });
});



  

// Timeline open
timelineOpen?.addEventListener('click', () => {
  closeFabMenuIfOpen(true);
  // Change background to timeline color
  setScreenBackground('timeline');

  // Fade out launcher and other controls
  timelineLauncher.classList.remove('fade-in');
  timelineLauncher.classList.remove('fade-in-soft');
  timelineLauncher.classList.add('fade-out-soft');
  timelineLauncher.style.pointerEvents = 'none';

  const memoryBtn = document.getElementById('open-memory');
  const fab = document.getElementById('hi-fab');

  if (fab) {
    fab.classList.remove('fade-in');
    fab.classList.add('fade-out-soft');
    fab.style.pointerEvents = 'none';
  }

  if (memoryBtn) {
    memoryBtn.classList.remove('fade-in-soft');
    memoryBtn.classList.add('fade-out-soft');
    memoryBtn.style.pointerEvents = 'none';
  }

  // After fade-out, reveal timeline container and start playback
  setTimeout(() => {
    if (fab) fab.style.display = 'none';
    if (memoryBtn) memoryBtn.style.display = 'none';
    timelineLauncher.style.display = 'none';

    // Remove hidden so we can animate the slide-up
    timelineContainer.classList.remove('hidden');
    // Force reflow to ensure starting transform is applied
    void timelineContainer.offsetWidth;
    timelineContainer.classList.add('visible');
    timelineControls.classList.add('visible');

    percent = 0;
    progressEl.style.width = '0%';
    bead.style.left = '0%';
    lastTimelineIndex = -1;

    timelineToggle.textContent = 'Pause';
    isPlaying = true;
    startTimelinePlayback();
  }, FADE_OUT_DURATION); // allow fade-out to complete
});


// Timeline close
timelineClose?.addEventListener('click', () => {
  // Restore reflection background
  setScreenBackground('reflection');

  timelineContainer.classList.remove('visible');
  timelineControls.classList.remove('visible');

  // After the slide-down animation completes, hide the container
  const onTransitionEnd = (e) => {
    if (e.propertyName === 'transform') {
      timelineContainer.classList.add('hidden');
      timelineContainer.removeEventListener('transitionend', onTransitionEnd);
    }
  };
  timelineContainer.addEventListener('transitionend', onTransitionEnd);

  const isMemory = document.getElementById('memory-screen')?.classList.contains('show');
  const memoryBtn = document.getElementById('open-memory');
  const fab = document.getElementById('hi-fab');

  if (!isMemory) {
    setTimeout(() => {
      if (fab) {
        fab.style.display = 'flex';
        fab.classList.remove('fade-out-soft');
        fab.classList.add('fade-in');
        fab.style.pointerEvents = 'auto';
      }

      if (memoryBtn) {
        memoryBtn.style.display = 'flex';
        memoryBtn.classList.remove('fade-out-soft');
        memoryBtn.classList.add('fade-in-soft');
        memoryBtn.style.pointerEvents = 'auto';
      }

      if (timelineLauncher) {
        timelineLauncher.style.display = 'flex';
        timelineLauncher.classList.remove('fade-out-soft');
        timelineLauncher.classList.add('fade-in');
        timelineLauncher.style.pointerEvents = 'auto';
      }

      // 🌟 Restore the original reflection
      if (window.originalIntro && window.originalIntro.length > 0) {
        // 🔧 Clear timeline playback state so reflection plays fresh
        window.timelinePaused = false;
        window.resumeSentenceDisplay = null;

        // 🔧 Reset reflection playback state
        sentenceIndex = 0;
        wordIndex = 0;
        currentSentences = [];
        currentSpans = [];
        currentP = null;

        window.clearStaggeredDisplay?.();
        setTimeout(() => displaySentencesStaggered(window.originalIntro), 450);

        // 🩹 Fix: Reset meta date to today's reflection after closing timeline
        const today = new Date();
        const timelineStartDate = new Date('2025-07-24');
        const msPerDay = 1000 * 60 * 60 * 24;
        const dayNumber = Math.floor((today - timelineStartDate) / msPerDay) + 1;
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        updateMetaDateSmoothly(`Day ${dayNumber} of becoming • ${today.toLocaleDateString('en-US', options)}`);
      }
    }, 800); // wait for container to finish hiding
  }
});

timelineToggle?.addEventListener('click', () => {
  // Check if timeline is completed
  const isCompleted = timelineIndex >= window.timelineThoughts.length;
  
  if (isPlaying && !isCompleted) {
    // ⏸ Pause timeline (only if not completed)
    stopTimelineProgress();
    window.timelinePaused = true;
    window.timelinePauseTime = performance.now();
    timelineToggle.textContent = 'Play';
    isPlaying = false;
  } else {
    // ▶️ Play/Resume/Restart timeline
    window.timelinePaused = false;
    isPlaying = true;
    isTimelinePlaying = true;  // ADD THIS LINE
    timelineToggle.textContent = 'Pause';

    if (isCompleted) {
      // 🔁 Restart from Day 1
      timelineIndex = 0;
      percent = 0;
      progressEl.style.width = '0%';
      bead.style.left = '0%';
      
      // Clear any saved animation state
      window.savedBeadParams = null;
      window.timelinePauseTime = null;
      window.resumeSentenceDisplay = null;
      lastTimelineIndex = -1;  // ADD THIS LINE

      // Start fresh playback
      startTimelinePlayback();
    } else {
      // Resume paused timeline
      if (window.resumeSentenceDisplay) {
        isResumingTimeline = true;
        window.resumeSentenceDisplay();
        window.resumeSentenceDisplay = null;
      }

      if (window.savedBeadParams && window.timelinePauseTime !== null) {
        resumeBeadAnimation();
      } else {
        startTimelinePlayback();
      }
    }
  }
});

  function startTimelinePlayback() {
    stopTimelineProgress();
  
    const total = window.timelineThoughts.length;
  
    // Calculate current index based on progress %
    timelineIndex = Math.floor((parseFloat(progressEl.style.width) || 0) / (100 / total));
    isTimelinePlaying = true;
    timelineToggle.textContent = 'Pause';
  
    playNextReflection();
  
    const totalDuration = window.timelineThoughts.reduce((sum, sentence) => {
      return sum + estimateSentenceDuration(sentence);
    }, 0);
    
  
    const currentPercent = parseFloat(progressEl.style.width) || 0;
    startBeadAnimation(totalDuration, currentPercent, 100);
  }
  

  function playNextReflection() {
    if (!isTimelinePlaying || timelineIndex >= window.timelineThoughts.length) {
      isTimelinePlaying = false;
      isPlaying = false;  // ADD THIS LINE - sync both flags
      timelineToggle.textContent = 'Play';
      return;
    }
  
    const sentence = window.timelineThoughts[timelineIndex];
    const currentDate = new Date(timelineStartDate.getTime() + timelineIndex * msPerDay);
  
    const total = window.timelineThoughts.length;
    const startPercent = (timelineIndex / total) * 100;
    const endPercent = ((timelineIndex + 1) / total) * 100;
  
    // ✅ If we're resuming, don't re-call displaySentencesStaggered
    if (!window.timelinePaused && !isResumingTimeline) {
      displaySentencesStaggered(
        [sentence],
        () => {
          timelineIndex++;
          if (isTimelinePlaying) playNextReflection();
        },
        formatMetaDate(timelineIndex + 1, currentDate)
      );
    }
    isResumingTimeline = false; // ✅ always clear it after
  }

  function stopTimelineProgress() {
    if (requestId) cancelAnimationFrame(requestId); // cancel bead animation
    if (progressInterval) clearInterval(progressInterval); // if still used
    if (wordDisplayTimeout) clearTimeout(wordDisplayTimeout);
  
    timelinePauseTime = performance.now(); // ✅ store when we paused
    isTimelinePlaying = false;
  }
  
  
  

  // Timeline dragging
  function handleDrag(clientX) {
    const barRect = timelineBar.getBoundingClientRect();
    let x = clientX - barRect.left;
    x = Math.max(0, Math.min(x, barRect.width));
    percent = (x / barRect.width) * 100;
    bead.style.left = `${percent}%`;
    progressEl.style.width = `${percent}%`;

    stopTimelineProgress();
    isPlaying = false;
    timelineToggle.textContent = 'Play';

    const index = Math.floor(percent / (100 / window.timelineThoughts.length));
    if (index !== lastTimelineIndex && index < window.timelineThoughts.length) {
      showSentencesInstant([window.timelineThoughts[index]]);
      lastTimelineIndex = index;
      const currentDate = new Date(timelineStartDate.getTime() + index * msPerDay);
      updateMetaDateSmoothly(`Day ${index + 1} • ${currentDate.toLocaleDateString('en-US', options)}`);
    }
  }

  bead.addEventListener('mousedown', () => isDragging = true);
  document.addEventListener('mouseup', () => isDragging = false);
  document.addEventListener('mousemove', e => { if (isDragging) handleDrag(e.clientX); });

  bead.addEventListener('touchstart', () => isDragging = true);
  document.addEventListener('touchend', () => isDragging = false);
  document.addEventListener('touchmove', e => {
    if (isDragging && e.touches[0]) handleDrag(e.touches[0].clientX);
  });

  // === Memory Navigation ===
  const memoryScreen = document.getElementById('memory-screen');
  const mainScreen = document.getElementById('main-screen');
  const revealBox = document.getElementById('memory-reveal');
    // const backButton = document.getElementById('memory-back');

  // Update active navigation state
  function updateActiveNavItem() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    
    const memoryScreen = document.getElementById('memory-screen');
    const aboutScreen = document.getElementById('about-screen');
    
    if (aboutScreen && !aboutScreen.classList.contains('hidden')) {
      document.getElementById('about-link')?.classList.add('active');
    } else if (memoryScreen && memoryScreen.classList.contains('show')) {
      document.getElementById('memory-link')?.classList.add('active');
    } else {
      document.getElementById('reflection-link')?.classList.add('active');
    }
  }

  window.updateActiveNavItem = updateActiveNavItem;

  function returnToReflection() {
    setScreenBackground('reflection');
    returnButton?.classList.add('hidden');

    const isMemory = memoryScreen?.classList.contains('show');
    const isAbout = aboutScreen?.classList.contains('fade-in');

    // Quickly clear any existing reflection content before showing the screen again
    const resetReflection = () => {
      const typed = document.getElementById('aurelia-typed');
      const plain = document.getElementById('aurelia-plain');
      const srText = document.getElementById('sr-text');

      if (typed) typed.innerHTML = '';
      if (plain) plain.textContent = '';
      if (srText) srText.textContent = '';

      const now = new Date();
      const dayNum = Math.floor((now - timelineStartDate) / msPerDay) + 1;
      metaDate.textContent = formatMetaDate(dayNum, now);
      metaDate.classList.remove('fade-in');
      metaDate.classList.add('fade-out');

      window.isDisplaying = false;
    };

    if (isMemory) {
      // DEACTIVATE MEMORY CANVAS FIRST
      window.memoryCanvasManager?.deactivate();

      memoryScreen.classList.remove('show', 'fade-in');
      memoryScreen.classList.add('fade-out');
      fadeInHeroBlob();

      resetReflection();

      mainScreen.classList.remove('hidden', 'fade-out');
      mainScreen.classList.add('fade-in');

      fab.style.display = 'flex';
      fab.classList.remove('hidden', 'fade-out', 'fade-out-soft');
      fab.classList.add('fade-in');

      timelineLauncher.classList.remove('hidden', 'fade-out-soft');
      timelineLauncher.style.display = 'flex';
      timelineLauncher.classList.add('fade-in');

      revealBox.classList.add('hidden');
      document.body.classList.remove('noscroll');

      setTimeout(() => {
        memoryScreen.classList.add('hidden');
        memoryScreen.classList.remove('fade-out');
      }, 1000);

      if (window.originalIntro) {
        setTimeout(() => displaySentencesStaggered(window.originalIntro), 450);
      }
    }

    if (isAbout) {
      aboutScreen.classList.remove('fade-in');
      aboutScreen.classList.add('fade-out');

      fadeInHeroBlob();

      resetReflection();

      setTimeout(() => {
        aboutScreen.classList.add('hidden');

        // Show main screen when coming from about
        mainScreen?.classList.remove('hidden', 'fade-out');
        mainScreen?.classList.add('fade-in');

        fab?.classList.remove('hidden', 'fade-out');
        fab?.classList.add('fade-in');

        timelineLauncher?.classList.remove('hidden', 'fade-out');
        timelineLauncher?.classList.add('fade-in');

        if (window.originalIntro) {
          setTimeout(() => displaySentencesStaggered(window.originalIntro), 450);
        }

        // 🧠 Delay just a moment to ensure class changes are applied
        setTimeout(() => {
          updateActiveNavItem();
        }, 10);
      }, 500);
    }

    updateActiveNavItem();
  }
  const originalReturnToReflection = returnToReflection;
  returnToReflection = function() {
    removeScrollingState();
    originalReturnToReflection();
  };

  function showMemoryScreen() {
    setScreenBackground('memory');

    fadeOutHeroBlob();
    closeFabMenuIfOpen(true);
    window.clearStaggeredDisplay?.();

    if (timelineContainer.classList.contains('visible')) {
      timelineContainer.classList.remove('visible');
      timelineControls.classList.remove('visible');
      stopTimelineProgress();
    }

    // Fade out reflection screen elements
    mainScreen?.classList.remove('fade-in');
    mainScreen?.classList.add('fade-out');

    fab?.classList.remove('fade-in');
    fab?.classList.add('fade-out');

    timelineLauncher?.classList.remove('fade-in');
    timelineLauncher?.classList.add('fade-out');

    setTimeout(() => {
      // Hide reflection screen
      mainScreen?.classList.add('hidden');
      mainScreen?.classList.remove('fade-out');

      // Hide FAB and timeline via classes only (not display:none!)
      fab?.classList.add('hidden');
      fab?.classList.remove('fade-out');

      timelineLauncher?.classList.add('hidden');
      timelineLauncher?.classList.remove('fade-out');

      // Show memory screen
      memoryScreen?.classList.remove('hidden');
      memoryScreen?.classList.add('show', 'fade-in');
      returnButton?.classList.remove('hidden');

      // Restore memory UI elements after coming from About
      document.getElementById('blob-access-layer')?.classList.remove('hidden');
      document.getElementById('memory-reveal')?.classList.add('hidden');
    // document.getElementById('memory-back')?.classList.remove('hidden');
    // document.getElementById('memory-back')?.classList.add('fade-in');

      // Disable scroll on body again
      document.body.classList.add('noscroll');

      // ACTIVATE MEMORY CANVAS
      window.memoryCanvasManager?.activate();

      updateActiveNavItem();
    }, FADE_OUT_DURATION);
  }

  window.showMemoryScreen = showMemoryScreen;
  window.returnToReflection = returnToReflection;

  document.getElementById('open-memory')?.addEventListener('click', showMemoryScreen);
  

  document.getElementById('logo')?.addEventListener('click', () => {
    returnToReflection();
  });
  
  document.getElementById('logo')?.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      returnToReflection();
    }
  });

  returnButton?.addEventListener('click', () => {
    returnToReflection();
  });

  returnButton?.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      returnToReflection();
    }
  });

    // backButton?.addEventListener('click', () => {
    //   returnToReflection();
    // });

    // backButton?.addEventListener('keydown', e => {
    //   if (e.key === 'Enter' || e.key === ' ') {
    //     e.preventDefault();
    //     returnToReflection();
    //   }
    // });

  // Navigation link handlers

  // Reflection link - same behavior as clicking the logo
  reflectionLink?.addEventListener('click', () => {
    returnToReflection();
  });
  
  reflectionLink?.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      returnToReflection();
    }
  });
  
// Memory link - handle transitions from both reflection and about screens
memoryLink?.addEventListener('click', () => {
  if (timelineContainer?.classList.contains('visible')) {
    timelineContainer.classList.remove('visible');
    timelineControls.classList.remove('visible');
    stopTimelineProgress();
  }
  const aboutScreen = document.getElementById('about-screen');
  const isAbout = aboutScreen && !aboutScreen.classList.contains('hidden');
  
  if (isAbout) {
    // Coming from About screen - need to fade it out first
    aboutScreen.classList.remove('fade-in');
    aboutScreen.classList.add('fade-out');
    
    // Hide about-specific elements
    const aboutContent = document.querySelector('.about-content');
    aboutContent?.classList.remove('visible');
    
    setTimeout(() => {
      aboutScreen.classList.add('hidden');
      
      // Now trigger the memory screen
      window.showMemoryScreen?.();
    }, 500); // Wait for about fade-out
  } else {
    // Coming from reflection screen - use existing behavior
    window.showMemoryScreen?.();
  }
});

memoryLink?.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    window.showMemoryScreen?.();
  }
});

// Initialize active state on page load
updateActiveNavItem();

// Add keyboard support for timeline controls
function addTimelineKeyboardSupport(element, callback) {
  if (!element) return;
  element.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      callback(e);
    }
  });
}

// Apply keyboard support to timeline controls
addTimelineKeyboardSupport(timelineOpen, () => timelineOpen?.click());
addTimelineKeyboardSupport(timelineToggle, () => timelineToggle?.click());
addTimelineKeyboardSupport(timelineClose, () => timelineClose?.click());

// Mute button keyboard support
addTimelineKeyboardSupport(muteButton, () => muteButton?.click());

}); // ← This closes the DOMContentLoaded event listener

function updateMetaDateSmoothly(newText) {
  const metaDate = document.getElementById('meta-date');
  if (!metaDate) return;

  // Skip update if the new text is already visible
  if (metaDate.textContent.trim() === newText.trim() &&
      metaDate.classList.contains('fade-in')) {
    return;
  }

  metaDate.classList.remove('fade-in');
  metaDate.classList.add('fade-out');

  // Wait for fade-out to complete before updating text and fading in
  setTimeout(() => {
    metaDate.textContent = newText;
    void metaDate.offsetWidth; // force reflow
    metaDate.classList.remove('fade-out');
    metaDate.classList.add('fade-in');
  }, 400); // match your transition duration
}