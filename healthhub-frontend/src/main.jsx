import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/animations.css'
import AuthPage from './components/authentication.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthPage />
  </StrictMode>,
)

