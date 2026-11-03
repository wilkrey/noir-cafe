/**
 * Навигация: состояние при скролле, скрытие при движении вниз,
 * мобильное меню с управлением фокусом и закрытием по Esc.
 */
export function initNav() {
  const nav = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const menu = document.getElementById('mobile-menu');
  if (!nav) return;

  let lastY = window.scrollY;
  let ticking = false;

  const update = () => {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 40);

    const goingDown = y > lastY;
    const pastThreshold = y > 480;
    const menuOpen = menu?.classList.contains('is-open');
    nav.classList.toggle('is-hidden', goingDown && pastThreshold && !menuOpen);

    lastY = y;
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
  update();

  if (!burger || !menu) return;

  const focusableSelector = 'a[href], button:not([disabled])';
  let lastFocused = null;

  const setOpen = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    menu.classList.toggle('is-open', open);
    nav.classList.toggle('menu-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';

    if (open) {
      lastFocused = document.activeElement;
      menu.querySelector(focusableSelector)?.focus({ preventScroll: true });
    } else {
      lastFocused?.focus?.({ preventScroll: true });
    }
  };

  burger.addEventListener('click', () => {
    setOpen(burger.getAttribute('aria-expanded') !== 'true');
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.classList.contains('is-open')) {
      setOpen(false);
      return;
    }

    // Удерживаем фокус внутри открытого меню
    if (event.key === 'Tab' && menu.classList.contains('is-open')) {
      const items = [...menu.querySelectorAll(focusableSelector), burger];
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  // Закрываем меню при переходе на десктоп
  window.matchMedia('(min-width: 960px)').addEventListener('change', (e) => {
    if (e.matches) setOpen(false);
  });
}
