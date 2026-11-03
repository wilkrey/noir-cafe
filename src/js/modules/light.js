/**
 * Световой переход «от ночи к утру» и шкала суток.
 * Прогресс = доля прокрутки страницы (0 — ночь, 1 — утро).
 * Не привязан к реальному времени суток.
 */
export function initLight() {
  const root = document.documentElement;
  const dayline = document.getElementById('dayline');
  if (!dayline) return;

  const knob = document.getElementById('dayline-knob');
  const labels = [...dayline.querySelectorAll('[data-label]')];

  let ticking = false;
  let last = -1;

  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const raw = max > 0 ? window.scrollY / max : 0;
    const progress = Math.min(1, Math.max(0, raw));
    const rounded = Math.round(progress * 1000) / 1000;

    if (rounded !== last) {
      last = rounded;
      root.style.setProperty('--dusk', rounded.toFixed(3));
      dayline.setAttribute('aria-valuenow', String(Math.round(rounded * 100)));
      const isMorning = rounded >= 0.5;
      labels.forEach((el) => {
        const active = (el.dataset.label === 'morning') === isMorning;
        el.classList.toggle('is-active', active);
      });
    }
    ticking = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    },
    { passive: true }
  );
  window.addEventListener('resize', () => requestAnimationFrame(update), { passive: true });
  update();
  return knob;
}
