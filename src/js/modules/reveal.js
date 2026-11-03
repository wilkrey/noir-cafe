/**
 * Появление элементов при прокрутке через IntersectionObserver.
 * Элементы с классами .reveal и .reveal-mask получают .is-visible.
 */
/**
 * Изображения показываем после загрузки (или ошибки), чтобы не было
 * пустого проявления. При ошибке картинка всё равно становится видимой.
 */
function showWhenLoaded(el) {
  const img = el.classList.contains('reveal--image') ? el.querySelector('img') : null;
  if (!img || img.complete) {
    el.classList.add('is-visible');
    return;
  }
  const done = () => el.classList.add('is-visible');
  img.addEventListener('load', done, { once: true });
  img.addEventListener('error', done, { once: true });
}

export function initReveal() {
  const targets = document.querySelectorAll('.reveal, .reveal-mask');
  if (!targets.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  // Скрытые состояния включаются только при работающем JS
  document.documentElement.classList.add('motion-ready');

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          showWhenLoaded(entry.target);
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
  );

  targets.forEach((el) => observer.observe(el));
}
