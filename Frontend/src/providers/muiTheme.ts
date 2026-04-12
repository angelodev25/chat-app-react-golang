// src/theme/mui-theme.ts
import { createTheme } from '@mui/material/styles';
import { themesConfig, type ThemeName } from './muiThemes.ts';

// Función que construye el tema de MUI a partir de la configuración
export const getMuiTheme = (themeName: ThemeName) => {
  const config = themesConfig[themeName];
  return createTheme(config.mui);
};