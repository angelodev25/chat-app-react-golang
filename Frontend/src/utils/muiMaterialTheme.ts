import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#556cd6',
    },
    secondary: {
      main: '#19857b',
    },
    error: {
      main: red.A400,
    },
    background: {
      default: 'transparent', 
      paper: '#1e1e1e', 
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
          backgroundAttachment: 'fixed', // Para que no se mueva al hacer scroll
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover', // Para que cubra toda la pantalla
          minHeight: '100vh',
          margin: 0,
          padding: 0,
        },
        html: {
          minHeight: '100vh',
        },
        '#root': {
          minHeight: '100vh',
        },
      },
    },
  },
});

export default theme;