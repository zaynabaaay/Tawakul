/* ============================================================
   Jannah — Part One: scroll reveals, crossfade, faked depth
   ============================================================ */

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Text reveal (IntersectionObserver, staggered) ---------- */

function initReveals() {
  if (reducedMotion) {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = Number(entry.target.dataset.staggerIndex || 0) * 140;
          setTimeout(() => entry.target.classList.add('in'), delay);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4, rootMargin: '0px 0px -10% 0px' }
  );

  document.querySelectorAll('.scene').forEach((scene) => {
    scene.querySelectorAll('.reveal').forEach((el, i) => {
      el.dataset.staggerIndex = i;
      observer.observe(el);
    });
  });
}

/* ---------- Backdrop crossfade (scroll-driven) ----------
   Every .scene is exactly one viewport tall, and each .bg-sticky is a
   `position: fixed` full-bleed layer (not nested under its .scene's
   text anymore). script.js gives each layer a "home" scroll position
   — index * viewportH — and fades it in/out as a triangle function of
   distance from that home position, so the layer ahead is still
   dissolving out while the next one dissolves in. There's no pin, no
   hold, no hard cut: the backdrop reads as one continuous scene that
   morphs as you scroll, recomputed from scrollY on every tick (never
   frozen at a stale value).
------------------------------------------------------------------ */

function initScroll() {
  const layers = Array.from(document.querySelectorAll('.bg-sticky')).map((bg, index) => ({
    bg,
    index,
    isDepth: bg.closest('.scene').classList.contains('depth'),
  }));

  if (reducedMotion) return;

  function update() {
    const viewportH = window.innerHeight;
    const scrollY = window.scrollY;

    layers.forEach(({ bg, index, isDepth }) => {
      const home = index * viewportH;
      const local = scrollY - home;
      const opacity = Math.max(0, 1 - Math.abs(local) / viewportH);

      bg.style.opacity = opacity;

      if (isDepth) {
        const progress = Math.min(1, Math.max(0, (local + viewportH) / (2 * viewportH)));
        const depthScale = 1 + progress * 0.05;
        const depthShift = (progress - 0.5) * -4.4; // vh
        bg.style.transform = `scale(${depthScale}) translateY(${depthShift}vh)`;
      }
    });
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}

document.addEventListener('DOMContentLoaded', () => {
  initReveals();
  initScroll();
});
