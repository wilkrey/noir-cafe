/**
 * Кастомный курсор для точных указателей (мышь/трекпад).
 * На тач-устройствах не инициализируется.
 */
export function initCursor() {
  const cursor = document.querySelector('.cursor');
  if (!cursor) return;

  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!finePointer || reduceMotion) {
    cursor.remove();
    return;
  }

  let x = 0;
  let y = 0;
  let currentX = 0;
  let currentY = 0;
  let running = false;

  const loop = () => {
    // Плавное следование за указателем
    currentX += (x - currentX) * 0.22;
    currentY += (y - currentY) * 0.22;
    cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;

    if (Math.abs(x - currentX) > 0.1 || Math.abs(y - currentY) > 0.1) {
      requestAnimationFrame(loop);
    } else {
      running = false;
    }
  };

  window.addEventListener(
    'pointermove',
    (event) => {
      x = event.clientX;
      y = event.clientY;
      cursor.classList.add('is-visible');
      if (!running) {
        running = true;
        requestAnimationFrame(loop);
      }
    },
    { passive: true }
  );

  document.addEventListener('pointerleave', () => cursor.classList.remove('is-visible'));

  const interactiveSelector = 'a, button, input, select, textarea, .gallery__figure, .menu__item, .review';
  document.addEventListener('pointerover', (event) => {
    cursor.classList.toggle('is-hover', Boolean(event.target.closest?.(interactiveSelector)));
  });
}
