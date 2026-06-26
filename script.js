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

/* ---------- Crossfade + faked depth (scroll-driven, rAF) ----------
   Each .scene is taller than the viewport; its .bg-sticky pins to
   the screen for the duration. We compute 0->1 progress through
   that scroll range and use it to:
   - fade the sticky bg in/out at the edges (soft dissolve between
     scenes, since the next scene's sticky bg is already pinning in
     as the current one releases)
   - on .depth scenes (1.1, 1.4), add an extra scale + vertical drift
     on top of the ambient Ken Burns, so scrolling feels like moving
     into the scene
------------------------------------------------------------------ */

function initScroll() {
  const scenes = Array.from(document.querySelectorAll('.scene')).map((section) => ({
    section,
    bg: section.querySelector('.bg-sticky'),
    isDepth: section.classList.contains('depth'),
  }));

  if (reducedMotion) {
    scenes.forEach(({ bg }) => { if (bg) bg.style.opacity = 1; });
    return;
  }

  const FADE_ZONE = 0.18; // fraction of scene transit spent fading at each edge

  function update() {
    const viewportH = window.innerHeight;

    scenes.forEach(({ section, bg, isDepth }, i) => {
      if (!bg) return;
      const rect = section.getBoundingClientRect();
      const total = rect.height - viewportH;

      let progress;
      if (total <= 0) {
        progress = rect.top <= 0 ? 1 : 0;
      } else {
        progress = Math.min(1, Math.max(0, -rect.top / total));
      }

      // Crossfade at the edges of the scene's transit. The first scene has
      // nothing beneath it to dissolve from, and the last has nothing to
      // dissolve into, so skip the fade at those outer edges.
      let fade = 1;
      if (progress < FADE_ZONE && i > 0) fade = progress / FADE_ZONE;
      else if (progress > 1 - FADE_ZONE && i < scenes.length - 1) fade = (1 - progress) / FADE_ZONE;
      bg.style.opacity = fade;

      // Faked depth: extra push on top of the ambient Ken Burns.
      if (isDepth) {
        const depthScale = 1 + progress * 0.05;
        const depthShift = progress * -2.2; // vh
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
