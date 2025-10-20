import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AdminRoute from './components/AdminRoute.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Claims from './pages/Claims.jsx'
import Profile from './pages/Profile.jsx'
import Home from './pages/Home.jsx'
import DonationDetails from './pages/DonationDetails.jsx'
import CategoryList from './pages/CategoryList.jsx'
import Landing from './pages/Landing.jsx'
import LegalPages from './pages/Static.jsx'
import './index.css'
import App from './App.jsx'
import MyDonationQueue from './pages/MyDonationQueue.jsx'
import MyDonations from './pages/MyDonations.jsx'

// Admin Pages
import AdminLayout from './components/AdminLayout.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminUsers from './pages/admin/AdminUsers.jsx'
import AdminClaims from './pages/admin/AdminClaims.jsx'
import AdminReceipts from './pages/admin/AdminReceipts.jsx'
import AdminSubscriptions from './pages/admin/AdminSubscriptions.jsx'
import AdminDonationCaps from './pages/admin/AdminDonationCaps.jsx'
import AdminConfig from './pages/admin/AdminConfig.jsx'
import AdminLogs from './pages/admin/AdminLogs.jsx'
import AdminGallery from './pages/admin/AdminGallery.jsx' // NEW
import AdminNews from './pages/admin/AdminNews.jsx' // NEW
import AdminDonations from './pages/admin/AdminDonations.jsx' // NEW
import ResetPassword from './components/ResetPassword.jsx'
import AdminTestimonials from './pages/admin/AdminTestimonials.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Landing /> },
      { path: 'legal/:tab', element: <LegalPages /> },
      { path: 'home', element: <Home /> },
      { path: 'claims/:id', element: <DonationDetails /> },
      { path: 'claims-list', element: <CategoryList /> },
      { path: 'login', element: <Login /> },
      { path: 'reset-password', element: <ResetPassword/>},
      { path: 'register', element: <Register /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'claims', element: <Claims /> },
          { path: 'profile', element: <Profile /> },
          { path: 'donation-queue', element: <MyDonationQueue/> },
          { path: 'my-donations', element: <MyDonations /> }
        ],
      },
      // Admin Routes
      {
        path: 'admin',
        element: (
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        ),
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: 'users', element: <AdminUsers /> },
          { path: 'claims', element: <AdminClaims /> },
          { path: 'donations', element: <AdminDonations /> }, // NEW
          { path: 'receipts', element: <AdminReceipts /> },
          { path: 'subscriptions', element: <AdminSubscriptions /> },
          { path: 'donation-caps', element: <AdminDonationCaps /> },
          { path: 'gallery', element: <AdminGallery /> }, // NEW
          { path: 'testimonials', element: <AdminTestimonials /> }, // NEW
          { path: 'news', element: <AdminNews /> }, // NEW
          { path: 'config', element: <AdminConfig /> },
          { path: 'logs', element: <AdminLogs /> },
        ],
      },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </Provider>
  </StrictMode>
)