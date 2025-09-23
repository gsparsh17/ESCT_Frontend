import { useEffect, useMemo, useState } from 'react'
import api from '../lib/api/client'
import { fetchAllClaims } from '../lib/api/claims'
import ClaimCard from '../components/ClaimCard'
import { useSearchParams } from 'react-router-dom'

export default function CategoryList() {
  const [params] = useSearchParams()
  const category = params.get('category') || 'Medical'
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchAllClaims(api)
        setClaims(data)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const filtered = useMemo(() => {
    return claims.filter((c) => (c.type || c.category || '').toLowerCase().includes(category.toLowerCase()))
  }, [claims, category])

  return (
    <div>
      <h1 className="text-3xl font-semibold text-teal-900">{category} Claim</h1>
      <div className="mt-4 space-y-3">
        {loading ? (
          [...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-teal-100 animate-pulse" />)
        ) : (
          filtered.map((c) => <ClaimCard key={c._id || c.id} claim={c} />)
        )}
      </div>
    </div>
  )
}


