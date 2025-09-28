// Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaBars, FaTimes } from 'react-icons/fa'; // Import icons from react-icons

export default function Navbar() {
  const { token, logout } = useAuth();
  const [open, setOpen] = useState(false);


	const navigate = useNavigate()
  const handleLinkClick = () => setOpen(false);

  const navLinks = (
    <>
      <Link className="text-sm font-medium text-teal-700 hover:text-teal-900 transition-colors" to={token ? '/home' : '/home'} onClick={handleLinkClick}>Home</Link>
      <Link className="text-sm font-medium text-teal-700 hover:text-teal-900 transition-colors" to="/legal/about" onClick={handleLinkClick}>About Us</Link>
      {/* <Link className="text-sm font-medium text-teal-700 hover:text-teal-900 transition-colors" to="/legal/privacy" onClick={handleLinkClick}>Privacy</Link>
      <Link className="text-sm font-medium text-teal-700 hover:text-teal-900 transition-colors" to="/legal/terms" onClick={handleLinkClick}>Terms</Link> */}
      {token ? (
        <>
          <Link className="text-sm font-medium text-teal-700 hover:text-teal-900 transition-colors" to="/claims" onClick={handleLinkClick}>Claims</Link>
          <Link className="text-sm font-medium text-teal-700 hover:text-teal-900 transition-colors" to="/profile" onClick={handleLinkClick}>Profile</Link>
          <Link className="text-sm font-medium text-teal-700 hover:text-teal-900 transition-colors" to="/donation-queue" onClick={handleLinkClick}>Donation Queue</Link>
          <button onClick={() => { logout(); handleLinkClick(); navigate('/') }} className="rounded-full bg-teal-600 px-4 py-2 text-white text-sm font-semibold shadow-md hover:bg-teal-700 transition-colors">Logout</button>
        </>
      ) : (
        <>
          <Link className="text-sm font-medium text-teal-700 hover:text-teal-900 transition-colors" to="/register" onClick={handleLinkClick}>Register</Link>
          <Link className="rounded-full bg-teal-600 px-4 py-2 text-white text-sm font-semibold shadow-md hover:bg-teal-700 transition-colors" to="/login" onClick={handleLinkClick}>Login</Link>
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-lg border-b border-teal-200 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between py-3">
        <Link to={token ? '/home' : '/'} className="flex items-center gap-3">
          <img src="/icon2.png" alt="ESCT" className="h-9 w-16" />
          <span className="font-extrabold text-xl text-teal-800 tracking-wider">ESCT</span>
          <span className="text-lg text-teal-800 tracking-wider">Total Users: 0</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks}
        </nav>

        {/* Mobile Menu Button */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-teal-800 text-xl focus:outline-none">
          {open ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden ${open ? 'block' : 'hidden'} transition-all duration-300 ease-in-out`}>
        <div className="flex flex-col gap-4 px-4 py-4 border-t border-teal-100 bg-white/95">
          {navLinks}
        </div>
      </div>
    </header>
  );
}