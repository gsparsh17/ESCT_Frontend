import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Claims from './pages/Claims.jsx'
import Nominees from './pages/Nominees.jsx'
import Home from './pages/Home.jsx'
import DonationDetails from './pages/DonationDetails.jsx'
import CategoryList from './pages/CategoryList.jsx'
import Landing from './pages/Landing.jsx'
import { About, Privacy, Terms } from './pages/Static.jsx'
import './index.css'
import App from './App.jsx'


const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Landing /> },
      { path: 'about', element: <About /> },
      { path: 'privacy', element: <Privacy /> },
      { path: 'terms', element: <Terms /> },
      { path: 'home', element: <Home /> },
      { path: 'claims/:id', element: <DonationDetails /> },
      { path: 'categories', element: <CategoryList /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'claims', element: <Claims /> },
          { path: 'nominees', element: <Nominees /> },
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
  </StrictMode>,
)
