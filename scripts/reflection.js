// scripts/reflection.js

console.log("Aurelia reflection logic loaded.");

function lerpColor(c1, c2, t) {
  const [r1, g1, b1] = c1.match(/\w\w/g).map(h => parseInt(h, 16));
  const [r2, g2, b2] = c2.match(/\w\w/g).map(h => parseInt(h, 16));
  const r = Math.round(r1 + (r2 - r1) * t).toString(16).padStart(2, '0');
  const g = Math.round(g1 + (g2 - g1) * t).toString(16).padStart(2, '0');
  const b = Math.round(b1 + (b2 - b1) * t).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

let heroBlobStarted = false;
let isDisplaying = false;

function startHeroBlob() {
  if (heroBlobStarted) return;
  heroBlobStarted = true;
  requestAnimationFrame(drawHeroBlob);
}


const audio = document.getElementById('bg-audio');
const muteButton = document.getElementById('mute-button');


const SUPABASE_URL = 'https://trpjxicsckljqvvogwsn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRycGp4aWNzY2tsanF2dm9nd3NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NDM4MzMsImV4cCI6MjA2NzExOTgzM30.5RK1Gg8aCDHKvgo499SV7YTI3fT9uxW5BZcvPOSrt0Q';

const metaDate = document.getElementById('meta-date');
const plain = document.getElementById('aurelia-plain');
const typed = document.getElementById('aurelia-typed');
const srText = document.getElementById('sr-text');

function revealMetaDate() {
  const meta = document.getElementById('meta-date');
  if (!meta) return;

  meta.style.visibility = 'visible'; // step 1

  // Force reflow to ensure visibility is applied before opacity change
  void meta.offsetWidth;

  meta.classList.remove('fade-out');
  meta.classList.add('fade-in');
}



let activeTimeouts = [];

function scheduleTimeout(fn, delay) {
  const id = setTimeout(fn, delay);
  activeTimeouts.push(id);
  return id;
}
let originalIntro = [];

window.timelinePaused = false;

let timelineStartTime = null;
let timelinePauseTime = null;
let isResuming = false;
let requestId = null;
let savedBeadParams = { duration: 0, startPercent: 0, endPercent: 100 };
let wordDisplayTimeout = null;
let sentenceIndex = 0;
let wordIndex = 0;
let currentSentences = [];
let currentSpans = [];
let currentP = null;

const themeColors = [
  '#6e9acb',
  '#cda6dd',
  '#f8c6b5',
  '#ffe89e',
  '#a3e0d9'
];

const heroBlob = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
  radius: Math.min(window.innerWidth, window.innerHeight) * 0.25,
  colorIndex: 0,
  points: [],
  scale: 0.25,
  currentColor: '#6e9acb',
  startColor: '#6e9acb',       // ← add this line
  targetColor: '#6e9acb',
  colorLerpProgress: 1
};

window.heroBlob = heroBlob;

const numPoints = 18
;
for (let i = 0; i < numPoints; i++) {
  heroBlob.points.push({
    angle: (i / numPoints) * 2 * Math.PI,
    phase: Math.random() * 2 * Math.PI,
    speed: 0.0001 + Math.random() * 0.0001

  });
}



window.loadThemeSentence = function(theme) {
  const sentence = window.dailyThemeReflections?.[theme];
  if (sentence) displaySentencesStaggered([sentence]);
  else displaySentencesStaggered(["A gentle thought, not yet formed."]);
};

function moveBeadTo(index, total) {
  const bead = document.getElementById('timeline-bead');
  const progressEl = document.getElementById('timeline-progress');
  const percent = total <= 1 ? index * 100 : (index / (total - 1)) * 100;
  bead.style.left = `${percent}%`;
  progressEl.style.width = `${percent}%`;
}

function startBeadAnimation(duration, startPercent, endPercent) {
  const bead = window.bead;
  const progressEl = window.progressEl;

  timelinePaused = false;
  timelineStartTime = performance.now();
  timelinePauseTime = null;
  savedBeadParams = { duration, startPercent, endPercent };

  function animate(currentTime) {
    if (timelinePaused) return;

    const elapsed = currentTime - timelineStartTime;
    const progress = Math.min(elapsed / duration, 1);
    const currentPercent = startPercent + (endPercent - startPercent) * progress;

    bead.style.left = `${currentPercent}%`;
    progressEl.style.width = `${currentPercent}%`;

    if (progress < 1) {
      requestId = requestAnimationFrame(animate);
    } else {
      bead.style.left = `${endPercent}%`;
      progressEl.style.width = `${endPercent}%`;
      document.dispatchEvent(new Event("timeline-complete"));
    }
  }

  requestId = requestAnimationFrame(animate);
}


function resumeBeadAnimation() {
  if (!timelinePaused || timelinePauseTime === null) return;

  const { duration, startPercent, endPercent } = savedBeadParams;
  const timePaused = performance.now() - timelinePauseTime;
  timelineStartTime += timePaused;
  timelinePaused = false;

  function animate(currentTime) {
    if (timelinePaused) return;
    const elapsed = currentTime - timelineStartTime;
    const progress = Math.min(elapsed / duration, 1);
    const currentPercent = startPercent + (endPercent - startPercent) * progress;
    window.bead.style.left = `${currentPercent}%`;
    window.progressEl.style.width = `${currentPercent}%`;
    if (progress < 1) {
      requestId = requestAnimationFrame(animate);
    } else {
      document.dispatchEvent(new Event("timeline-complete"));
    }
  }

  requestId = requestAnimationFrame(animate);
}

function displaySentencesStaggered(sentences, callback) {
  const typed = document.getElementById('aurelia-typed');
  const plain = document.getElementById('aurelia-plain');
  const srText = window.srText;

  // Reset active sentence index / word index before rendering again
  window.currentSentenceIndex = 0;
  window.wordIndex = 0;

  // Clear any existing animations
  activeTimeouts.forEach(clearTimeout);
  activeTimeouts = [];

  // Mark as displaying to prevent overlaps
  isDisplaying = true;

  sentenceIndex = 0;
  wordIndex = 0;
  currentSentences = sentences;
  isResuming = false;

  if (metaDate.classList.contains('fade-in')) {
    metaDate.classList.remove('fade-in');
    metaDate.classList.add('fade-out');
  }

  // Fade out typed content first
  typed.classList.remove('fade-in');
  typed.classList.add('fade-out');

  scheduleTimeout(() => {
    typed.innerHTML = '';
    plain.textContent = '';
    srText.textContent = '';

    const fullText = sentences.join('\n');
    plain.textContent = fullText;
    srText.textContent = fullText;

    // Now fade typed content back in before showing first word
    typed.classList.remove('fade-out');
    typed.classList.add('fade-in');

    // Delay showing first word slightly after fade begins
    scheduleTimeout(() => {
      showNextSentence(() => {
        metaDate.classList.remove('fade-out');
        metaDate.classList.add('fade-in');
        if (callback) callback();
      });
    }, 400); // ← fine-tune this for timing
  }, 400); // fade-out duration
}

// Add a proper clear function
window.clearStaggeredDisplay = function() {
  activeTimeouts.forEach(clearTimeout);
  activeTimeouts = [];
  
  const typed = document.getElementById('aurelia-typed');
  const plain = document.getElementById('aurelia-plain');
  const srText = document.getElementById('sr-text');

  // Only proceed if we're currently displaying something
  if (!isDisplaying) return;
  
  isDisplaying = false; // Set flag immediately to prevent overlaps

  // ✨ Add fade-out to current text (smooth transition)
  typed.classList.remove('fade-in');
  typed.classList.add('fade-out');

  scheduleTimeout(() => {
    typed.innerHTML = '';
    plain.textContent = '';
    srText.textContent = '';
    
    // Remove fade-out class so next content can fade in properly
    typed.classList.remove('fade-out');
  }, 400); // Matches your existing fade-out timing
};

function showNextSentence(callback) {
  if (sentenceIndex >= currentSentences.length) {
    isDisplaying = false; // Clear flag when animation completes
    document.dispatchEvent(new CustomEvent('sentence-complete'));
    if (callback) callback();
    return;
  }

  const line = currentSentences[sentenceIndex];

  // ⚠️ Don't create new DOM if we're resuming
  if (isResuming && currentP && currentSpans.length > 0) {
    isResuming = false;
    showNextWord(callback);
    return;
  }

  currentP = document.createElement('p');
  currentP.className = 'sentence';
  typed.appendChild(currentP);

  const words = line.split(' ');
  currentSpans = words.map(word => {
    const wordSpan = document.createElement('span');
    wordSpan.classList.add('word');
    [...word].forEach(letter => {
      const letterSpan = document.createElement('span');
      letterSpan.className = 'letter';
      letterSpan.textContent = letter;
      wordSpan.appendChild(letterSpan);
    });
    return wordSpan;
  });

  currentSpans.forEach((span, i) => {
    if (i > 0) currentP.appendChild(document.createTextNode(' '));
    currentP.appendChild(span);
  });

  showNextWord(callback);
}


function showNextWord(callback) {
  if (timelinePaused) {
    if (!window.resumeSentenceDisplay) {
      window.resumeSentenceDisplay = () => showNextWord(callback);
    }
    return;
  }

  if (wordIndex >= currentSpans.length) {
    sentenceIndex++;
    wordIndex = 0;
    currentP = null; // ← 🧠 this ensures next sentence DOM is built fresh
    scheduleTimeout(() => showNextSentence(callback), 2000);
    return;
  }

  const span = currentSpans[wordIndex];

// Force reflow before adding .visible
void span.offsetWidth;
span.classList.add('visible');

  wordIndex++;
  const delay = 320 + Math.floor(Math.random() * 250);
  scheduleTimeout(() => showNextWord(callback), delay);
}


window.showThemeMeta = function (theme) {
  const metaDate = document.getElementById('meta-date');
  const today = new Date();
const timelineStartDate = new Date('2025-07-24');
  const msPerDay = 1000 * 60 * 60 * 24;
  const dayNumber = Math.floor((today - timelineStartDate) / msPerDay) + 1;
  const dateStr = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  metaDate.innerHTML = `Day ${dayNumber} of becoming &bull; ${dateStr} &bull; <span class="theme-label">${theme}</span>`;

};


function showSentencesInstant(sentences) {
  activeTimeouts.forEach(clearTimeout);
  typed.classList.add('fade-out');
  scheduleTimeout(() => {
    typed.innerHTML = '';
    plain.textContent = '';
    srText.textContent = '';
    const fullText = sentences.join('\n');
    plain.textContent = fullText;
    srText.textContent = fullText;
    typed.classList.remove('fade-out');
    typed.classList.add('fade-in');
    scheduleTimeout(() => typed.classList.remove('fade-in'), 800);
    sentences.forEach(line => {
      const p = document.createElement('p');
      p.className = 'sentence';
      line.split(' ').forEach((word, i) => {
        const wordSpan = document.createElement('span');
        wordSpan.classList.add('word', 'fade-word');
        wordSpan.style.animationDelay = `${i * 320}ms`;
        [...word].forEach(letter => {
          const letterSpan = document.createElement('span');
          letterSpan.className = 'letter';
          letterSpan.textContent = letter;
          wordSpan.appendChild(letterSpan);
        });
        if (i > 0) p.appendChild(document.createTextNode(' '));
        p.appendChild(wordSpan);
      });
      typed.appendChild(p);
    });
  }, 400);
}

const soundStart = document.getElementById('sound-start');
soundStart?.addEventListener('click', async () => {
  enterFullscreen();


  try {
    const soundPrompt = document.getElementById('sound-prompt');
    const soundHint = document.getElementById('sound-hint');
    const fabToggle = document.getElementById("fab-toggle");
    const timelineLauncher = document.getElementById("timeline-launcher");
    audio.muted = false;
    await audio.play().catch(() => {});

    if (muteButton) {
      muteButton.classList.remove('sound-off');
      muteButton.classList.add('sound-on');
    }
    soundPrompt.classList.add('hidden');
    soundHint?.classList.add('hidden');
    document.getElementById('logo')?.classList.remove('disabled');


    const res = await fetch(`${SUPABASE_URL}/rest/v1/memories?select=reflection&source=eq.daily&theme=is.null&order=created_at.desc&limit=1`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    const data = await res.json();
    const latestReflection = data[0]?.reflection || "Today, I simply breathed.";
    window.originalIntro = [latestReflection];

    document.getElementById('hero-blob-canvas').style.opacity = 1;
    startHeroBlob();  

    setTimeout(() => {
      displaySentencesStaggered([latestReflection], () => {
        fabToggle.style.opacity = 1;
        fabToggle.style.pointerEvents = 'auto';
      
        timelineLauncher.style.opacity = 1;
        timelineLauncher.style.pointerEvents = 'auto';
      
        const mainNav = document.getElementById('main-nav');
const hamburgerButton = document.getElementById('hamburger-button');

if (window.innerWidth <= 768) {
  // On mobile, show hamburger button
  hamburgerButton.classList.remove('hidden');
  hamburgerButton.classList.add('visible');
  // Keep nav hidden until hamburger is clicked
  mainNav.classList.remove('hidden');
} else {
  // On desktop, show nav directly
  mainNav.classList.remove('hidden');
  mainNav.classList.add('visible');
}
      
        document.body.classList.add('loaded');
        document.body.classList.add('ready-for-ui');
      });
      
    
  }, 2000);

  const timelineRes = await fetch(`${SUPABASE_URL}/rest/v1/memories?select=created_at,reflection&source=eq.daily&theme=is.null&order=created_at.asc&limit=7`, {
    headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    const timelineData = await timelineRes.json();
    const byDate = {};
    for (const item of timelineData) {
      const dateKey = new Date(item.created_at).toISOString().split('T')[0];
      byDate[dateKey] = item.reflection;
    }
    const sortedDates = Object.keys(byDate).sort();
    window.timelineThoughts = sortedDates.map(date => byDate[date]);

    const themeRes = await fetch(`${SUPABASE_URL}/rest/v1/memories?select=theme,reflection,created_at&source=eq.daily-theme&order=created_at.desc`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    const themeData = await themeRes.json();
    const byTheme = {};
    for (const item of themeData) {
      const t = item.theme?.trim().toLowerCase();
      if (t && !byTheme[t]) byTheme[t] = item.reflection;
    }
    window.dailyThemeReflections = byTheme;
  } catch (err) {
    console.error("Failed to load reflections", err);
    displaySentencesStaggered(["Something shimmered. I felt it pass."]);
    document.getElementById('sound-prompt')?.classList.add('hidden');
  }
});

const skipSound = document.getElementById('skip-sound-link');
skipSound?.addEventListener('click', async (e) => {
  e.preventDefault();
  enterFullscreen();

  try {
    const soundPrompt = document.getElementById('sound-prompt');
    const soundHint = document.getElementById('sound-hint');
    const fabToggle = document.getElementById("fab-toggle");
    const timelineLauncher = document.getElementById("timeline-launcher");

    // Mute sound
    audio.muted = true;
    document.querySelector('.sound-bars')?.classList.add('muted');

    await audio.play().catch(() => {}); // unlock audio context in some browsers

    // Hide prompt
    soundPrompt.classList.add('hidden');
    soundHint?.classList.add('hidden');
    document.getElementById('logo')?.classList.remove('disabled');


    // Trigger the same reflection logic
    const res = await fetch(`${SUPABASE_URL}/rest/v1/memories?select=reflection&source=eq.daily&theme=is.null&order=created_at.desc&limit=1`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    const data = await res.json();
    const latestReflection = data[0]?.reflection || "Today, I simply breathed.";
    window.originalIntro = [latestReflection];

    document.getElementById('hero-blob-canvas').style.opacity = 1;
    startHeroBlob();  
    
    setTimeout(() => {
      displaySentencesStaggered([latestReflection], () => {
        fabToggle.style.opacity = 1;
        fabToggle.style.pointerEvents = 'auto';
      
        timelineLauncher.style.opacity = 1;
        timelineLauncher.style.pointerEvents = 'auto';
      
        const mainNav = document.getElementById('main-nav');
const hamburgerButton = document.getElementById('hamburger-button');

if (window.innerWidth <= 768) {
  // On mobile, show hamburger button
  hamburgerButton.classList.remove('hidden');
  hamburgerButton.classList.add('visible');
  // Keep nav hidden until hamburger is clicked
  mainNav.classList.remove('hidden');
} else {
  // On desktop, show nav directly
  mainNav.classList.remove('hidden');
  mainNav.classList.add('visible');
}
      
        document.body.classList.add('loaded');
        document.body.classList.add('ready-for-ui');
      });
      
      
    }, 2000); // adjust delay as needed
    

    // Load timeline & theme reflections (same as in soundStart logic)
    const timelineRes = await fetch(`${SUPABASE_URL}/rest/v1/memories?select=created_at,reflection&source=eq.daily&theme=is.null&order=created_at.asc&limit=7`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    const timelineData = await timelineRes.json();
    const byDate = {};
    for (const item of timelineData) {
      const dateKey = new Date(item.created_at).toISOString().split('T')[0];
      byDate[dateKey] = item.reflection;
    }
    const sortedDates = Object.keys(byDate).sort();
    window.timelineThoughts = sortedDates.map(date => byDate[date]);

    const themeRes = await fetch(`${SUPABASE_URL}/rest/v1/memories?select=theme,reflection,created_at&source=eq.daily-theme&order=created_at.desc`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    const themeData = await themeRes.json();
    const byTheme = {};
    for (const item of themeData) {
      const t = item.theme?.trim().toLowerCase();
      if (t && !byTheme[t]) byTheme[t] = item.reflection;
    }
    window.dailyThemeReflections = byTheme;
  } catch (err) {
    console.error("Failed to skip sound and load reflections:", err);
    displaySentencesStaggered(["Something shimmered. I felt it pass."]);
    document.getElementById('sound-prompt')?.classList.add('hidden');
  }
});


const startDate = new Date('2025-07-24');
const today = new Date();
const msPerDay = 1000 * 60 * 60 * 24;
const dayNumber = Math.floor((today - startDate) / msPerDay) + 1;
const options = { year: 'numeric', month: 'long', day: 'numeric' };
metaDate.textContent = `Day ${dayNumber} of becoming • ${today.toLocaleDateString('en-US', options)}`;


const heroCanvas = document.getElementById('hero-blob-canvas');
const heroCtx = heroCanvas.getContext('2d');

function resizeHeroCanvas() {
  heroCanvas.width = window.innerWidth;
  heroCanvas.height = window.innerHeight;

  heroBlob.x = window.innerWidth / 2;
  heroBlob.y = window.innerHeight / 2;
  heroBlob.radius = Math.min(window.innerWidth, window.innerHeight) * 0.25;
}

resizeHeroCanvas();
window.addEventListener('resize', resizeHeroCanvas);

// In your drawHeroBlob function, replace just the drawing part:

function drawHeroBlob(time = performance.now()) {
  heroCtx.clearRect(0, 0, heroCanvas.width, heroCanvas.height);
  const { x, y, radius, points } = heroBlob;
  const coords = points.map(p => {
    const bump = 1 + 0.08 * Math.sin(p.phase + time * 0.0015);
    const r = radius * bump;
    return {
      x: Math.cos(p.angle) * r,
      y: Math.sin(p.angle) * r
    };
  });

  heroCtx.save();
  heroCtx.translate(x, y);
  heroCtx.scale(heroBlob.scale, heroBlob.scale);

  heroCtx.beginPath();
  
  // Start between the last and first point (not at first point)
  const lastIdx = coords.length - 1;
  heroCtx.moveTo(
    (coords[lastIdx].x + coords[0].x) / 2, 
    (coords[lastIdx].y + coords[0].y) / 2
  );
  
  // Draw through all points including wrapping back to start
  for (let i = 0; i < coords.length; i++) {
    const curr = coords[i];
    const next = coords[(i + 1) % coords.length];
    heroCtx.quadraticCurveTo(curr.x, curr.y, (curr.x + next.x) / 2, (curr.y + next.y) / 2);
  }
  
  heroCtx.closePath();

  // Rest of the function remains exactly the same...
  // Interpolate using startColor → targetColor
  if (heroBlob.colorLerpProgress < 1) {
    heroBlob.colorLerpProgress += 0.01;
    if (heroBlob.colorLerpProgress > 1) heroBlob.colorLerpProgress = 1;
    heroBlob.currentColor = lerpColor(
      heroBlob.startColor.replace('#', ''),
      heroBlob.targetColor.replace('#', ''),
      heroBlob.colorLerpProgress
    );
  }

  const c1 = heroBlob.currentColor;
  const c2 = themeColors[(heroBlob.colorIndex + 1) % themeColors.length];

  const grad = heroCtx.createRadialGradient(0, 0, 0, 0, 0, radius * 1.2);
  grad.addColorStop(0, c1);
  grad.addColorStop(1, c2);

  const blobCanvas = document.getElementById('hero-blob-canvas');

  if (selectedTheme && blobCanvas?.classList.contains('theme-locked')) {
    // Use solid fill from selected theme color
    const themeColor = getComputedStyle(blobCanvas).getPropertyValue('--blob-color')?.trim() || '#ffffff';
    heroCtx.fillStyle = themeColor;
  } else {
    // Use shifting gradient
    heroCtx.fillStyle = grad;
  }

  heroCtx.shadowColor = c1;
  heroCtx.shadowBlur = 60;
  heroCtx.fill();
  heroCtx.restore();

  points.forEach(p => p.phase += p.speed);

  if (heroBlob.scale < 1) {
    heroBlob.scale += 0.001;
    if (heroBlob.scale > 1) heroBlob.scale = 1;
  }

  requestAnimationFrame(drawHeroBlob);
}

setInterval(() => {
  heroBlob.colorIndex = (heroBlob.colorIndex + 1) % themeColors.length;
  heroBlob.startColor = heroBlob.currentColor;
  heroBlob.targetColor = themeColors[heroBlob.colorIndex];
  heroBlob.colorLerpProgress = 0;
}, 8000); // Change color every 8 seconds

// Add keyboard support function
function addKeyboardSupport(element, callback) {
  if (!element) return;
  
  element.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      callback(e);
    }
  });
}

// Screen reader announcements
function announceToScreenReader(message) {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  document.body.appendChild(announcement);
  setTimeout(() => document.body.removeChild(announcement), 1000);
}

// Navigation button event handlers
const reflectionLink = document.getElementById('reflection-link');
const memoryLink = document.getElementById('memory-link');
const aboutLink = document.getElementById('about-link');
const logo = document.getElementById('logo');

// Reflection button - return to main reflection view
reflectionLink?.addEventListener('click', () => {
  if (window.returnToReflection) window.returnToReflection();
});



// Memory button - navigate to memory screen
memoryLink?.addEventListener('click', () => {
  // This should trigger the memory screen logic
  if (window.startMemoryFlow) {
    window.startMemoryFlow();
    announceToScreenReader('Entered memory screen');
  }
});

// About button - show about screen
aboutLink?.addEventListener('click', () => {
  const aboutScreen = document.getElementById('about-screen');
  const mainScreen = document.getElementById('main-screen');
  const memoryScreen = document.getElementById('memory-screen');
  
  // Hide other screens
  mainScreen?.classList.add('fade-out');
  memoryScreen?.classList.add('hidden');
  
  // Show about screen
  aboutScreen?.classList.remove('hidden', 'fade-out');
  aboutScreen?.classList.add('fade-in');
  
  announceToScreenReader('Viewing who she is');
});

// Logo button - return to reflection (same as reflection link)
logo?.addEventListener('click', () => {
  reflectionLink?.click();
});

// Add keyboard support to all navigation elements
addKeyboardSupport(reflectionLink, () => {
  if (window.returnToReflection) window.returnToReflection();
});

addKeyboardSupport(memoryLink, () => memoryLink?.click());
addKeyboardSupport(aboutLink, () => aboutLink?.click());
addKeyboardSupport(logo, () => logo?.click());



