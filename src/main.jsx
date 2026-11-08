import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { CatalogProvider } from './context/catalog.jsx'
import { StoreProvider } from './context/store.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CatalogProvider>
      <StoreProvider>
        <App />
      </StoreProvider>
    </CatalogProvider>
  </StrictMode>,
)
