import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'

const HomePage = lazy(() => import('./pages/HomePage'))
const CatalogPage = lazy(() => import('./pages/CatalogPage'))
const ProductPage = lazy(() => import('./pages/ProductPage'))
const CartPage = lazy(() => import('./pages/CartPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const SuccessPage = lazy(() => import('./pages/SuccessPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))

export default function App() {
  return <Suspense fallback={<div className="page-loader-v2"><span>Es.</span></div>}>
    <Routes>
      <Route path="/admin" element={<AdminPage />} />
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/success/:orderId" element={<SuccessPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  </Suspense>
}
