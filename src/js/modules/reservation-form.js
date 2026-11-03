/**
 * Форма бронирования: клиентская валидация, понятные сообщения об ошибках,
 * имитация отправки (демо — без реального бэкенда).
 */

const RULES = {
  name: {
    validate: (value) => value.trim().length >= 2,
    message: 'Укажите имя (минимум 2 символа)',
  },
  phone: {
    validate: (value) => /^\+?[0-9\s()-]{9,}$/.test(value.trim()),
    message: 'Введите корректный номер телефона',
  },
  date: {
    validate: (value) => {
      if (!value) return false;
      const picked = new Date(`${value}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return picked >= today;
    },
    message: 'Выберите сегодня или будущую дату',
  },
  time: {
    validate: (value) => Boolean(value),
    message: 'Выберите время',
  },
};

export function initReservationForm() {
  const form = document.getElementById('reserve-form');
  if (!form) return;

  const status = document.getElementById('form-status');
  const submitBtn = form.querySelector('button[type="submit"]');

  // Минимальная дата — сегодня
  const dateInput = form.querySelector('#date');
  if (dateInput) {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    dateInput.min = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  }

  const fieldFor = (name) => form.querySelector(`#field-${name}`);

  const setError = (name, message) => {
    const field = fieldFor(name);
    if (!field) return;
    field.classList.toggle('is-invalid', Boolean(message));
    const errorEl = field.querySelector('.field__error');
    if (errorEl) errorEl.textContent = message ?? '';
    const input = field.querySelector('input, select, textarea');
    if (input) input.setAttribute('aria-invalid', String(Boolean(message)));
  };

  const validateField = (name) => {
    const input = form.elements[name];
    if (!input || !RULES[name]) return true;
    const valid = RULES[name].validate(input.value);
    setError(name, valid ? '' : RULES[name].message);
    return valid;
  };

  // Валидация по уходу с поля — не раздражаем во время набора
  Object.keys(RULES).forEach((name) => {
    const input = form.elements[name];
    input?.addEventListener('blur', () => validateField(name));
    input?.addEventListener('input', () => {
      if (fieldFor(name)?.classList.contains('is-invalid')) validateField(name);
    });
  });

  // Маска телефона: оставляем цифры и +
  const phone = form.elements.phone;
  phone?.addEventListener('input', () => {
    phone.value = phone.value.replace(/[^\d+\s()-]/g, '');
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const results = Object.keys(RULES).map((name) => validateField(name));
    const firstInvalid = Object.keys(RULES).find((_, i) => !results[i]);

    if (results.includes(false)) {
      status.classList.add('is-error');
      status.textContent = 'Проверьте отмеченные поля.';
      form.elements[firstInvalid]?.focus();
      return;
    }

    status.classList.remove('is-error');
    submitBtn.disabled = true;
    submitBtn.dataset.label = submitBtn.textContent.trim();
    status.textContent = 'Отправляем запрос…';

    // Имитация сетевого запроса (демо)
    await new Promise((resolve) => setTimeout(resolve, 900));

    const name = form.elements.name.value.trim().split(' ')[0];
    status.textContent = `Спасибо, ${name}. Это демонстрационная форма: заявка не отправлена.`;
    form.reset();
    submitBtn.disabled = false;
  });
}
