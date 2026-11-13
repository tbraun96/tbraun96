// Progressive enhancement only: the page is complete without this file.
// 1. Project filters.  2. The animated background (metrale-brand's WebGL2 scene, vendored in bg/),
// started when the browser is idle after load so it never competes with first paint.

function filters() {
  const group = document.querySelector('.filters');
  if (!group) return;
  const cards = [...document.querySelectorAll('.project')];
  group.hidden = false;
  group.addEventListener('click', (event) => {
    const chip = event.target.closest('.chip');
    if (!chip) return;
    for (const c of group.querySelectorAll('.chip')) c.setAttribute('aria-pressed', String(c === chip));
    const match = chip.dataset.match;
    for (const card of cards) card.hidden = match !== '' && !card.dataset.category.includes(match);
  });
}

// The scene's palette is the four --bg-* tokens of the current theme. There is deliberately no
// fallback colour: a missing token is a stylesheet bug, and the background stays off.
const PALETTE = ['--bg-ink', '--bg-primary', '--bg-secondary', '--bg-tertiary'];
function palette() {
  const style = getComputedStyle(document.documentElement);
  const colours = PALETTE.map((name) => {
    const value = style.getPropertyValue(name).trim();
    if (!/^#[0-9a-f]{6}$/i.test(value)) throw new Error(`${name} must be a #rrggbb colour, got "${value}"`);
    return parseInt(value.slice(1), 16);
  });
  return { colours, dark: matchMedia('(prefers-color-scheme: dark)').matches };
}

const SOFTWARE = /swiftshader|llvmpipe|softpipe|lavapipe|software/i;
function softwareRenderer(canvas) {
  const gl = canvas.getContext('webgl2');
  const info = gl && gl.getExtension('WEBGL_debug_renderer_info');
  return Boolean(info) && SOFTWARE.test(String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)));
}

function background() {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const scheme = matchMedia('(prefers-color-scheme: dark)');
  let canvas = null, scene = null, raf = 0, epoch = 0, slow = 0, visible = true;

  const size = () => {
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; scene.resize(w, h); }
  };
  const paint = () => { const p = palette(); scene.set_palette(...p.colours, p.dark); };
  const still = () => { size(); scene.still(); };
  const pause = () => { if (raf) cancelAnimationFrame(raf); raf = 0; };
  const play = () => { if (scene && !raf && visible && !document.hidden && !reduced.matches) raf = requestAnimationFrame(tick); };
  function tick(now) {
    raf = 0;
    if (!scene || document.hidden || !visible) return;
    size();
    const began = performance.now();
    scene.frame((now - epoch) / 1000);
    // A device that cannot draw a frame in 12 ms for 6 frames running gets the still frame.
    slow = performance.now() - began > 12 ? slow + 1 : 0;
    if (slow >= 6) { still(); return; }
    raf = requestAnimationFrame(tick);
  }
  function stop() {
    pause();
    if (scene) { scene.free(); scene = null; }
    if (canvas) { canvas.remove(); canvas = null; }
  }

  async function start() {
    canvas = document.createElement('canvas');
    canvas.className = 'bg-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(canvas);
    try {
      if (softwareRenderer(canvas)) throw new Error('software renderer');
      const mod = await import('./bg/metrale_bg.js');
      await mod.default();
      scene = new mod.Background(canvas, (Math.random() * 2 ** 32) >>> 0);
      epoch = performance.now();
      size();
      paint();
      if (reduced.matches) still(); else play();
      canvas.classList.add('on');
    } catch (error) {
      stop();
      console.info(`background off: ${error instanceof Error ? error.message : String(error)}`);
      return;
    }
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) play(); else pause(); }).observe(canvas);
    document.addEventListener('visibilitychange', () => (document.hidden ? pause() : play()));
    reduced.addEventListener('change', () => { if (reduced.matches) { pause(); still(); } else play(); });
    scheme.addEventListener('change', () => { paint(); if (reduced.matches) still(); });
    addEventListener('resize', () => { if (reduced.matches) still(); });
  }

  const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 300));
  const go = () => idle(() => { start(); }, { timeout: 2500 });
  if (document.readyState === 'complete') go(); else addEventListener('load', go, { once: true });
}

filters();
background();
