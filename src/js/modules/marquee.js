/**
 * Бегущая строка: дублируем содержимое, чтобы петля шла без разрыва.
 * Для reduce-motion анимация отключается в CSS.
 */
export function initMarquee() {
  const track = document.querySelector('.marquee__track');
  if (!track || track.dataset.cloned === 'true') return;

  // Клонируем набор целиком — translateX(-50%) совпадает с точкой повтора
  const items = [...track.children];
  items.forEach((item) => {
    const clone = item.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });

  track.dataset.cloned = 'true';
}
