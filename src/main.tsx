import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AudioProvider } from './contexts/AudioContext'
import { PartyModeProvider } from './contexts/PartyModeContext'

createRoot(document.getElementById("root")!).render(
  <AudioProvider>
    <PartyModeProvider>
      <App />
    </PartyModeProvider>
  </AudioProvider>
);
