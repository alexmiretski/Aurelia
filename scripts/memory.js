console.log("Aurélia memory canvas screen loaded.");

// Memory Canvas Manager Class
class MemoryCanvasManager {
  constructor() {
    this.isActive = false;
    this.animationId = null;
  }

  activate() {
    if (this.isActive) return;
    
    console.log("🧠 Activating memory canvas");
    this.isActive = true;
    
    // Start the memory screen
    startMemoryScreen();
  }

  deactivate() {
    if (!this.isActive) return;
    
    console.log("🧠 Deactivating memory canvas");
    this.isActive = false;
    
    // Stop the memory flow and clear everything
    stopMemoryFlow();
    
    // Extra safety: clear any lingering state
    if (window.memoryAnimationFrame) {
      cancelAnimationFrame(window.memoryAnimationFrame);
      window.memoryAnimationFrame = null;
    }
  }
}

// Create global instance
window.memoryCanvasManager = new MemoryCanvasManager();

const canvas = document.getElementById('memory-canvas');
const ctx = canvas.getContext('2d');
const accessLayer = document.getElementById('blob-access-layer');
const revealBox = document.getElementById('memory-reveal');
const revealedText = document.getElementById('revealed-text');
window.srText = window.srText || document.getElementById('sr-text');

let width, height;

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

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getReducedMotionMultiplier() {
  return prefersReducedMotion() ? 0.3 : 1; // Slower animations for reduced motion
}

// Add this function to calculate responsive blob size
function getResponsiveRadius() {
  const minRadius = 20;  // Minimum radius on mobile
  const maxRadius = 30;  // Maximum radius on desktop
  const minScreen = 320; // Minimum screen width
  const maxScreen = 1200; // Screen width where max radius is reached
  
  const screenWidth = window.innerWidth;
  const scale = Math.min(1, Math.max(0, (screenWidth - minScreen) / (maxScreen - minScreen)));
  
  return {
    base: minRadius + (maxRadius - minRadius) * scale,
    variation: 15 + 15 * scale // Random variation also scales
  };
}

function resizeCanvas() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;

  // Reposition and resize all blobs based on their relative coords
  activeBlobs.forEach(blob => {
    blob.updatePositionFromRelative();
    blob.updateAccessibleButton();
  });
  
  // Update canvas aria-label with current blob count for screen readers
  updateCanvasDescription();
}

function updateCanvasDescription() {
  const blobCount = activeBlobs.length;
  canvas.setAttribute('aria-label', 
    `Memory visualization with ${blobCount} memory bubble${blobCount !== 1 ? 's' : ''} floating. Use Tab to navigate between memory bubbles.`);
}

window.addEventListener('resize', resizeCanvas);

// Theme filter state
let selectedThemes = new Set([
  "dream", "ache", "reflect", "observe", "remember", "feel", "wonder", "drift", "daily", "evolution"
]);

window.toggleThemeFilter = (theme) => {
  if (selectedThemes.has(theme)) {
    selectedThemes.delete(theme);
  } else {
    selectedThemes.add(theme);
  }
  // Remove blobs not matching current filter
  const beforeCount = activeBlobs.length;
  activeBlobs = activeBlobs.filter(blob => {
    const keep = selectedThemes.has(blob.theme);
    if (!keep) {
      inUseSentences.delete(blob.text);
      blob.removeAccessibleButton();
    }
    return keep;
  });
  
  const afterCount = activeBlobs.length;
  const filteredCount = beforeCount - afterCount;
  if (filteredCount > 0) {
    announceToScreenReader(`Filtered ${filteredCount} memory bubbles. ${afterCount} bubbles remaining.`);
  }
  
  updateCanvasDescription();
};

const inUseSentences = new Set();
let memorySentences = [];
let activeBlobs = [];
let lastSpawnTime = 0;
function getRandomSpawnInterval() {
  const min = prefersReducedMotion() ? 3000 : 1500;
  const max = prefersReducedMotion() ? 7000 : 3500;
  return min + Math.random() * (max - min);
}
let spawnInterval = getRandomSpawnInterval();

resizeCanvas();

function getMaxBlobs() {
  // Fewer blobs for reduced motion users to reduce visual complexity
  const baseMax = window.innerWidth < 768 ? 14 : 21;
  return prefersReducedMotion() ? Math.floor(baseMax * 0.6) : baseMax;
}

class MemoryBlob {
  constructor(text, theme) {
    this.text = text;
    this.theme = theme;
    this.id = `blob-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.isHovered = false; // Add hover state
    
    console.log("🧠 MemoryBlob created:", {
      text: this.text,
      theme: this.theme,
      id: this.id
    });
    
    // Use responsive radius
    const { base, variation } = getResponsiveRadius();
    this.baseRadius = base + Math.random() * variation;
    this.radius = this.baseRadius;
    
    this.relX = 0.1 + Math.random() * 0.8;
    this.relY = 0.1 + Math.random() * 0.8;
    this.updatePositionFromRelative();

    // Slower movement for reduced motion
    const motionMultiplier = getReducedMotionMultiplier();
    this.vx = (Math.random() - 0.5) * 0.3 * motionMultiplier;
    this.vy = (Math.random() - 0.5) * 0.3 * motionMultiplier;
    
    this.clicked = false;
    this.age = 0;
    this.maxAge = 1200 + Math.random() * 900;
    this.phase = Math.random() * Math.PI * 2;

    const pointCount = 16;
    this.points = Array.from({ length: pointCount }, (_, i) => ({
      angle: (i / pointCount) * 2 * Math.PI,
      offset: 4 + Math.random() * 8,
      speed: (0.01 + Math.random() * 0.01) * motionMultiplier,
      phase: Math.random() * Math.PI * 2
    }));

    if (this.theme === 'daily') {
      this.getThemeColor = () => window.heroBlob?.currentColor || '#6e9acb';
    } else {
      this.getThemeColor = () => window.getThemeColor?.(this.theme) || "rgba(255,180,240,0.2)";
    }
    
    this.el = this.createAccessibleButton();
  }

  updatePositionFromRelative() {
    const safeWidth = width || window.innerWidth;
    const safeHeight = height || window.innerHeight;
    this.x = this.relX * safeWidth;
    this.y = this.relY * safeHeight;
    
    // Update radius on resize
    const { base, variation } = getResponsiveRadius();
    this.radius = this.baseRadius * (base + variation) / (30 + 30);
  }

  update() {
    if (this.clicked) return;
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > width) this.vx *= -1;
    if (this.y < 0 || this.y > height) this.vy *= -1;
    this.age++;
    this.points.forEach(p => p.phase += p.speed);
    this.updateAccessibleButton();
  }

  draw(ctx, time = performance.now()) {
    ctx.save();
    ctx.translate(this.x, this.y);
  
    let alpha = 1;
    const ratio = this.age / this.maxAge;
    if (!this.clicked) {
      if (ratio < 0.2) alpha = ratio / 0.2;
      else if (ratio > 0.8) alpha = 1 - (ratio - 0.8) / 0.2;
    }
    ctx.globalAlpha = Math.max(alpha * 0.7, 0.05);
    
    ctx.globalCompositeOperation = 'screen';
  
    // Reduced pulse for reduced motion users
    const pulseIntensity = prefersReducedMotion() ? 0.02 : 0.04;
    const pulse = (this.theme === 'daily')
      ? 1 + pulseIntensity * Math.sin(time * 0.0015 + this.phase)
      : 1;

    const coords = this.points.map(p => {
      const bumpIntensity = prefersReducedMotion() ? 0.04 : 0.08;
      const bump = 1 + bumpIntensity * Math.sin(p.phase + time * 0.002);
      const r = this.radius * bump * pulse;
      return {
        x: Math.cos(p.angle) * r,
        y: Math.sin(p.angle) * r
      };
    });
    
    ctx.beginPath();
    
    const lastIdx = coords.length - 1;
    ctx.moveTo(
      (coords[lastIdx].x + coords[0].x) / 2, 
      (coords[lastIdx].y + coords[0].y) / 2
    );
    
    for (let i = 0; i < coords.length; i++) {
      const curr = coords[i];
      const next = coords[(i + 1) % coords.length];
      ctx.quadraticCurveTo(curr.x, curr.y, (curr.x + next.x) / 2, (curr.y + next.y) / 2);
    }
    
    ctx.closePath();
  
    let currentColor = this.getThemeColor();

    // Enhanced glow on hover
    const baseGlow = 40;
    const hoverGlow = this.isHovered ? 80 : baseGlow; // Double the glow on hover

    ctx.fillStyle = currentColor;
    ctx.shadowColor = currentColor;
    ctx.shadowBlur = hoverGlow; // Use dynamic glow
    ctx.fill();
    
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
  }

  isClicked(x, y) {
    const dx = this.x - x;
    const dy = this.y - y;
    const hitRadius = Math.max(25, this.radius * 1.1);
    return dx * dx + dy * dy < hitRadius * hitRadius;
  }

  isOutOfBounds() {
    return this.age > this.maxAge;
  }

  createAccessibleButton() {
    const btn = document.createElement('button');
    
    // Enhanced accessibility
    const preview = this.text.length > 50 ? this.text.substring(0, 50) + '...' : this.text;
    btn.setAttribute('aria-label', 
      `Memory bubble: "${preview}". Theme: ${this.theme || 'unknown'}. Press to reveal full memory.`);
    btn.setAttribute('data-blob-id', this.id);
    btn.setAttribute('data-theme', this.theme);
    
    // Add hover glow effect in JavaScript
    btn.addEventListener('mouseenter', () => {
      this.isHovered = true;
    });
    
    btn.addEventListener('mouseleave', () => {
      this.isHovered = false;
    });
    
    // Enhanced keyboard support
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.reveal();
    });
    
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        this.reveal();
      }
    });
    
    // Add focus and blur events for better UX
    btn.addEventListener('focus', () => {
      announceToScreenReader(`Focused on memory: ${preview}`);
      this.isHovered = true; // Also glow on focus
    });
    
    btn.addEventListener('blur', () => {
      this.isHovered = false;
    });
    
    accessLayer.appendChild(btn);
    return btn;
  }

  updateAccessibleButton() {
    if (!this.el) return;
    
    // Enhanced touch targets for mobile
    const minTouchTarget = 44; // WCAG minimum
    const hitAreaSize = Math.max(minTouchTarget, this.radius * 2.2);
    
    this.el.style.left = `${this.x - hitAreaSize/2}px`;
    this.el.style.top = `${this.y - hitAreaSize/2}px`;
    this.el.style.width = `${hitAreaSize}px`;
    this.el.style.height = `${hitAreaSize}px`;
    this.el.style.display = this.clicked ? 'none' : 'block';
    
    // Add visual focus indicator
    this.el.style.borderRadius = '50%';
  }

  removeAccessibleButton() {
    if (this.el) {
      this.el.remove();
      updateCanvasDescription();
    }
  }

  reveal() {
    if (this.clicked) return;
    this.clicked = true;
    
    // Enhanced screen reader announcement
    const preview = this.text.length > 50 ? this.text.substring(0, 50) + '...' : this.text;
    announceToScreenReader(`Revealing memory: ${preview}`);
    
    showMemoryText(this.text);
  }
}

function spawnBlob() {
  if (activeBlobs.length >= getMaxBlobs() || memorySentences.length === 0) return;
  const available = memorySentences.filter(s =>
    !inUseSentences.has(s.text) && selectedThemes.has(s.theme)
  );
  if (available.length === 0) return;
  const next = available[Math.floor(Math.random() * available.length)];
  inUseSentences.add(next.text);
  activeBlobs.push(new MemoryBlob(next.text, next.theme));
  updateCanvasDescription();
}

// Enhanced canvas click with better feedback
canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  
  let found = false;
  for (let blob of activeBlobs) {
    if (!blob.clicked && blob.isClicked(mx, my)) {
      blob.reveal();
      found = true;
      break;
    }
  }
  
  if (!found) {
    // Provide feedback when clicking empty space
    announceToScreenReader("No memory bubble found at this location. Use Tab to navigate between bubbles.");
  }
});

// Add keyboard navigation for canvas
canvas.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    // Let default Tab behavior handle focus movement
    return;
  }
  
  if (e.key === 'Escape') {
    // Allow escape to close revealed memory
    const revealBox = document.getElementById('memory-reveal');
    if (revealBox && !revealBox.classList.contains('hidden')) {
      hideMemoryText();
      announceToScreenReader('Memory closed. Returned to memory canvas.');
    }
  }
});


let memoryActiveTimeouts = [];
let memorySentenceIndex = 0;
let memoryWordIndex = 0;
let memoryCurrentSpans = [];
let memoryCurrentP = null;

function showMemoryText(text) {
  const memory = memorySentences.find(m => m.text === text);
  const dateLabel = document.getElementById('memory-date');
  
  // Dim the canvas
  const memoryCanvas = document.getElementById('memory-canvas');
  memoryCanvas?.classList.add('dimmed');

  // Enhanced accessibility for memory reveal
  revealBox.setAttribute('aria-live', 'polite');
  revealBox.setAttribute('role', 'dialog');
  revealBox.setAttribute('aria-modal', 'false'); // Not truly modal as canvas is still interactive

  dateLabel.classList.remove('fade-in', 'fade-out');
  void dateLabel.offsetWidth;
  setTimeout(() => {
    dateLabel.classList.add('fade-in');
  }, 1000);

  if (memory?.created_at) {
    const createdAt = new Date(memory.created_at);
    const startDate = new Date('2025-07-24');
    const dayNumber = Math.floor((createdAt - startDate) / (1000 * 60 * 60 * 24)) + 1;

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const month = monthNames[createdAt.getMonth()];
    const day = createdAt.getDate();
    const year = createdAt.getFullYear();
    const dateStr = `${month} ${day}, ${year}`;

    const theme = memory.theme?.toLowerCase() || '';
    let label = theme;
    if (theme === 'daily') label = 'daily reflection';
    if (theme === 'evolution') label = 'evolution';
    const themeLabel = label ? `<em class="theme-label">${label}</em>` : '';

    dateLabel.innerHTML = `Day ${dayNumber} of becoming <span class="dot"> • </span> ${dateStr} <span class="dot"> • </span> ${themeLabel}`;
  }

  // Update screen reader text
  if (window.srText) {
    window.srText.textContent = text;
    announceToScreenReader('Memory revealed. Reading memory text.');
  }

  revealedText.innerHTML = '';
  revealBox.classList.remove('hidden', 'fade-out');
  revealBox.style.removeProperty('display');
  revealedText.style.removeProperty('display');
  revealedText.classList.remove('hidden');
  revealBox.classList.add('fade-in', 'show');

  memoryActiveTimeouts.forEach(clearTimeout);
  memoryActiveTimeouts = [];

  memorySentenceIndex = 0;
  memoryWordIndex = 0;

  const lines = [text];
  showNextMemorySentence(lines);
  
  // Focus management - focus the revealed content for screen readers
  setTimeout(() => {
    revealedText.setAttribute('tabindex', '-1');
    revealedText.focus();
  }, 1500);
}

function hideMemoryText() {
  document.getElementById('memory-reveal')?.classList.remove("show");
  
  // Restore canvas brightness
  const memoryCanvas = document.getElementById('memory-canvas');
  memoryCanvas?.classList.remove('dimmed');

  const dateLabel = document.getElementById('memory-date');
  dateLabel.classList.remove('fade-in');
  dateLabel.classList.add('fade-out');

  activeBlobs.forEach(b => b.clicked = false);
  
  // Clear timeouts
  memoryActiveTimeouts.forEach(clearTimeout);
  memoryActiveTimeouts = [];
}

function showNextMemorySentence(sentences) {
  if (memorySentenceIndex >= sentences.length) {
    document.dispatchEvent(new CustomEvent('memory-sentence-complete'));
    return;
  }

  const line = sentences[memorySentenceIndex];
  memoryCurrentP = document.createElement('p');
  memoryCurrentP.className = 'sentence';
  revealedText.appendChild(memoryCurrentP);

  const words = line.trim().split(/\s+/);
  memoryCurrentSpans = words.map(word => {
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

  memoryCurrentSpans.forEach((span, i) => {
    if (i > 0) memoryCurrentP.appendChild(document.createTextNode(' '));
    memoryCurrentP.appendChild(span);
  });

  showNextMemoryWord(sentences);
}

function showNextMemoryWord(sentences) {
  if (memoryWordIndex >= memoryCurrentSpans.length) {
    memorySentenceIndex++;
    memoryWordIndex = 0;
    
    // Respect reduced motion timing
    const sentenceDelay = prefersReducedMotion() ? 1000 : 2000;
    const hideDelay = prefersReducedMotion() ? 3000 : 6000;
    
    memoryActiveTimeouts.push(setTimeout(() => showNextMemorySentence(sentences), sentenceDelay));
    memoryActiveTimeouts.push(setTimeout(() => {
      hideMemoryText();
    }, hideDelay));
    
    return;
  }

  memoryCurrentSpans[memoryWordIndex].classList.add('visible');
  memoryWordIndex++;
  
  // Faster word display for reduced motion
  const baseDelay = prefersReducedMotion() ? 200 : 320;
  const randomDelay = prefersReducedMotion() ? 100 : 250;
  const delay = baseDelay + Math.floor(Math.random() * randomDelay);
  
  memoryActiveTimeouts.push(setTimeout(() => showNextMemoryWord(sentences), delay));
}

function animate(time = performance.now()) {
  ctx.clearRect(0, 0, width, height);

  if (time - lastSpawnTime > spawnInterval) {
    spawnBlob();
    lastSpawnTime = time;
    spawnInterval = getRandomSpawnInterval();
  }


  activeBlobs.forEach(blob => {
    blob.update();
    blob.draw(ctx, time);
  });

  activeBlobs = activeBlobs.filter(b => {
    const keep = !b.isOutOfBounds();
    if (!keep) {
      b.removeAccessibleButton();
      inUseSentences.delete(b.text);
    }
    return keep;
  });

  window.memoryAnimationFrame = requestAnimationFrame(animate);
}

function startMemoryScreen() {
  if (!window.memoryCanvasManager.isActive) return; // Don't start if not active
  
  console.log("🧠 Starting memory screen with fresh state");
  
  // Ensure we start with a clean slate
  activeBlobs.forEach(blob => blob.removeAccessibleButton());
  activeBlobs = [];
  inUseSentences.clear();
  lastSpawnTime = 0;
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  document.body.classList.add("noscroll");
  document.getElementById("memory-screen").classList.remove("hidden");

  // Announce screen transition
  announceToScreenReader("Entered memory screen. Memory bubbles are loading. Use Tab to navigate between bubbles.");

  const fab = document.getElementById("hi-fab");
  const timelineLauncher = document.getElementById("timeline-launcher");
  const timelineContainer = document.getElementById("timeline-container");
  const mute = document.getElementById("mute-button");
  const logo = document.getElementById("logo");
  const backButton = document.getElementById("memory-back");

  // Hide FAB gracefully but keep layout safe
  fab.classList.remove("fade-in");
  fab.classList.add("fade-out");
  fab.style.pointerEvents = "none";

  // Hide timeline
  timelineLauncher.classList.add("hidden");
  timelineContainer.classList.add("hidden");

  mute.classList.remove("hidden", "fade-out");
  mute.style.display = "flex";

  backButton?.classList.remove("hidden");
  logo.style.display = "block";

  // Focus management - focus the first interactive element after screen loads
  setTimeout(() => {
    const firstFocusable = accessLayer.querySelector('button') || backButton;
    firstFocusable?.focus();
  }, 1000);

  animate();
  fetchDailyThemeReflections();
}

async function fetchDailyThemeReflections() {
  try {
    announceToScreenReader("Loading memory data...");
    
    const response = await fetch(
      "https://trpjxicsckljqvvogwsn.supabase.co/rest/v1/memories?select=reflection,theme,created_at,source&order=created_at.desc&source=in.(daily,daily-theme,evolution)",
      {
        headers: {
          apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRycGp4aWNzY2tsanF2dm9nd3NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NDM4MzMsImV4cCI6MjA2NzExOTgzM30.5RK1Gg8aCDHKvgo499SV7YTI3fT9uxW5BZcvPOSrt0Q",
          Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRycGp4aWNzY2tsanF2dm9nd3NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NDM4MzMsImV4cCI6MjA2NzExOTgzM30.5RK1Gg8aCDHKvgo499SV7YTI3fT9uxW5BZcvPOSrt0Q"
        }
      }
    );

    if (!response.ok) throw new Error(`Supabase error: ${response.statusText}`);

    const data = await response.json();

    memorySentences = data
      .filter(row => row.reflection?.trim())
      .map(row => ({
        text: row.reflection.trim(),
        theme: row.theme?.trim()?.toLowerCase() ||
       (row.source === 'daily' ? 'daily' :
        row.source === 'evolution' ? 'evolution' : null),
        created_at: row.created_at
      }));

    announceToScreenReader(`Loaded ${memorySentences.length} memories. Memory bubbles will begin appearing.`);

  } catch (err) {
    console.error("❌ Error loading reflections:", err);
    announceToScreenReader("Error loading memories. Using fallback content.");
    
    memorySentences = [{
      text: "A quiet thought failed to arrive.",
      theme: null,
      created_at: new Date().toISOString()
    }];
  }
}

function stopMemoryFlow() {
  // Cancel animation frame
  cancelAnimationFrame(window.memoryAnimationFrame);
  window.memoryAnimationFrame = null;

  // Clear canvas completely
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Remove all blobs and their buttons
  activeBlobs.forEach(blob => blob.removeAccessibleButton());
  activeBlobs = [];
  inUseSentences.clear();
  
  // Clear any active timeouts
  memoryActiveTimeouts.forEach(clearTimeout);
  memoryActiveTimeouts = [];
  
  // Reset spawn timing
  lastSpawnTime = 0;
  
  // Reset memory text display state
  memorySentenceIndex = 0;
  memoryWordIndex = 0;
  memoryCurrentSpans = [];
  memoryCurrentP = null;
  
  // Hide any revealed memory text
  const revealBox = document.getElementById('memory-reveal');
  if (revealBox && !revealBox.classList.contains('hidden')) {
    hideMemoryText();
  }
  
  console.log("🧠 Memory flow stopped, all state cleared");
  announceToScreenReader("Memory screen closed.");
}

// Update the global function assignments
window.startMemoryFlow = () => window.memoryCanvasManager.activate();
window.stopMemoryFlow = () => window.memoryCanvasManager.deactivate();