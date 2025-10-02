// pages/Login.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaLock, FaSpinner } from 'react-icons/fa';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [ehrmsCode, setEhrmsCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const user = await login(ehrmsCode, password);
      
      // Handle navigation after successful login
      if (user.isAdmin) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/home', { replace: true });
      }
    } catch (e) {
      setError(e.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 sm:p-8 shadow-2xl border border-teal-100">
        <div className="text-center">
          <img src="/logo2.png" alt="ESCT" className="mx-auto drop-shadow-md" />
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-teal-800">
            Welcome Back!
          </h2>
          <p className="mt-1 text-sm text-teal-600">
            Sign in to access your dashboard.
          </p>
        </div>
        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          <div>
            <label htmlFor="ehrms-code" className="block text-sm font-medium text-gray-700">
              EHRMS Code
            </label>
            <div className="relative mt-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <FaUserCircle className="h-5 w-5 text-teal-400" />
              </div>
              <input 
                id="ehrms-code"
                type="text" 
                className="w-full rounded-lg border border-teal-300 bg-teal-50 py-2 pl-10 pr-3 text-sm text-gray-900 placeholder-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                placeholder="Your EHRMS Code"
                value={ehrmsCode} 
                onChange={(e) => setEhrmsCode(e.target.value)} 
                required 
              />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative mt-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <FaLock className="h-5 w-5 text-teal-400" />
              </div>
              <input 
                id="password"
                type="password" 
                className="w-full rounded-lg border border-teal-300 bg-teal-50 py-2 pl-10 pr-3 text-sm text-gray-900 placeholder-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors" 
                placeholder="Your Password"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
          </div>
          {error && <p className="text-red-600 text-xs text-center font-medium mt-3">{error}</p>}
          <button 
            type="submit"
            disabled={loading} 
            className="w-full flex items-center justify-center gap-2 rounded-full bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md disabled:opacity-60 disabled:cursor-not-allowed hover:bg-teal-700 transition-colors"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                <span>Logging In...</span>
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}