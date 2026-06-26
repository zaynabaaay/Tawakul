/* ============================================================
   Jannah — scroll reveals + the Scene 2.1 showpiece ascent
   ============================================================ */

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Simple fade/reveal for every .reveal element ---------- */

function initReveals() {
  if (reducedMotion) {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Stagger siblings within the same scene so beats feel sequenced.
          const delay = Number(entry.target.dataset.staggerIndex || 0) * 120;
          setTimeout(() => entry.target.classList.add('in'), delay);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.35, rootMargin: '0px 0px -8% 0px' }
  );

  document.querySelectorAll('.scene').forEach((scene) => {
    const items = scene.querySelectorAll('.reveal');
    items.forEach((el, i) => {
      el.dataset.staggerIndex = i % 6; // reset stagger per visual group, capped
      observer.observe(el);
    });
  });
}

/* ---------- Top progress bar ---------- */

function initProgress() {
  const fill = document.querySelector('.progress-fill');
  if (!fill) return;

  function update() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    fill.style.width = pct + '%';
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}

/* ---------- Showpiece: Scene 2.1, the hundred levels ----------
   The scene is tall (260vh) with sticky inner content. As the user
   scrolls through it, we read scroll progress through that section
   and drive: sky darkening (CSS already gradients top->bottom, so we
   translate the sky layer upward), level markers drifting past,
   the glow at the summit fading in, and the Arabic/English content
   appearing only once the "summit" is reached.
------------------------------------------------------------------ */

function initShowpiece() {
  const section = document.getElementById('s2-1');
  if (!section) return;

  const sky = section.querySelector('.sp-sky');
  const levels = section.querySelector('.sp-levels');
  const glow = section.querySelector('.sp-glow');

  if (reducedMotion) {
    section.classList.add('is-ascending', 'is-summit');
    return;
  }

  function update() {
    const rect = section.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    if (total <= 0) return;

    // progress: 0 at top of section, 1 once fully scrolled through
    const progress = Math.min(1, Math.max(0, -rect.top / total));

    // Ascending begins immediately; summit text appears in the final third.
    section.classList.toggle('is-ascending', progress > 0.04);
    section.classList.toggle('is-summit', progress > 0.72);

    // Parallax: levels drift upward faster than the sky, sky drifts slower.
    if (levels) levels.style.transform = `translateY(${(1 - progress) * 18}vh)`;
    if (sky) sky.style.transform = `translateY(${(1 - progress) * 6}vh)`;

    // Glow at the summit implying the Throne — never drawn explicitly.
    if (glow) {
      const glowOpacity = progress > 0.6 ? Math.min(1, (progress - 0.6) / 0.3) : 0;
      glow.style.opacity = glowOpacity;
    }
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}

document.addEventListener('DOMContentLoaded', () => {
  initReveals();
  initProgress();
  initShowpiece();
});
