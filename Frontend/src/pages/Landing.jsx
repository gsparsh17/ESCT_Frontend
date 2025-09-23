// Landing.jsx
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
      <div className="text-center px-4">
        <div className="mx-auto max-w-2xl py-12">
          <img src="/logo2.png" alt="ESCT Foundation" className="mx-auto drop-shadow-lg" />
          <h1 className="mt-8 text-4xl sm:text-5xl lg:text-5xl font-extrabold text-teal-900 leading-tight">
            Employee Self Care Team
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-teal-700 font-medium">
            Compassion in action. Support those who served.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              className="rounded-full bg-teal-600 px-8 py-3 text-white text-lg font-semibold shadow-lg hover:bg-teal-700 transition-all transform hover:scale-105" 
              to="/login"
            >
              Login
            </Link>
            <Link 
              className="rounded-full border-2 border-teal-300 px-8 py-3 text-teal-800 text-lg font-semibold shadow-sm hover:border-teal-400 hover:text-teal-900 transition-all transform hover:scale-105" 
              to="/register"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}