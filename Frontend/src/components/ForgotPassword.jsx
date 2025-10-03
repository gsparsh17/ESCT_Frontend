// components/ForgotPassword.jsx
import { useState } from 'react';
import { forgotPassword } from '../lib/api/auth';
import { FaEnvelope, FaSpinner, FaCheck, FaExclamationTriangle } from 'react-icons/fa';

export default function ForgotPassword({ onBackToLogin }) {
    const [ehrmsCode, setEhrmsCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const result = await forgotPassword(ehrmsCode);
            setMessage(result.message);
            setSuccess(true);
            
            // Clear form on success
            setEhrmsCode('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to process request. Please try again.');
            setSuccess(false);
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
                        Forgot Password
                    </h2>
                    <p className="mt-1 text-sm text-teal-600">
                        Enter your EHRMS code to reset your password
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                    <div>
                        <label htmlFor="ehrms-code" className="block text-sm font-medium text-gray-700">
                            EHRMS Code
                        </label>
                        <div className="relative mt-1">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <FaEnvelope className="h-5 w-5 text-teal-400" />
                            </div>
                            <input 
                                id="ehrms-code"
                                type="text" 
                                className="w-full rounded-lg border border-teal-300 bg-teal-50 py-2 pl-10 pr-3 text-sm text-gray-900 placeholder-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                                placeholder="Your EHRMS Code"
                                value={ehrmsCode} 
                                onChange={(e) => setEhrmsCode(e.target.value)} 
                                required 
                                disabled={loading}
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

                    {/* Info Message (non-error) */}
                    {!success && message && (
                        <div className="rounded-lg bg-blue-50 p-3 border border-blue-200">
                            <p className="text-sm text-blue-800">{message}</p>
                        </div>
                    )}

                    <button 
                        type="submit"
                        disabled={loading} 
                        className="w-full flex items-center justify-center gap-2 rounded-full bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md disabled:opacity-60 disabled:cursor-not-allowed hover:bg-teal-700 transition-colors"
                    >
                        {loading ? (
                            <>
                                <FaSpinner className="animate-spin" />
                                <span>Sending...</span>
                            </>
                        ) : (
                            'Send Reset Link'
                        )}
                    </button>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={onBackToLogin}
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