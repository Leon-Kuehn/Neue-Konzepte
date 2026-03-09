import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { MqttProvider } from './mqtt/MqttProvider'
import { PlantStoreProvider } from './store/plantStore'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MqttProvider>
      <PlantStoreProvider>
        <App />
      </PlantStoreProvider>
    </MqttProvider>
  </StrictMode>,
)
