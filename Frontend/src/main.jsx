import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Claims from './pages/Claims.jsx'
import Profile from './pages/Profile.jsx'
import Home from './pages/Home.jsx'
import DonationDetails from './pages/DonationDetails.jsx'
import CategoryList from './pages/CategoryList.jsx'
import Landing from './pages/Landing.jsx'
import LegalPages from './pages/Static.jsx' // Correctly import the new component
import './index.css'
import App from './App.jsx'

const router = createBrowserRouter([
 {
 path: '/',
 element: <App />,
 children: [
 { index: true, element: <Landing /> },
 { path: 'legal/:tab', element: <LegalPages /> }, // Use a single route for all legal pages
 { path: 'home', element: <Home /> },
 { path: 'claims/:id', element: <DonationDetails /> },
 { path: 'categories', element: <CategoryList /> },
 { path: 'login', element: <Login /> },
 { path: 'register', element: <Register /> },
 {
 element: <ProtectedRoute />,
 children: [
  { path: 'claims', element: <Claims /> },
  { path: 'profile', element: <Profile /> },
 ],
 },
 ],
 },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
)