import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Toaster } from './components/ui/sonner.tsx'
import { ChatProvider } from './contexts/chatContext.tsx'
import { UserProvider } from './contexts/authContext.tsx'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import { getMuiTheme } from './providers/muiTheme.ts';
import { CssBaseline } from '@mui/material'
import { UserPreferencesProvider } from './contexts/userPreferencesContext.tsx'
import { CustomThemeProvider, useTheme } from './contexts/themeContext.tsx'
import type { ReactNode } from 'react'

function AppMuiTheme({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const muiTheme = getMuiTheme(theme);
  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <CustomThemeProvider>
    <AppMuiTheme>
      <UserProvider>
        <UserPreferencesProvider>
          <ChatProvider>
            <App />
            <Toaster richColors />
          </ChatProvider>
        </UserPreferencesProvider>
      </UserProvider>
    </AppMuiTheme>
  </CustomThemeProvider>
)
