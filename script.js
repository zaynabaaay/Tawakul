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

/* ---------- Faked depth (scroll-driven) ----------
   Scrolling is continuous — every .scene is exactly one viewport tall,
   so nothing pins or holds still; each scene flows past at normal
   scroll speed. For .depth scenes (1.1, 1.4) we still want an extra
   push on top of the ambient Ken Burns so scrolling feels like moving
   into the scene. Progress is 0 when the scene is just entering at
   the bottom edge, 1 once it has fully scrolled off the top — smooth
   across the whole transit, not tied to any pin/dwell window.
------------------------------------------------------------------ */

function initScroll() {
  const scenes = Array.from(document.querySelectorAll('.scene')).map((section) => ({
    section,
    bg: section.querySelector('.bg-sticky'),
    isDepth: section.classList.contains('depth'),
  }));

  if (reducedMotion) return;

  function update() {
    const viewportH = window.innerHeight;

    scenes.forEach(({ section, bg, isDepth }) => {
      if (!bg || !isDepth) return;
      const rect = section.getBoundingClientRect();
      const span = viewportH + rect.height;
      const progress = Math.min(1, Math.max(0, (viewportH - rect.top) / span));

      // Faked depth: extra push on top of the ambient Ken Burns.
      const depthScale = 1 + progress * 0.05;
      const depthShift = progress * -2.2; // vh
      bg.style.transform = `scale(${depthScale}) translateY(${depthShift}vh)`;
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
