// Design tokens — canonical palette from SKILL.md
export const colors = {
  bodyBg:      '#0f172a',
  panelBg:     '#1e293b',
  border:      '#334155',
  accent:      '#818cf8',
  insight:     '#34d399',
  code:        '#c4b5fd',
  textPrimary: '#f8fafc',
  textSecondary: '#e2e8f0',
  textMuted:   '#94a3b8',
  textDimmed:  '#64748b',
  axis:        '#475569',
  warning:     '#fbbf24',
  error:       '#f87171',
  info:        '#38bdf8',
} as const;

export const series = ['#818cf8', '#34d399', '#f87171', '#fbbf24', '#38bdf8'] as const;

export const fonts = {
  body: "'Segoe UI', system-ui, sans-serif",
  mono: "'Courier New', monospace",
} as const;
