import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="text-center">
      <div className="mx-auto max-w-md py-16">
        <div className="mx-auto h-20 w-20 rounded-full bg-teal-600" />
        <h1 className="mt-6 text-3xl font-semibold text-teal-900">ESCT Foundation</h1>
        <p className="mt-2 text-teal-700">Compassion in action. Support those who served.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link className="rounded-md bg-teal-600 px-4 py-2 text-white" to="/login">Login</Link>
          <Link className="rounded-md border border-teal-300 px-4 py-2 text-teal-800" to="/register">Register</Link>
        </div>
      </div>
    </div>
  )
}


