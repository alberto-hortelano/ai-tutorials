// UI component helpers for standalone interactives

import { INSIGHT } from './colors.js';

/**
 * Create a slider control with label and value display.
 * @param {HTMLElement} container - parent element
 * @param {Object} opts
 * @param {string} opts.label - label template with '$v' as value placeholder
 * @param {number} opts.min
 * @param {number} opts.max
 * @param {number} opts.step
 * @param {number} opts.value - initial value
 * @param {Function} opts.onChange - (value: number) => void
 * @param {string} [opts.accentColor] - slider accent
 * @returns {{ slider: HTMLInputElement, setValue: (v: number) => void }}
 */
export function createSlider(container, { label, min, max, step, value, onChange, accentColor = '#e94560' }) {
  const control = document.createElement('div');
  control.className = 'control';

  const lbl = document.createElement('label');
  const valSpan = document.createElement('span');
  valSpan.className = 'value';
  valSpan.style.color = accentColor;
  valSpan.textContent = value.toFixed(2);

  const parts = label.split('$v');
  lbl.textContent = '';
  lbl.append(parts[0] || '');
  lbl.append(valSpan);
  if (parts[1]) lbl.append(parts[1]);

  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = min;
  slider.max = max;
  slider.step = step;
  slider.value = value;
  slider.style.accentColor = accentColor;

  slider.addEventListener('input', () => {
    const v = parseFloat(slider.value);
    valSpan.textContent = v.toFixed(2);
    onChange(v);
  });

  control.append(lbl, slider);
  container.appendChild(control);

  return {
    slider,
    setValue(v) {
      slider.value = v;
      valSpan.textContent = v.toFixed(2);
    },
  };
}

/**
 * Create an insight/highlight box that can switch between safe/warning/danger states.
 * @param {HTMLElement} container
 * @param {string} initialTitle
 * @param {string} initialText - can include HTML
 * @returns {{ update: (level: 'safe'|'warning'|'danger', title: string, html: string) => void }}
 */
export function createInsightBox(container, initialTitle = 'Observacion', initialText = '') {
  const box = document.createElement('div');
  box.className = 'highlight-box insight-safe';

  const h4 = document.createElement('h4');
  h4.textContent = initialTitle;

  const p = document.createElement('p');
  p.innerHTML = initialText;

  box.append(h4, p);
  container.appendChild(box);

  return {
    update(level, title, html) {
      const s = INSIGHT[level] || INSIGHT.safe;
      box.style.background = s.bg;
      box.style.border = `1px solid ${s.border}`;
      h4.style.color = s.title;
      h4.textContent = title;
      p.innerHTML = html;
    },
  };
}

/**
 * Create a metric card (read-only numeric display).
 * @param {HTMLElement} container
 * @param {Object} opts
 * @param {string} opts.name - metric label
 * @param {string} opts.color - value color
 * @param {string} [opts.value] - initial display value
 * @returns {{ setValue: (v: string) => void }}
 */
export function createMetricCard(container, { name, color, value = '0.000' }) {
  const card = document.createElement('div');
  card.className = 'metric-card';

  const nameEl = document.createElement('div');
  nameEl.className = 'metric-name';
  nameEl.textContent = name;

  const valEl = document.createElement('div');
  valEl.className = 'metric-value';
  valEl.style.color = color;
  valEl.textContent = value;

  card.append(nameEl, valEl);
  container.appendChild(card);

  return {
    setValue(v) { valEl.textContent = v; },
  };
}

/**
 * Create a pair of toggle buttons.
 * @param {HTMLElement} container
 * @param {Object} opts
 * @param {string[]} opts.labels - two labels
 * @param {number} [opts.initial] - 0 or 1, default 0
 * @param {Function} opts.onChange - (index: number) => void
 * @returns {{ setActive: (index: number) => void }}
 */
export function createToggleButtons(container, { labels, initial = 0, onChange }) {
  const row = document.createElement('div');
  row.className = 'controls-row';

  const btns = labels.map((lbl, i) => {
    const btn = document.createElement('button');
    btn.textContent = lbl;
    if (i === initial) btn.classList.add('active');
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      onChange(i);
    });
    return btn;
  });

  btns.forEach(b => row.appendChild(b));
  container.appendChild(row);

  return {
    setActive(index) {
      btns.forEach((b, i) => {
        b.classList.toggle('active', i === index);
      });
    },
  };
}
