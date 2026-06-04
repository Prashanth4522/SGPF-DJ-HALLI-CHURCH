/* ═══════════════════════════════════════════════════════════════
   CHURCH HISTORY TIMELINE — Curtains.js WebGL Splash Reveal
   ═══════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  // ── Configuration ──────────────────────────────────────────────
  const REVEAL_START = 0.05;      // Start revealing early for a lazy bloom
  const REVEAL_END = 1.18;        // Finish after a longer scroll for a slower reveal

  // ── DOM References ─────────────────────────────────────────────
  const panels = document.querySelectorAll('.history-panel');
  const spineFill = document.querySelector('.timeline-spine-fill');
  const timelineSection = document.querySelector('.history-timeline');

  // Get Curtains and Plane constructors from the global curtains object
  const Curtains = window.Curtains || (window.curtains && window.curtains.Curtains);
  const Plane = window.Plane || (window.curtains && window.curtains.Plane);

  if (!panels.length) return;

  const webGLSplashAvailable = Boolean(Curtains && Plane);
  let curtainsInstance = null;

  if (!webGLSplashAvailable) {
    console.warn("Curtains.js library not found. Using CSS splash fallback.");
  }

  // ── Curtains.js Initialisation ─────────────────────────────────
  if (webGLSplashAvailable) {
  try {
  curtainsInstance = new Curtains({
    container: "canvas",
    pixelRatio: Math.min(1.5, window.devicePixelRatio), // Cap pixel ratio for WebGL performance
    production: true // Supress warnings/logs in console
  });

  curtainsInstance.onError(() => {
    // Fallback: If WebGL fails, restore opacity of original images
    document.querySelectorAll('.history-illust-clip img').forEach(img => {
      img.style.opacity = '1';
    });
  });
  } catch (error) {
    curtainsInstance = null;
    console.warn("WebGL splash failed. Using CSS splash fallback.", error);
  }
  }

  // ── Custom Shaders ─────────────────────────────────────────────
  const vsSource = `
    #ifdef GL_ES
    precision mediump float;
    #endif

    // Attributes
    attribute vec3 aVertexPosition;
    attribute vec2 aTextureCoord;

    // Custom Matrices
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    // Varyings
    varying vec2 vTextureCoord;

    void main() {
      vTextureCoord = aTextureCoord;
      gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
    }
  `;

  const fsSource = `
    #ifdef GL_ES
    precision mediump float;
    #endif

    // Varyings
    varying vec2 vTextureCoord;

    // Uniforms
    uniform sampler2D uSampler0;
    uniform float uTransition; // Progress [0.0 - 1.0]
    uniform float uTime;

    // ── Simplex Noise implementation (Ian McEwan, Ashima Arts / stegu) ──
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187,
                          0.366025403784439,
                         -0.577350269189626,
                          0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
      + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    float blobField(vec2 uv, vec2 center, float radius) {
      vec2 delta = uv - center;
      return (radius * radius) / (dot(delta, delta) + 0.0012);
    }

    float delayedProgress(float progress, float delay) {
      float delayed = clamp((progress - delay) / (1.0 - delay), 0.0, 1.0);
      return smoothstep(0.0, 1.0, delayed);
    }

    void main() {
      vec2 uv = vTextureCoord;
      float burst = sin(uTransition * 3.14159265);
      float ripple = snoise(vec2(uTime * 0.9, uv.y * 2.0)) * 0.018 * burst;
      vec2 splashUv = uv + vec2(
        snoise(uv * 9.0 + vec2(uTime * 0.8)),
        snoise(uv * 8.0 - vec2(uTime * 0.7))
      ) * 0.022 * burst;
      vec4 color = texture2D(uSampler0, splashUv);
      
      float p0 = delayedProgress(uTransition, 0.00);
      float p1 = delayedProgress(uTransition, 0.16);
      float p2 = delayedProgress(uTransition, 0.28);
      float p3 = delayedProgress(uTransition, 0.44);
      float p4 = delayedProgress(uTransition, 0.58);

      vec2 drift = vec2(
        snoise(vec2(uTime * 0.7, 1.4)),
        snoise(vec2(2.1, uTime * 0.65))
      ) * 0.018 * burst;

      float field = 0.0;
      field += blobField(uv, vec2(0.50, 0.50) + drift, mix(0.015, 0.54, p0));
      field += blobField(uv, vec2(0.28, 0.34) - drift * 0.7, mix(0.0, 0.34, p1));
      field += blobField(uv, vec2(0.72, 0.32) + drift * 0.8, mix(0.0, 0.33, p1));
      field += blobField(uv, vec2(0.34, 0.72) + drift * 0.5, mix(0.0, 0.30, p2));
      field += blobField(uv, vec2(0.76, 0.74) - drift * 0.4, mix(0.0, 0.29, p2));
      field += blobField(uv, vec2(0.15, 0.58 + ripple), mix(0.0, 0.15, p3));
      field += blobField(uv, vec2(0.88, 0.47 - ripple), mix(0.0, 0.14, p3));
      field += blobField(uv, vec2(0.56, 0.12), mix(0.0, 0.12, p4));
      field += blobField(uv, vec2(0.46, 0.90), mix(0.0, 0.10, p4));

      float edgeNoise = snoise(uv * 18.0 + vec2(uTime * 1.15)) * 0.22 * (1.0 - uTransition * 0.45);
      float fineSpray = snoise(uv * 42.0 - vec2(uTime * 1.6)) * 0.08 * burst;
      float surface = field + edgeNoise + fineSpray;
      float visibility = smoothstep(0.90, 1.08, surface);
      visibility = max(visibility, smoothstep(0.92, 1.0, uTransition));
      float border = 1.0 - smoothstep(0.0, 0.22, abs(surface - 1.0));
                     
      vec4 finalColor = color;
      finalColor.a = visibility;
      
      // Bright leading edge plus a tiny dark inner rim gives a video-like liquid splash.
      finalColor.rgb = mix(finalColor.rgb, vec3(1.0), border * 0.22 * burst);
      finalColor.rgb = mix(finalColor.rgb, finalColor.rgb * 0.72, border * 0.24);
      
      gl_FragColor = finalColor;
    }
  `;

  // ── Plane Initialisation ───────────────────────────────────────
  const planeParams = {
    vertexShader: vsSource,
    fragmentShader: fsSource,
    widthSegments: 10,
    heightSegments: 10,
    uniforms: {
      transition: {
        name: "uTransition",
        type: "1f",
        value: 0.0
      },
      time: {
        name: "uTime",
        type: "1f",
        value: 0.0
      }
    }
  };

  const planes = [];

  if (webGLSplashAvailable && curtainsInstance) {
  panels.forEach(panel => {
    const illustSide = panel.querySelector('.history-illust-side');
    if (!illustSide) return;

    // Create a WebGL plane mapping the HTML illustration block
    const plane = new Plane(curtainsInstance, illustSide, planeParams);

    plane.onRender(() => {
      if (plane.uniforms && plane.uniforms.time) {
        plane.uniforms.time.value = performance.now() * 0.001;
      }
    });

    plane.onReady(() => {
      planes.push({
        plane: plane,
        panel: panel
      });
      // Initial state
      updatePlaneProgress(plane, panel);
    });
  });
  }

  // ── Scroll Listener & Progress Calculation ─────────────────────
  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updatePanels);
  }

  function updatePlaneProgress(plane, panel) {
    const rect = panel.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // Calculate visibility ratio
    const visibilityRatio = 1 - (rect.top / viewportHeight);
    
    // Progress range mapping
    const revealRange = REVEAL_END - REVEAL_START;
    const revealProgress = Math.max(0, Math.min(1, (visibilityRatio - REVEAL_START) / revealRange));

    // Slower ease-in-out so the splash blooms instead of snapping open.
    const easedProgress = revealProgress * revealProgress * (3 - 2 * revealProgress);

    const illustClip = panel.querySelector('.history-illust-clip');
    if (illustClip) {
      const pulse = Math.sin(easedProgress * Math.PI);
      const lobe = (scale, delay = 0) => {
        const delayed = Math.max(0, Math.min(1, (easedProgress - delay) / (1 - delay)));
        const softened = delayed * delayed * (3 - 2 * delayed);
        return `${Math.round(softened * scale)}%`;
      };

      illustClip.style.setProperty('--splash-main', lobe(96));
      illustClip.style.setProperty('--splash-lobe-a', lobe(48, 0.16));
      illustClip.style.setProperty('--splash-lobe-b', lobe(46, 0.18));
      illustClip.style.setProperty('--splash-lobe-c', lobe(42, 0.3));
      illustClip.style.setProperty('--splash-lobe-d', lobe(40, 0.34));
      illustClip.style.setProperty('--splash-drop-a', lobe(18, 0.52));
      illustClip.style.setProperty('--splash-drop-b', lobe(16, 0.58));
      illustClip.style.setProperty('--splash-drop-c', lobe(14, 0.66));
      illustClip.style.setProperty('--splash-edge-opacity', Math.max(0, pulse * 0.46).toFixed(3));
      illustClip.style.setProperty('--splash-edge-scale', (0.82 + easedProgress * 0.28).toFixed(3));
    }

    if (plane && plane.uniforms && plane.uniforms.transition) {
      plane.uniforms.transition.value = easedProgress;
    }
  }

  function updatePanels() {
    ticking = false;
    const viewportHeight = window.innerHeight;
    const scrollY = window.scrollY || window.pageYOffset;

    // Update spine fill
    if (spineFill && timelineSection) {
      const sectionRect = timelineSection.getBoundingClientRect();
      const sectionTop = sectionRect.top + scrollY;
      const sectionHeight = sectionRect.height;
      const scrollProgress = (scrollY + viewportHeight - sectionTop) / (sectionHeight + viewportHeight);
      const clampedProgress = Math.max(0, Math.min(1, scrollProgress));
      spineFill.style.height = `${clampedProgress * 100}%`;
    }

    // Update fallback image splash values
    panels.forEach(panel => {
      updatePlaneProgress(null, panel);
    });

    // Update WebGL uniform values
    planes.forEach(item => {
      updatePlaneProgress(item.plane, item.panel);
    });
  }

  // ── Bind Events ────────────────────────────────────────────────
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  // Handle intersection observer to toggle visibility styles
  const panelObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, {
    threshold: REVEAL_START,
    rootMargin: '0px 0px -80px 0px'
  });

  panels.forEach(panel => panelObserver.observe(panel));

  // Initial update
  requestAnimationFrame(updatePanels);
  setTimeout(() => requestAnimationFrame(updatePanels), 400);
})();
