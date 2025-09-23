import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Login() {
	const { login } = useAuth()
	const navigate = useNavigate()
	const [ehrmsCode, setEhrmsCode] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)

	async function onSubmit(e) {
		e.preventDefault()
		setError('')
		setLoading(true)
		try {
			await login(ehrmsCode, password)
			navigate('/')
		} catch (e) {
			setError(e.message || 'Login failed')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div>
			<h2 className="text-lg sm:text-xl font-semibold">Login</h2>
			<form onSubmit={onSubmit} className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
				<div>
					<label className="block text-sm text-teal-700">EHRMS Code</label>
					<input className="mt-1 w-full rounded-lg border border-teal-300 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500" value={ehrmsCode} onChange={(e) => setEhrmsCode(e.target.value)} required />
				</div>
				<div>
					<label className="block text-sm text-teal-700">Password</label>
					<input type="password" className="mt-1 w-full rounded-lg border border-teal-300 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500" value={password} onChange={(e) => setPassword(e.target.value)} required />
				</div>
				{error && <p className="text-red-600 text-sm">{error}</p>}
				<button disabled={loading} className="w-full rounded-lg bg-teal-600 px-4 py-2 text-sm text-white disabled:opacity-60 hover:bg-teal-700">{loading ? 'Logging in...' : 'Login'}</button>
			</form>
		</div>
	)
}
