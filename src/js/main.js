/**
 * NOIR Café — точка входа.
 * Стили подключены в index.html через <link>, поэтому здесь только JavaScript.
 * Каждый модуль инициализируется отдельно: сбой одного не ломает весь сайт.
 */
import { initNav } from './modules/nav.js';
import { initReveal } from './modules/reveal.js';
import { initMenuTabs } from './modules/menu-tabs.js';
import { initGallery } from './modules/gallery.js';
import { initReservationForm } from './modules/reservation-form.js';
import { initParallax } from './modules/parallax.js';
import { initCountUp } from './modules/count-up.js';

const modules = [
  ['nav', initNav],
  ['reveal', initReveal],
  ['parallax', initParallax],
  ['count-up', initCountUp],
  ['menu-tabs', initMenuTabs],
  ['gallery', initGallery],
  ['reservation-form', initReservationForm],
];

function boot() {
  for (const [name, init] of modules) {
    try {
      init();
    } catch (error) {
      // Сбой одного модуля не должен ломать весь сайт.
      console.error(`[NOIR] Модуль «${name}» не инициализирован:`, error);
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
