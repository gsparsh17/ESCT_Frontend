import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
	const { token, logout } = useAuth()
	const [open, setOpen] = useState(false)
	return (
		<header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-teal-100">
			<div className="mx-auto max-w-6xl px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
				<Link to={token ? '/home' : '/'} className="flex items-center gap-2">
					<div className="h-8 w-8 rounded bg-teal-600" />
					<span className="font-semibold text-lg text-teal-900">ESCT</span>
				</Link>
				<nav className="hidden md:flex items-center gap-4">
					<Link className="text-sm hover:text-teal-700" to={token ? '/home' : '/'}>Home</Link>
					<Link className="text-sm hover:text-teal-700" to="/about">About Us</Link>
					<Link className="text-sm hover:text-teal-700" to="/privacy">Privacy</Link>
					<Link className="text-sm hover:text-teal-700" to="/terms">Terms</Link>
					{token ? (
						<>
							<Link className="text-sm hover:text-teal-700" to="/claims">Claims</Link>
							<Link className="text-sm hover:text-teal-700" to="/nominees">Nominees</Link>
							<button onClick={logout} className="rounded-md bg-teal-600 px-3 py-1.5 text-white text-sm hover:bg-teal-700">Logout</button>
						</>
					) : (
						<>
							<Link className="text-sm hover:text-teal-700" to="/register">Register</Link>
							<Link className="rounded-md bg-teal-600 px-3 py-1.5 text-white text-sm hover:bg-teal-700" to="/login">Login</Link>
						</>
					)}
				</nav>
				<button onClick={() => setOpen(!open)} className="md:hidden rounded-md border border-teal-200 px-2 py-1 text-sm text-teal-900">Menu</button>
			</div>
			{open && (
				<div className="md:hidden border-t border-teal-100 bg-white">
					<div className="mx-auto max-w-6xl px-3 sm:px-4 py-3 flex flex-col gap-2">
						<Link onClick={() => setOpen(false)} className="text-sm" to={token ? '/home' : '/'}>Home</Link>
						<Link onClick={() => setOpen(false)} className="text-sm" to="/about">About Us</Link>
						<Link onClick={() => setOpen(false)} className="text-sm" to="/privacy">Privacy</Link>
						<Link onClick={() => setOpen(false)} className="text-sm" to="/terms">Terms</Link>
						{token ? (
							<>
								<Link onClick={() => setOpen(false)} className="text-sm" to="/claims">Claims</Link>
								<Link onClick={() => setOpen(false)} className="text-sm" to="/nominees">Nominees</Link>
								<button onClick={() => { logout(); setOpen(false) }} className="mt-1 rounded-md bg-teal-600 px-3 py-1.5 text-white text-sm">Logout</button>
							</>
						) : (
							<>
								<Link onClick={() => setOpen(false)} className="text-sm" to="/register">Register</Link>
								<Link onClick={() => setOpen(false)} className="mt-1 rounded-md bg-teal-600 px-3 py-1.5 text-white text-sm" to="/login">Login</Link>
							</>
						)}
					</div>
				</div>
			)}
		</header>
	)
}
