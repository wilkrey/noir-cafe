/**
 * Лёгкий параллакс для элементов [data-parallax].
 * Только desktop с мышью и без prefers-reduced-motion.
 * Пересчитывается только для элементов в зоне видимости, через rAF.
 */
export function initParallax() {
  const targets = [...document.querySelectorAll('[data-parallax]')];
  if (!targets.length || !('IntersectionObserver' in window)) return;

  const enabled =
    window.matchMedia('(min-width: 900px) and (hover: hover) and (pointer: fine)').matches &&
    window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
  if (!enabled) return;

  const visible = new Set();
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) visible.add(entry.target);
      else visible.delete(entry.target);
    }
  });
  targets.forEach((el) => observer.observe(el));

  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = window.innerHeight;
    visible.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const offset = (rect.top + rect.height / 2 - vh / 2) / (vh / 2 + rect.height / 2);
      const clamped = Math.max(-1, Math.min(1, offset));
      el.style.setProperty('--py', `${(clamped * 14).toFixed(1)}px`);
    });
  };
  const request = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request, { passive: true });
  request();
}
