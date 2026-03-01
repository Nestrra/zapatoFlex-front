import { Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import HomeOrRedirect from './pages/HomeOrRedirect'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import TermsPage from './pages/TermsPage'
import ShippingDataPage from './pages/ShippingDataPage'
import CheckoutPage from './pages/CheckoutPage'
import OrdersPage from './pages/OrdersPage'
import OrderDetailPage from './pages/OrderDetailPage'
import DashboardPage from './pages/DashboardPage'
import AdminOrdersPage from './pages/AdminOrdersPage'
import AdminOrderDetailPage from './pages/AdminOrderDetailPage'
import AdminCreateProductPage from './pages/AdminCreateProductPage'
import AdminEditProductPage from './pages/AdminEditProductPage'
import NotFoundPage from './pages/NotFoundPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomeOrRedirect />} />
        <Route path="/productos" element={<ProductsPage />} />
        <Route path="/productos/:id" element={<ProductDetailPage />} />
        <Route path="/carrito" element={<CartPage />} />
        <Route path="/iniciar-sesion" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/terminos" element={<TermsPage />} />
        <Route path="/datos-envio" element={<ShippingDataPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/pedidos" element={<OrdersPage />} />
        <Route path="/pedidos/:id" element={<OrderDetailPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/admin/pedidos" element={<AdminOrdersPage />} />
        <Route path="/admin/pedidos/:id" element={<AdminOrderDetailPage />} />
        <Route path="/admin/productos/nuevo" element={<AdminCreateProductPage />} />
        <Route path="/admin/productos/:id/editar" element={<AdminEditProductPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
