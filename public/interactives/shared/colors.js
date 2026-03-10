// Design tokens for standalone interactive visualizations
// Mirrors presentaciones/engine/shared/design-tokens.js for interactives served outside the engine

export const COLORS = {
  bg:       '#0f172a',
  panel:    '#16213e',
  canvas:   '#0f0f23',
  accent:   '#e94560',
  text:     '#eee',
  textDim:  '#aaa',
  textMuted:'#888',
  grid:     '#222240',
  axis:     '#444',
  axisLabel:'#666',
  white:    '#fff',
};

// Semantic curve colors used across interactives
export const CURVE = {
  blue:   '#4a9eff',
  red:    '#ef4444',
  green:  '#64ff96',
  orange: '#ff9f43',
  purple: '#a855f7',
  teal:   '#22c55e',
  cyan:   '#06b6d4',
};

// Per-class palette (10 classes, e.g. Fashion MNIST)
export const CLASS_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e',
];

// Insight box semantic colors
export const INSIGHT = {
  safe:    { bg: 'rgba(34, 197, 94, 0.12)',  border: 'rgba(34, 197, 94, 0.3)',  title: '#22c55e' },
  warning: { bg: 'rgba(255, 159, 67, 0.12)', border: 'rgba(255, 159, 67, 0.3)', title: '#ff9f43' },
  danger:  { bg: 'rgba(233, 69, 96, 0.15)',  border: 'rgba(233, 69, 96, 0.3)',  title: '#e94560' },
};

/**
 * Convert a hex color to rgba string.
 * @param {string} hex - e.g. '#4a9eff'
 * @param {number} alpha - 0..1
 * @returns {string} rgba(...)
 */
export function rgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Linearly interpolate between two hex colors.
 * @param {number} t - 0..1
 * @param {string} hex1 - start color e.g. '#4a9eff'
 * @param {string} hex2 - end color
 * @returns {string} hex color
 */
export function lerpColor(t, hex1, hex2) {
  const r1 = parseInt(hex1.slice(1, 3), 16), g1 = parseInt(hex1.slice(3, 5), 16), b1 = parseInt(hex1.slice(5, 7), 16);
  const r2 = parseInt(hex2.slice(1, 3), 16), g2 = parseInt(hex2.slice(3, 5), 16), b2 = parseInt(hex2.slice(5, 7), 16);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
