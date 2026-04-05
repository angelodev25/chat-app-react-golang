import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Toaster } from './components/ui/sonner.tsx'
import { ChatProvider } from './contexts/chat_context.tsx'
import { UserProvider } from './contexts/auth.context.tsx'
import {ThemeProvider } from '@mui/material/styles'
import theme from './utils/muiMaterialTheme.ts';
import { CssBaseline } from '@mui/material'

createRoot(document.getElementById('root')!).render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
      <UserProvider>
        <ChatProvider>
          <App />
          <Toaster richColors />
        </ChatProvider>
      </UserProvider>
  </ThemeProvider>
)
