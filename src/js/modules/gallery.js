/**
 * Горизонтальная галерея: прогресс-индикатор, кнопки prev/next,
 * клавиатурная навигация и лайтбокс по клику.
 */
export function initGallery() {
  const track = document.getElementById('gallery-track');
  if (!track) return;

  const figures = [...track.querySelectorAll('.gallery__figure')];
  const progress = document.getElementById('gallery-progress');
  const prevBtn = document.getElementById('gallery-prev');
  const nextBtn = document.getElementById('gallery-next');

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');

  let activeIndex = 0;
  let lastFocused = null;

  const maxScroll = () => track.scrollWidth - track.clientWidth;

  const updateProgress = () => {
    const max = maxScroll();
    const ratio = max > 0 ? track.scrollLeft / max : 0;
    if (progress) {
      progress.style.transform = `scaleX(${Math.max(0.12, ratio)})`;
      progress.style.transformOrigin = 'left';
    }
    prevBtn.disabled = track.scrollLeft <= 4;
    nextBtn.disabled = track.scrollLeft >= max - 4;
  };

  const scrollToIndex = (index) => {
    const clamped = Math.max(0, Math.min(index, figures.length - 1));
    activeIndex = clamped;
    figures[clamped].scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  };

  const step = (dir) => {
    const current = figures.findIndex((fig) => {
      const rect = fig.getBoundingClientRect();
      const trackRect = track.getBoundingClientRect();
      return rect.left >= trackRect.left - 2;
    });
    scrollToIndex((current === -1 ? activeIndex : current) + dir);
  };

  prevBtn?.addEventListener('click', () => step(-1));
  nextBtn?.addEventListener('click', () => step(1));

  track.addEventListener('scroll', () => requestAnimationFrame(updateProgress), { passive: true });
  window.addEventListener('resize', updateProgress, { passive: true });
  updateProgress();

  // Клавиатура: стрелки внутри галереи
  track.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      step(1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      step(-1);
    }
  });

  // Лайтбокс
  if (!lightbox || !lightboxImg) return;

  const openLightbox = (figure) => {
    const img = figure.querySelector('img');
    lastFocused = figure;
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
  };

  const closeLightbox = () => {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lastFocused?.focus?.({ preventScroll: true });
  };

  figures.forEach((figure) => {
    figure.addEventListener('click', () => openLightbox(figure));
    figure.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openLightbox(figure);
      }
    });
  });

  lightboxClose?.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && lightbox.classList.contains('is-open')) {
      closeLightbox();
    }
  });
}
