import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'

import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { ProductsPage } from './pages/ProductsPage'
import { CategoriesPage } from './pages/CategoriesPage'
import { UnitsPage } from './pages/UnitsPage'
import { SuppliersPage } from './pages/SuppliersPage'
import { CustomersPage } from './pages/CustomersPage'
import { StockPage } from './pages/StockPage'
import { PurchaseOrdersPage } from './pages/PurchaseOrdersPage'
import { SaleOrdersPage } from './pages/SaleOrdersPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,       // 30 seconds
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected — everything inside Layout */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/units" element={<UnitsPage />} />
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/stock" element={<StockPage />} />
            <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />
            <Route path="/sale-orders" element={<SaleOrdersPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>

      {/* Toast notifications — Twitter-dark styled */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#16181c',
            color: '#e7e9ea',
            border: '1px solid #2f3336',
            borderRadius: '12px',
            fontSize: '13px',
            fontFamily: 'Outfit, sans-serif',
          },
          success: {
            iconTheme: { primary: '#00ba7c', secondary: '#16181c' },
          },
          error: {
            iconTheme: { primary: '#f4212e', secondary: '#16181c' },
          },
        }}
      />

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
