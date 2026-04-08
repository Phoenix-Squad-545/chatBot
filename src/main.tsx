import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import './index.css'
import App from './App'

/** MUI theme — Tailwind handles most layout; this aligns MUI components with a modern palette */
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#4f46e5' },
    background: { default: '#f8fafc', paper: '#ffffff' },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: ['system-ui', 'Segoe UI', 'Roboto', 'sans-serif'].join(','),
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)