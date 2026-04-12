import type { ThemeOptions } from "@mui/material";

// src/theme/themes.ts
export const themesConfig = {
  cyan: {
    cssClass: 'theme-cyan',     // clase para Tailwind/Shadcn
    mui: {
      palette: {
        mode: 'dark',
        primary: { main: '#078ea0' },   // tu color cyan
        secondary: { main: '#006150' },
        background: { default: 'transparent', paper: '#1e1e1e' },
      },
    } as ThemeOptions,
  },
  black: {
    cssClass: 'theme-black',
    mui: {
      palette: {
        mode: 'dark',
        primary: { main: '#8f95a2' },   // gris
        secondary: { main: '#1f2144' },
        background: { default: '#000000', paper: '#0a0a0a' },
      },
    } as ThemeOptions,
  },
  blue: {
    cssClass: 'theme-blue',     // clase para Tailwind/Shadcn
    mui: {
      palette: {
        mode: 'dark',
        primary: { main: '#0760a0' },   // tu color cyan
        secondary: { main: '#066373' },
        background: { default: 'transparent', paper: '#1e1e1e' },
      },
    } as ThemeOptions,
  },
};

export type ThemeName = keyof typeof themesConfig;