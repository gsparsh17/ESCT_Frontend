// components/ResetPassword.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../lib/api/auth';
import { FaLock, FaSpinner, FaCheck, FaExclamationTriangle, FaEye, FaEyeSlash } from 'react-icons/fa';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [token, setToken] = useState('');

    useEffect(() => {
        const tokenFromUrl = searchParams.get('token');
        if (!tokenFromUrl) {
            setError('Invalid or missing reset token.');
        }
        setToken(tokenFromUrl);
    }, [searchParams]);

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            setLoading(false);
            return;
        }

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters long.');
            setLoading(false);
            return;
        }

        try {
            const result = await resetPassword(token, newPassword);
            setMessage(result.message);
            setSuccess(true);
            
            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login', { replace: true });
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
            setSuccess(false);
        } finally {
            setLoading(false);
        }
    }

    if (!token) {
        return (
            <div className="flex min-h-[calc(100vh-80px)] items-center justify-center">
                <div className="w-full max-w-sm rounded-xl bg-white p-6 sm:p-8 shadow-2xl border border-red-100">
                    <div className="text-center">
                        <FaExclamationTriangle className="mx-auto h-12 w-12 text-red-500" />
                        <h2 className="mt-4 text-xl font-bold text-red-800">Invalid Reset Link</h2>
                        <p className="mt-2 text-red-600">This reset link is invalid or has expired.</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="mt-4 text-teal-600 hover:text-teal-800 font-medium"
                        >
                            Back to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-[calc(100vh-80px)] items-center justify-center">
            <div className="w-full max-w-sm rounded-xl bg-white p-6 sm:p-8 shadow-2xl border border-teal-100">
                <div className="text-center">
                    <img src="/logo2.png" alt="ESCT" className="mx-auto drop-shadow-md" />
                    <h2 className="mt-4 text-2xl font-bold tracking-tight text-teal-800">
                        Reset Password
                    </h2>
                    <p className="mt-1 text-sm text-teal-600">
                        Enter your new password
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div>
                        <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                            New Password
                        </label>
                        <div className="relative mt-1">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <FaLock className="h-5 w-5 text-teal-400" />
                            </div>
                            <input 
                                id="new-password"
                                type={showPassword ? "text" : "password"}
                                className="w-full rounded-lg border border-teal-300 bg-teal-50 py-2 pl-10 pr-10 text-sm text-gray-900 placeholder-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                                placeholder="Enter new password"
                                value={newPassword} 
                                onChange={(e) => setNewPassword(e.target.value)} 
                                required 
                                minLength="8"
                                disabled={loading || success}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 flex items-center pr-3"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <FaEyeSlash className="h-4 w-4 text-teal-400" />
                                ) : (
                                    <FaEye className="h-4 w-4 text-teal-400" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                            Confirm Password
                        </label>
                        <div className="relative mt-1">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <FaLock className="h-5 w-5 text-teal-400" />
                            </div>
                            <input 
                                id="confirm-password"
                                type={showPassword ? "text" : "password"}
                                className="w-full rounded-lg border border-teal-300 bg-teal-50 py-2 pl-10 pr-3 text-sm text-gray-900 placeholder-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                                placeholder="Confirm new password"
                                value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value)} 
                                required 
                                minLength="8"
                                disabled={loading || success}
                            />
                        </div>
                    </div>

                    {/* Success Message */}
                    {success && message && (
                        <div className="rounded-lg bg-green-50 p-3 border border-green-200">
                            <div className="flex items-center gap-2 text-green-800">
                                <FaCheck className="h-4 w-4" />
                                <p className="text-sm font-medium">{message}</p>
                            </div>
                            <p className="text-xs text-green-600 mt-1">
                                Redirecting to login page...
                            </p>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="rounded-lg bg-red-50 p-3 border border-red-200">
                            <div className="flex items-center gap-2 text-red-800">
                                <FaExclamationTriangle className="h-4 w-4" />
                                <p className="text-sm font-medium">{error}</p>
                            </div>
                        </div>
                    )}

                    <button 
                        type="submit"
                        disabled={loading || success} 
                        className="w-full flex items-center justify-center gap-2 rounded-full bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md disabled:opacity-60 disabled:cursor-not-allowed hover:bg-teal-700 transition-colors"
                    >
                        {loading ? (
                            <>
                                <FaSpinner className="animate-spin" />
                                <span>Resetting Password...</span>
                            </>
                        ) : (
                            'Reset Password'
                        )}
                    </button>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="text-sm text-teal-600 hover:text-teal-800 font-medium transition-colors"
                        >
                            ← Back to Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}