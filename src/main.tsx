import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { MqttProvider } from './mqtt/MqttProvider'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MqttProvider>
      <App />
    </MqttProvider>
  </StrictMode>,
)
