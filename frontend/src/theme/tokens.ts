export const lightColors = {
  primary:       '#d97706',
  primaryHover:  '#b45309',
  primaryActive: '#92400e',
  primaryBg:     '#fef3c7',
  primaryBorder: '#fbbf24',

  gray900: '#1c1917',
  gray800: '#292524',
  gray700: '#44403c',
  gray600: '#57534e',
  gray500: '#78716c',
  gray400: '#a8a29e',
  gray300: '#d6d3d1',
  gray200: '#e7e5e4',
  gray100: '#f5f5f4',
  gray50:  '#fafaf9',

  success:      '#4d7c0f',
  successBg:    '#ecfccb',
  successHover: '#365314',
  error:        '#b91c1c',
  errorBg:      '#fee2e2',
  errorHover:   '#7f1d1d',
  warning:      '#d97706',
  warningBg:    '#fef3c7',
} as const;

export const darkColors = {
  primary:       '#d97706',
  primaryHover:  '#f59e0b',
  primaryActive: '#b45309',
  primaryBg:     '#2b1d0e',
  primaryBorder: '#5c3d11',

  gray50:  '#1c1b19',
  gray100: '#252422',
  gray200: '#312e2b',
  gray300: '#3f3c38',
  gray400: '#635f5a',
  gray500: '#88837d',
  gray600: '#a5a19b',
  gray700: '#c6c2bc',
  gray800: '#e3dfda',
  gray900: '#f5f2ed',

  success:      '#65a30d',
  successBg:    '#1a2e05',
  successHover: '#84cc16',
  error:        '#f87171',
  errorBg:      '#3b1010',
  errorHover:   '#fca5a5',
  warning:      '#fbbf24',
  warningBg:    '#2b1d0e',
} as const;

export type ColorPalette = Record<keyof typeof lightColors, string>;
