/**
 * Счёт чисел один раз при появлении: элементы с data-count.
 * Конечное значение уже стоит в тексте разметки, поэтому без JS
 * или при prefers-reduced-motion ничего не меняется.
 */
export function initCountUp() {
  const els = [...document.querySelectorAll('[data-count]')];
  if (!els.length || !('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const run = (el) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    if (!Number.isFinite(target)) return;

    const duration = 1200;
    const start = performance.now();
    el.textContent = `0${suffix}`;

    const frame = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = `${Math.round(target * eased)}${suffix}`;
      if (t < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        run(entry.target);
      }
    },
    { threshold: 0.6 }
  );
  els.forEach((el) => observer.observe(el));
}
