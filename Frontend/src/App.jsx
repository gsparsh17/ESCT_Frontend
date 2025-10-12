import { Outlet } from 'react-router-dom'
import Navbar from './components/Navbar'
import { useTranslation } from './hooks/useTranslation'

function App() {
  const { t } = useTranslation()

  return (
    <div className="h-screen overflow-y-auto bg-teal-50 text-teal-900 custom-scrollbar">
      <Navbar />

      <main className="mx-auto">
        <section className="rounded-xl border border-teal-100 bg-white p-3 sm:p-4 lg:p-6 shadow-sm">
          <Outlet />
        </section>
      </main>
    </div>
  )
}

export default App