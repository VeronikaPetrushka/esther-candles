import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ShopProvider } from './store/ShopProvider'
import { ProductProvider } from './store/ProductProvider'
import { WorkshopProvider } from './store/WorkshopProvider'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ProductProvider>
        <ShopProvider>
          <WorkshopProvider>
          <App />
        </WorkshopProvider>
        </ShopProvider>
      </ProductProvider>
    </BrowserRouter>
  </StrictMode>,
)
