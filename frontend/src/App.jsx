// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Pages
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';

// Auth Pages
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ProfilePage from './pages/Auth/ProfilePage';
import ChangePasswordPage from './pages/Auth/ChangePasswordPage';

// Pets Pages
import PetsPage from './pages/Pets/PetsPage';
import PetList from './pages/Pets/PetList';
import PetDetail from './pages/Pets/PetDetail';
import PetForm from './pages/Pets/PetForm';

// Store Pages
import StorePage from './pages/Store/StorePage';
import ProductDetail from './pages/Store/ProductDetail';
import AdminProductsPage from './pages/Store/AdminProductsPage';
import ProductForm from './pages/Store/ProductForm';
import CategoriesList from './pages/Store/CategoriesList';

// Reservations Pages
import UserReservationsPage from './pages/Reservations/UserReservationsPage';
import ReservationForm from './pages/Reservations/ReservationForm';
import AdminReservationsPage from './pages/Reservations/AdminReservationsPage';
import ReservationAnalyticsPage from './pages/Reservations/ReservationAnalyticsPage';

// Admin Pages
import AdminDashboardPage from './pages/Admin/AdminDashboardPage';
import UsersManagementPage from './pages/Admin/UsersManagementPage';


function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/404" element={<NotFoundPage />} />

              {/* Protected Routes que SON UN LAYOUT con <Outlet /> internamente (ProfilePage, PetsPage) */}
              <Route path="/profile/*" element={
                <ProtectedRoute>
                  {/* ProfilePage DEBE tener un <Outlet /> para renderizar change-password y la vista general */}
                  <ProfilePage />
                </ProtectedRoute>

              }>
                <Route path="change-password" element={<ChangePasswordPage />} />
                <Route index element={<ProfilePage isOverview={true} />} /> {/* Ruta por defecto para /profile */}
              </Route>

              {/* Ruta de Mascotas: El PetsPage DEBE tener un <Outlet /> */}
              <Route path="/pets" element={
                <ProtectedRoute>
                  {/* PetsPage DEBE tener un <Outlet /> para renderizar PetList, PetForm, PetDetail */}
                  <PetsPage />
                </ProtectedRoute>
              }>
                <Route index element={<PetList />} />
                <Route path="list" element={<PetList />} />
                <Route path="add" element={<PetForm />} />
                <Route path="edit/:petId" element={<PetForm />} />
                <Route path=":petId" element={<PetDetail />} />
              </Route>

              {/* Rutas Public/Unauthenticated */}
              <Route path="/store" element={<StorePage />} />
              <Route path="/store/products/:productId" element={<ProductDetail />} />

              {/* Protected Routes que NO SON UN LAYOUT (son páginas finales) */}
              {/* Aquí usamos ProtectedRoute como un "guardián" directo para la página */}
              <Route path="/my-reservations" element={
                <ProtectedRoute>
                  <UserReservationsPage />
                </ProtectedRoute>
              } />
              <Route path="/reservations/add" element={
                <ProtectedRoute>
                  <ReservationForm />
                </ProtectedRoute>
              } />
              <Route path="/reservations/edit/:reservationId" element={
                <ProtectedRoute>
                  <ReservationForm />
                </ProtectedRoute>
              } />

              {/* Admin Routes (Aquí mantenemos la estructura de un AdminRoute padre) */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin/users" element={<UsersManagementPage />} />

                {/* Rutas de Productos (Admin) */}
                <Route path="/admin/products" element={<AdminProductsPage />} />
                <Route path="/admin/products/add" element={<ProductForm />} />
                <Route path="/admin/products/edit/:productId" element={<ProductForm />} />
                <Route path="/admin/categories" element={<CategoriesList isAdmin={true} />} />

                {/* Rutas de Reservas (Admin) */}
                <Route path="/admin/reservations" element={<AdminReservationsPage />} />
                <Route path="/admin/reservations/analytics" element={<ReservationAnalyticsPage />} />
                <Route path="/admin/reservations/edit/:reservationId" element={<ReservationForm />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;