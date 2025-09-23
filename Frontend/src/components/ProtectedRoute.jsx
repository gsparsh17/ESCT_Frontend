import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute() {
	const { token, loading } = useAuth()
	if (loading) return <div className="p-6">Loading...</div>
	// if (!token) return <Navigate to="/login" replace />
	return <Outlet />
}
