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
let currentMoment = null; // Added for reveal moment feature

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

const numPoints = 18;
for (let i = 0; i < numPoints; i++) {
  heroBlob.points.push({
    angle: (i / numPoints) * 2 * Math.PI,
    phase: Math.random() * 2 * Math.PI,
    speed: 0.0001 + Math.random() * 0.0001
  });
}

// ===== REVEAL MOMENT FUNCTIONS (Added cleanly) =====
// STEP 1: In reflection.js, find the existing fetchAndRevealMoment function and replace it with this:

async function fetchAndRevealMoment(event) {
  event.preventDefault();
  const momentText = document.getElementById('moment-text');
  const revealLink = event.target;
  
  if (!momentText || !revealLink) return;
  
  try {
    // If moment is already showing, hide it smoothly
    if (momentText.classList.contains('fade-in')) {
      momentText.classList.remove('fade-in');
      momentText.style.transform = 'translateY(0.5rem)';
      momentText.classList.add('fade-out');
      revealLink.textContent = 'Reveal Moment';
      revealLink.classList.remove('expanded'); // Remove expanded state
      document.getElementById('aurelia-typed-wrapper')?.classList.remove('moment-revealed');

      
      setTimeout(() => {
        if (momentText.classList.contains('fade-out')) {
          momentText.classList.add('hidden');
          momentText.classList.remove('fade-out');
          momentText.textContent = '';
        }
      }, 1400);
      return;
    }
    
    // Show loading state
    revealLink.textContent = 'Loading...';
    revealLink.classList.remove('expanded'); // Remove expanded state during loading
    
    // Fetch the moment from Supabase
    const res = await fetch(`${SUPABASE_URL}/rest/v1/memories?select=moment&source=eq.daily&theme=is.null&order=created_at.desc&limit=1`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    const data = await res.json();
    const moment = data[0]?.moment || "A quiet moment, unrecorded.";
    
    // Set the content first (while still hidden)
    momentText.textContent = moment;
    
    // Remove hidden class and trigger smooth reveal
    momentText.classList.remove('hidden');
    
    requestAnimationFrame(() => {
      momentText.classList.add('fade-in');
    });
    
    document.getElementById('aurelia-typed-wrapper')?.classList.add('moment-revealed');

    // Update link text and add expanded state
    revealLink.textContent = 'Hide Moment';
    revealLink.classList.add('expanded'); // Add expanded state
    
    // Store current moment
    currentMoment = moment;
    
  } catch (error) {
    console.error('Failed to fetch moment:', error);
    
    // Set fallback content
    momentText.textContent = "The moment remains hidden in shadow.";
    momentText.classList.remove('hidden');
    
    requestAnimationFrame(() => {
      momentText.classList.add('fade-in');
    });
    
    revealLink.textContent = 'Hide Moment';
    revealLink.classList.add('expanded'); // Add expanded state
  }
}


function showRevealMomentButton() {
  const metaDate = document.getElementById('meta-date');
  if (!metaDate) return;
  
  // Check if reveal link already exists
  let revealLink = metaDate.querySelector('.reveal-moment-link');
  if (revealLink) return;
  
  // Only show reveal moment for main reflection (not themes or timeline)
  const hasThemeLabel = metaDate.querySelector('.theme-label');
  const isTimelineActive = document.getElementById('timeline-container')?.classList.contains('visible');
  
  if (hasThemeLabel || isTimelineActive) {
    return; // Don't show reveal moment for themes or timeline
  }
  
  // Create the reveal link and add it inline
  revealLink = document.createElement('a');
  revealLink.href = '#';
  revealLink.className = 'reveal-moment-link';
  revealLink.textContent = 'Reveal Moment';
  revealLink.setAttribute('aria-label', 'Reveal the moment that inspired this reflection');
  
  // Add to the existing meta-date content
  const currentContent = metaDate.innerHTML;
  metaDate.innerHTML = `${currentContent} • `;
  metaDate.appendChild(revealLink);
  
  // Add event listener
  revealLink.addEventListener('click', fetchAndRevealMoment);
  addKeyboardSupport(revealLink, fetchAndRevealMoment);
}

function hideRevealMomentButton() {
  const metaDate = document.getElementById('meta-date');
  const momentText = document.getElementById('moment-text');
  
  if (metaDate) {
    const revealLink = metaDate.querySelector('.reveal-moment-link');
    if (revealLink) {
      // Remove the • and the link
      const content = metaDate.innerHTML;
      const linkIndex = content.lastIndexOf(' • ');
      if (linkIndex !== -1) {
        metaDate.innerHTML = content.substring(0, linkIndex);
      }
    }
  }
  
  if (momentText && momentText.classList.contains('fade-in')) {
    momentText.classList.remove('fade-in');
    momentText.classList.add('fade-out');
    
    // Wait for the FULL animation to complete before cleanup
    setTimeout(() => {
      // Only clean up if it's still in fade-out state (not interrupted)
      if (momentText.classList.contains('fade-out')) {
        momentText.classList.add('hidden');
        momentText.classList.remove('fade-out');
        momentText.textContent = '';
        // DON'T reset any style properties that could cause jerking
      }
    }, 700); // Match the CSS transition duration
  }
}
// ===== END REVEAL MOMENT FUNCTIONS =====

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

// KEEPING YOUR ORIGINAL displaySentencesStaggered - NO CHANGES TO AVOID GLITCHES
function displaySentencesStaggered(sentences, callback) {
  const typed = document.getElementById('aurelia-typed');
  const plain = document.getElementById('aurelia-plain');
  const srText = window.srText;

  // ✅ FULL CLEAR before rendering again
  typed.innerHTML = '';
  plain.innerHTML = '';
  srText.textContent = '';

  // Clear active sentence index / word index if needed
  window.currentSentenceIndex = 0;
  window.wordIndex = 0;
  
  // Clear any existing animations
  activeTimeouts.forEach(clearTimeout);
  activeTimeouts = [];
  
  // Clear existing DOM if animation is in progress
  if (isDisplaying) {
    typed.innerHTML = '';
    plain.textContent = '';
    srText.textContent = '';
  }
  
  isDisplaying = true; // Set flag

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

  setTimeout(() => {
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
    setTimeout(() => {
      showNextSentence(callback);

      // Bring back meta date smoothly
      metaDate.classList.remove('fade-out');
      metaDate.classList.add('fade-in');
    }, 400); // ← fine-tune this for timing
  }, 400); // fade-out duration
}

// Add a proper clear function
window.clearStaggeredDisplay = function() {
  activeTimeouts.forEach(clearTimeout);
  activeTimeouts = [];
  isDisplaying = false;
  typed.innerHTML = '';
  plain.textContent = '';
  srText.textContent = '';
  hideRevealMomentButton(); // Added for reveal moment cleanup
  currentMoment = null; // Added for reveal moment cleanup
}

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
    setTimeout(() => showNextSentence(callback), 2000);
    return;
  }

  const span = currentSpans[wordIndex];

// Force reflow before adding .visible
void span.offsetWidth;
span.classList.add('visible');

  wordIndex++;
  const delay = 320 + Math.floor(Math.random() * 250);
  activeTimeouts.push(setTimeout(() => showNextWord(callback), delay));
}

window.showThemeMeta = function (theme) {
  const metaDate = document.getElementById('meta-date');
  const today = new Date();
  const timelineStartDate = new Date('2025-07-02');
  const msPerDay = 1000 * 60 * 60 * 24;
  const dayNumber = Math.floor((today - timelineStartDate) / msPerDay) + 1;
  const dateStr = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  metaDate.innerHTML = `Day ${dayNumber} of becoming &bull; ${dateStr} &bull; <span class="theme-label">${theme}</span>`;
};

function showSentencesInstant(sentences) {
  activeTimeouts.forEach(clearTimeout);
  typed.classList.add('fade-out');
  setTimeout(() => {
    typed.innerHTML = '';
    plain.textContent = '';
    srText.textContent = '';
    const fullText = sentences.join('\n');
    plain.textContent = fullText;
    srText.textContent = fullText;
    typed.classList.remove('fade-out');
    typed.classList.add('fade-in');
    setTimeout(() => typed.classList.remove('fade-in'), 800);
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
        // Show reveal moment button AFTER everything is loaded and stable
        setTimeout(() => {
          showRevealMomentButton();
        }, 500);
        
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
        // Show reveal moment button AFTER everything is loaded and stable
        setTimeout(() => {
          showRevealMomentButton();
        }, 500);
        
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

const startDate = new Date('2025-07-02');
const today = new Date();
const msPerDay = 1000 * 60 * 60 * 24;
const dayNumber = Math.floor((today - startDate) / msPerDay) + 1;
const options = { year: 'numeric', month: 'long', day: 'numeric' };
metaDate.textContent = `Day ${dayNumber} of becoming • ${today.toLocaleDateString('en-US', options)}`;

const video = document.getElementById('bg-video');
const files = ['demo1.mp4'];
video.src = `assets/${files[Math.floor(Math.random() * files.length)]}`;
video.load();
video.play().catch(() => {});

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

// Add this function to your reflection.js to handle returning to main reflection
window.returnToReflection = function() {
  // Hide other screens
  const aboutScreen = document.getElementById('about-screen');
  const memoryScreen = document.getElementById('memory-screen');
  const mainScreen = document.getElementById('main-screen');
  
  aboutScreen?.classList.add('fade-out');
  memoryScreen?.classList.add('hidden');
  
  // Show main screen
  mainScreen?.classList.remove('fade-out', 'hidden');
  mainScreen?.classList.add('fade-in');
  
  // Return to original intro if available
  if (window.originalIntro && window.originalIntro.length > 0) {
    displaySentencesStaggered(window.originalIntro, () => {
      // Show reveal moment button after returning to main reflection
      setTimeout(() => {
        showRevealMomentButton();
      }, 500);
    });
  }
  
  // Reset meta-date to original state (without theme labels)
  const startDate = new Date('2025-07-02');
  const today = new Date();
  const msPerDay = 1000 * 60 * 60 * 24;
  const dayNumber = Math.floor((today - startDate) / msPerDay) + 1;
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  metaDate.textContent = `Day ${dayNumber} of becoming • ${today.toLocaleDateString('en-US', options)}`;
  
  announceToScreenReader('Returned to main reflection');
};

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
  hideRevealMomentButton(); // Added to hide moment when switching screens
  // This should trigger the memory screen logic
  if (window.startMemoryFlow) {
    window.startMemoryFlow();
    announceToScreenReader('Entered memory screen');
  }
});

// About button - show about screen
aboutLink?.addEventListener('click', () => {
  hideRevealMomentButton(); // Added to hide moment when switching screens
  const aboutScreen = document.getElementById('about-screen');
  const mainScreen = document.getElementById('main-screen');
  const memoryScreen = document.getElementById('memory-screen');
  
  // Hide other screens
  mainScreen?.classList.add('fade-out');
  memoryScreen?.classList.add('hidden');
  
  // Show about screen
  aboutScreen?.classList.remove('hidden', 'fade-out');
  aboutScreen?.classList.add('fade-in');
  
  announceToScreenReader('Viewing about information');
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