export const theme = {
  colors: {
    text: 'var(--color-primary)',
    white: 'var(--color-white)',
    accent: 'var(--color-accent)',
    heroBg: 'var(--color-hero-bg)',
    surface: 'var(--color-hero-bg)',
  },
  space: {
    sm: 'var(--space-1)',
    md: 'var(--space-2)',
    lg: 'var(--space-4)',
  },
  radii: {
    sm: 'var(--radius-sm)',
    md: 'var(--radius-md)',
    lg: 'var(--radius-lg)',
  },
};

export type Theme = typeof theme;