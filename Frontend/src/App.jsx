import { Outlet } from 'react-router-dom'
import Navbar from './components/Navbar'

function App() {
  return (
    <div className="min-h-screen bg-teal-50 text-teal-900">
      <Navbar />

      <main className="mx-auto max-w-6xl px-3 sm:px-4 py-4 sm:py-6 lg:py-10">
        <section className="rounded-xl border border-teal-100 bg-white p-3 sm:p-4 lg:p-6 shadow-sm">
          <Outlet />
        </section>
      </main>
    </div>
  )
}

export default App
