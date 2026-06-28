import { createContext, useContext } from 'react';
import { lightColors } from '../theme/tokens';
import type { ColorPalette } from '../theme/tokens';

export type Theme = 'light' | 'dark';

export interface ThemeCtx {
  theme: Theme;
  toggleTheme: () => void;
  colors: ColorPalette;
}

export const ThemeContext = createContext<ThemeCtx>({
  theme: 'light',
  toggleTheme: () => {},
  colors: lightColors,
});

export const useColors = () => useContext(ThemeContext).colors;

export const useTheme = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  return { theme, toggleTheme };
};
