/**
 * Вкладки меню с полной поддержкой ARIA tablist:
 * стрелки влево/вправо, Home/End, roving tabindex.
 * Индикатор выбранной вкладки скользит между кнопками.
 */
export function initMenuTabs() {
  const tablist = document.querySelector('.menu__tabs[role="tablist"]');
  if (!tablist) return;

  const tabs = [...tablist.querySelectorAll('[role="tab"]')];
  const panels = tabs.map((tab) => document.getElementById(tab.getAttribute('aria-controls')));
  const indicator = tablist.querySelector('.menu__indicator');

  let current = Math.max(
    0,
    tabs.findIndex((tab) => tab.getAttribute('aria-selected') === 'true')
  );

  if (indicator) tablist.classList.add('has-indicator');

  const moveIndicator = () => {
    if (!indicator || !tabs[current]) return;
    const tab = tabs[current];
    indicator.style.width = `${tab.offsetWidth}px`;
    indicator.style.height = `${tab.offsetHeight}px`;
    indicator.style.transform = `translate(${tab.offsetLeft}px, ${tab.offsetTop}px)`;
    if (!indicator.classList.contains('is-ready')) {
      requestAnimationFrame(() => indicator.classList.add('is-ready'));
    }
  };

  const activate = (index, { focus = false } = {}) => {
    current = index;
    tabs.forEach((tab, i) => {
      const selected = i === index;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;

      const panel = panels[i];
      if (!panel) return;
      panel.hidden = !selected;
      panel.classList.toggle('is-active', selected);
    });

    moveIndicator();
    if (focus) tabs[index].focus();
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(index));

    tab.addEventListener('keydown', (event) => {
      const last = tabs.length - 1;
      let next = null;

      switch (event.key) {
        case 'ArrowRight':
          next = index === last ? 0 : index + 1;
          break;
        case 'ArrowLeft':
          next = index === 0 ? last : index - 1;
          break;
        case 'Home':
          next = 0;
          break;
        case 'End':
          next = last;
          break;
        default:
          return;
      }

      event.preventDefault();
      activate(next, { focus: true });
    });
  });

  // Автопрокрутка выбранной вкладки в видимую область на мобильных
  tablist.addEventListener('focusin', (event) => {
    event.target.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  });

  window.addEventListener('resize', moveIndicator, { passive: true });
  moveIndicator();
}
