import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'cyan' | 'blue' | 'black';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const CustomThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const CustomThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Recuperar tema guardado en localStorage
    const saved = localStorage.getItem('app-theme') as Theme;
    return saved || 'blue'; // tema por defecto
  });

  useEffect(() => {
    // Aplicar clase al elemento html
    const html = document.documentElement;
    // Remover clases de temas anteriores
    html.classList.remove('theme-blue', 'theme-red', 'theme-black');
    html.classList.add(`theme-${theme}`);
    // Guardar en localStorage
    localStorage.setItem('app-theme', theme);
    console.log("Tema cambió")
  }, [theme]);

  return (
    <CustomThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </CustomThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(CustomThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};