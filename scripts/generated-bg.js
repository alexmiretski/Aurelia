// scripts/generated-bg.js - AUTHENTIC RIBBON FLOW WITH THEME COLORS

console.log("🌀 Authentic ribbon flow starting...");

document.addEventListener('DOMContentLoaded', function() {
  console.log("🌀 Creating authentic ribbon canvas");

  const canvas = document.createElement("canvas");
  canvas.id = "generated-bg";
  canvas.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: -5;
    pointer-events: none;
    display: block;
    opacity: 1;
    mix-blend-mode: screen;
  `;

  document.body.appendChild(canvas);

  // Balanced configs for visibility with controlled density
  var Configs = {
    backgroundColor: '#0f0e2e',
    particleNum:1000,
    step: 3,
    base: 1000,
    zInc: 0.001,
    maxLifetime: 300,
    fadeSpeed: 0.03
  };

  var context,
      screenWidth,
      screenHeight,
      centerX,
      centerY,
      particles = [],
      hueBase = 0,
      simplexNoise,
      zoff = 0;

  // Simplex Noise implementation
  function SimplexNoise(r) {
    if (r == undefined) r = Math;
    this.grad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];
    this.p = [];
    for (var i=0; i<256; i++) {
      this.p[i] = Math.floor(r.random()*256);
    }
    for (var i=0; i<512; i++) {
      this.perm[i] = this.p[i & 255];
      this.permMod12[i] = this.perm[i] % 12;
    }
  }
  SimplexNoise.prototype = {
    perm: [],
    permMod12: [],
    dot: function(g, x, y) {
      return g[0]*x + g[1]*y;
    },
    noise: function(xin, yin) {
      var n0, n1, n2;
      var F2 = 0.5*(Math.sqrt(3.0)-1.0);
      var s = (xin+yin)*F2;
      var i = Math.floor(xin+s);
      var j = Math.floor(yin+s);
      var G2 = (3.0-Math.sqrt(3.0))/6.0;
      var t = (i+j)*G2;
      var X0 = i-t;
      var Y0 = j-t;
      var x0 = xin-X0;
      var y0 = yin-Y0;
      var i1, j1;
      if(x0>y0) {i1=1; j1=0;}
      else {i1=0; j1=1;}
      var x1 = x0 - i1 + G2;
      var y1 = y0 - j1 + G2;
      var x2 = x0 - 1.0 + 2.0 * G2;
      var y2 = y0 - 1.0 + 2.0 * G2;
      var ii = i & 255;
      var jj = j & 255;
      var gi0 = this.permMod12[ii+this.perm[jj]];
      var gi1 = this.permMod12[ii+i1+this.perm[jj+j1]];
      var gi2 = this.permMod12[ii+1+this.perm[jj+1]];
      var t0 = 0.5 - x0*x0-y0*y0;
      if(t0<0) n0 = 0.0;
      else {
        t0 *= t0;
        n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0);
      }
      var t1 = 0.5 - x1*x1-y1*y1;
      if(t1<0) n1 = 0.0;
      else {
        t1 *= t1;
        n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1);
      }
      var t2 = 0.5 - x2*x2-y2*y2;
      if(t2<0) n2 = 0.0;
      else {
        t2 *= t2;
        n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2);
      }
      return 70.0 * (n0 + n1 + n2);
    },
    noise3D: function(xin, yin, zin) {
      var n0, n1, n2, n3;
      var F3 = 1.0/3.0;
      var s = (xin+yin+zin)*F3;
      var i = Math.floor(xin+s);
      var j = Math.floor(yin+s);
      var k = Math.floor(zin+s);
      var G3 = 1.0/6.0;
      var t = (i+j+k)*G3;
      var X0 = i-t;
      var Y0 = j-t;
      var Z0 = k-t;
      var x0 = xin-X0;
      var y0 = yin-Y0;
      var z0 = zin-Z0;
      var i1, j1, k1;
      var i2, j2, k2;
      if(x0>=y0) {
        if(y0>=z0) {i1=1; j1=0; k1=0; i2=1; j2=1; k2=0;}
        else if(x0>=z0) {i1=1; j1=0; k1=0; i2=1; j2=0; k2=1;}
        else {i1=0; j1=0; k1=1; i2=1; j2=0; k2=1;}
      }
      else {
        if(y0<z0) {i1=0; j1=0; k1=1; i2=0; j2=1; k2=1;}
        else if(x0<z0) {i1=0; j1=1; k1=0; i2=0; j2=1; k2=1;}
        else {i1=0; j1=1; k1=0; i2=1; j2=1; k2=0;}
      }
      var x1 = x0 - i1 + G3;
      var y1 = y0 - j1 + G3;
      var z1 = z0 - k1 + G3;
      var x2 = x0 - i2 + 2.0*G3;
      var y2 = y0 - j2 + 2.0*G3;
      var z2 = z0 - k2 + 2.0*G3;
      var x3 = x0 - 1.0 + 3.0*G3;
      var y3 = y0 - 1.0 + 3.0*G3;
      var z3 = z0 - 1.0 + 3.0*G3;
      var ii = i & 255;
      var jj = j & 255;
      var kk = k & 255;
      var gi0 = this.permMod12[ii+this.perm[jj+this.perm[kk]]];
      var gi1 = this.permMod12[ii+i1+this.perm[jj+j1+this.perm[kk+k1]]];
      var gi2 = this.permMod12[ii+i2+this.perm[jj+j2+this.perm[kk+k2]]];
      var gi3 = this.permMod12[ii+1+this.perm[jj+1+this.perm[kk+1]]];
      var t0 = 0.6 - x0*x0 - y0*y0 - z0*z0;
      if(t0<0) n0 = 0.0;
      else {
        t0 *= t0;
        n0 = t0 * t0 * this.dot3(this.grad3[gi0], x0, y0, z0);
      }
      var t1 = 0.6 - x1*x1 - y1*y1 - z1*z1;
      if(t1<0) n1 = 0.0;
      else {
        t1 *= t1;
        n1 = t1 * t1 * this.dot3(this.grad3[gi1], x1, y1, z1);
      }
      var t2 = 0.6 - x2*x2 - y2*y2 - z2*z2;
      if(t2<0) n2 = 0.0;
      else {
        t2 *= t2;
        n2 = t2 * t2 * this.dot3(this.grad3[gi2], x2, y2, z2);
      }
      var t3 = 0.6 - x3*x3 - y3*y3 - z3*z3;
      if(t3<0) n3 = 0.0;
      else {
        t3 *= t3;
        n3 = t3 * t3 * this.dot3(this.grad3[gi3], x3, y3, z3);
      }
      return 32.0*(n0 + n1 + n2 + n3);
    },
    dot3: function(g, x, y, z) {
      return g[0]*x + g[1]*y + g[2]*z;
    }
  };

  function onWindowResize() {
    screenWidth = canvas.width = window.innerWidth;
    screenHeight = canvas.height = window.innerHeight;
    centerX = screenWidth / 2;
    centerY = screenHeight / 2;
    context = canvas.getContext('2d');
    context.lineWidth = 0.5;
    context.lineCap = context.lineJoin = 'round';
  }

  function getNoise(x, y, z) {
    var octaves = 4,
        fallout = 0.5,
        amp = 1, f = 1, sum = 0,
        i;
    for (i = 0; i < octaves; ++i) {
      amp *= fallout;
      sum += amp * (simplexNoise.noise3D(x * f, y * f, z * f) + 1) * 0.5;
      f *= 2;
    }
    return sum;
  }

  // Get theme color directly
  let cachedThemeHex = null;
  let cachedThemeHsl = null;

  function getThemeColor() {
    // Check for CSS custom property first
    return window.getThemeColor?.(window.selectedTheme || 'dream') || '#d39af6';
  }

  // Cache the current theme color so we don't recompute on every particle reset
  function updateThemeCache() {
    cachedThemeHex = getThemeColor();
    cachedThemeHsl = hexToHsl(cachedThemeHex);
  }

  // Convert hex to HSL
  function hexToHsl(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return [h * 360, s, l];
  }

  function initParticle(p) {
    p.x = p.pastX = screenWidth * Math.random();
    p.y = p.pastY = screenHeight * Math.random();

    // Use cached theme color values
    const [h, s, l] = cachedThemeHsl;
    
    // Add much more variation for visual interest
    const angle = Math.atan2(centerY - p.y, centerX - p.x);
    const distance = Math.sqrt((centerX - p.x) ** 2 + (centerY - p.y) ** 2) / Math.max(screenWidth, screenHeight);
    
    // Hue variation: ±30 degrees based on position + some randomness
    const hueVariation = (angle * 30 / Math.PI) + (Math.random() - 0.5) * 20;
    
    // Saturation variation: position-based + randomness
    const satVariation = distance * 0.3 + (Math.random() - 0.5) * 0.6;
    
    // Lightness variation: more dramatic changes
    const lightVariation = (Math.sin(angle * 2) * 0.4) + (Math.random() - 0.5) * 0.3;
    
    p.color.h = h + hueVariation;
    p.color.s = Math.max(0.3, Math.min(1.0, s + satVariation));
    p.color.l = Math.max(0.4, Math.min(0.9, l + lightVariation + 0.1));
    p.color.a = 0;
    p.lifetime = 0;
    p.maxLifetime = Configs.maxLifetime + Math.random() * 150;
  }

  function HSLA(h, s, l, a) {
    this.h = h || 0;
    this.s = s || 0;
    this.l = l || 0;
    this.a = a || 0;
  }

  HSLA.prototype.toString = function() {
    return 'hsla(' + this.h + ',' + (this.s * 100) + '%,' + (this.l * 100) + '%,' + this.a + ')';
  }

  function Particle(x, y, color) {
    this.x = x || 0;
    this.y = y || 0;
    this.color = color || new HSLA();
    this.pastX = this.x;
    this.pastY = this.y;
    this.lifetime = 0;
    this.maxLifetime = Configs.maxLifetime;
  }

  function update() {
    if (isPaused) {
      requestAnimationFrame(update);
      return;
    }
    // 🔄 Clear or softly fade canvas each frame
    const fade = true; // toggle to false for full wipe
    context.fillStyle = fade ? "rgba(15, 14, 46, 0.06)" : Configs.backgroundColor;
    context.fillRect(0, 0, screenWidth, screenHeight);
  
    const step = Configs.step;
    const base = Configs.base;
  
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
  
      // Save previous position
      p.pastX = p.x;
      p.pastY = p.y;
      p.lifetime++;
  
      // Move particle using noise-based angle
      const angle = Math.PI * 6 * getNoise(p.x / base * 1.75, p.y / base * 1.75, zoff);
      p.x += Math.cos(angle) * step;
      p.y += Math.sin(angle) * step;
  
      // Fade in/out based on lifetime
      const lifeRatio = p.lifetime / p.maxLifetime;
      if (lifeRatio < 0.1) {
        p.color.a = Math.min(p.color.a + 0.04, 1.0); // fade in
      } else if (lifeRatio > 0.7) {
        p.color.a = Math.max(p.color.a - Configs.fadeSpeed, 0); // fade out
      } else {
        p.color.a = Math.min(p.color.a + 0.02, 1.0); // sustain
      }
  
      // Draw if visible
      if (p.color.a > 0.01) {
        context.beginPath();
        context.strokeStyle = p.color.toString();
        context.moveTo(p.pastX, p.pastY);
        context.lineTo(p.x, p.y);
        context.stroke();
      }
  
      // Reset if out of bounds or faded
      const outOfBounds =
        p.x < -50 || p.x > screenWidth + 50 ||
        p.y < -50 || p.y > screenHeight + 50;
  
      if (p.color.a <= 0.01 || p.lifetime >= p.maxLifetime || outOfBounds) {
        initParticle(p);
      }
    }
  
    hueBase += 0.1;
    zoff += Configs.zInc;
    requestAnimationFrame(update);
  }
  

  // Initialize
  onWindowResize();
  window.addEventListener('resize', onWindowResize);

  updateThemeCache();
  for (var i = 0, len = Configs.particleNum; i < len; i++) {
    initParticle((particles[i] = new Particle()));
  }
  
  simplexNoise = new SimplexNoise();
  
  console.log("🌀 Starting ribbon animation with theme colors");

  // Track paused state to reduce work when memory screen is active
  let isPaused = false;

  // Screen transition handlers
  document.addEventListener("enter-memory", () => {
    canvas.style.display = "none";
    isPaused = true;
  });

  document.addEventListener("exit-memory", () => {
    canvas.style.display = "block";
    isPaused = false;
  });

  update();

  // About screen handlers - show generated background on about screen
  window.addEventListener("enter-about", () => {
    canvas.style.display = "block";
    canvas.style.zIndex = "-5"; // Behind about content but visible
  });
  
  window.addEventListener("exit-about", () => {
    canvas.style.display = "block";
    canvas.style.zIndex = "-5";
  });

  // Test function
  window.updateRibbonTheme = function() {
    updateThemeCache();
    for (let i = 0; i < particles.length; i++) {
      initParticle(particles[i]);
    }
  };

  console.log("🌀 Ribbon setup complete with theme colors");
});