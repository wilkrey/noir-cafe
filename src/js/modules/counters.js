/**
 * Анимированные счётчики в блоке «цифры».
 * Значения берутся из data-count, суффикс — из data-suffix.
 */
export function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const animate = (el) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix ?? '';

    if (reduceMotion) {
      el.textContent = `${target}${suffix}`;
      return;
    }

    const duration = 1600;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      el.textContent = `${Math.round(target * eased)}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.6 }
  );

  counters.forEach((el) => {
    el.textContent = `0${el.dataset.suffix ?? ''}`;
    observer.observe(el);
  });
}
