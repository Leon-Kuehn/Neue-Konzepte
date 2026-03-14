import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { ResponsiveMapPlayground } from './map/ResponsiveMapPlayground'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ResponsiveMapPlayground />
  </StrictMode>,
)
