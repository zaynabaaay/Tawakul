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
   Each .scene is taller than the viewport; its .bg-sticky pins to
   the screen for the duration. We compute 0->1 progress through
   that scroll range and use it, on .depth scenes (1.1, 1.4), to add
   an extra scale + vertical drift on top of the ambient Ken Burns,
   so scrolling feels like moving into the scene.

   NOTE: an earlier version of this also faded bg-sticky's opacity
   in/out as a fake crossfade. That doesn't actually work with this
   sticky-stacking layout: by the time a scene finishes its pinned
   window, the next scene hasn't started entering the viewport yet
   (it's still below the fold), so fading the current one to 0 just
   produced a black gap instead of a dissolve. Removed — the normal
   scroll handoff between scenes (one sliding away as the next slides
   in beneath it) already reads as continuous without it.
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
      const total = rect.height - viewportH;

      const progress = total <= 0
        ? (rect.top <= 0 ? 1 : 0)
        : Math.min(1, Math.max(0, -rect.top / total));

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
