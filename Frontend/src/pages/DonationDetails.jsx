import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../lib/api/client'
import { fetchClaimById } from '../lib/api/claims'
import DonationForm from '../components/DonationForm'

export default function DonationDetails() {
  const { id } = useParams()
  const [claim, setClaim] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showDonationForm, setShowDonationForm] = useState(false)

  useEffect(() => {
    (async () => {
      const c = await fetchClaimById(id, api)
      setClaim(c)
      setLoading(false)
    })()
  }, [id])

  if (loading) return <div>Loading...</div>
  if (!claim) return <div>Not found</div>

  const image = claim.imageUrl || `https://i.pravatar.cc/300?u=${id}`
  const title = claim.title || claim.category || 'Claim'
  const raised = claim.amountRaised || 0
  const goal = claim.amountRequested || 0
  const percent = goal > 0 ? Math.round((raised / goal) * 100) : 0
  const beneficiaryName = claim?.beneficiary?.personalDetails?.fullName || 'Beneficiary'
  const raisedBy = claim?.raisedBy?.personalDetails?.fullName || 'User'

  return (
    <div>
      <div className="flex items-center gap-3 sm:gap-4">
        <img src={image} alt="" className="h-20 w-20 sm:h-28 sm:w-28 rounded-xl sm:rounded-2xl object-cover border border-teal-200" />
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-3xl font-semibold text-teal-900 truncate">{title}</h1>
          <p className="text-sm sm:text-base text-teal-700">Raised by {raisedBy}</p>
        </div>
      </div>

      <div className="mt-4 sm:mt-6 rounded-xl sm:rounded-2xl bg-white border border-teal-100 p-3 sm:p-4">
        <div className="flex justify-between text-sm sm:text-base text-teal-900 font-medium">
          <span>Raised: ₹{raised}</span>
          <span>Goal: ₹{goal}</span>
        </div>
        <div className="mt-2 sm:mt-3 h-2 sm:h-3 w-full rounded-full bg-teal-100">
          <div className="h-2 sm:h-3 rounded-full bg-teal-500" style={{ width: `${percent}%` }} />
        </div>
        <div className="mt-1 sm:mt-2 text-right text-xs sm:text-sm text-teal-700">{percent}% funded</div>
      </div>

      <div className="mt-4 sm:mt-6">
        <h2 className="text-xs sm:text-sm font-semibold tracking-wider text-teal-700">ABOUT THIS CLAIM</h2>
        <div className="mt-2 inline-block rounded-lg sm:rounded-xl bg-teal-50 px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base text-teal-900">
          {claim.description || '—'}
        </div>
      </div>

      <div className="mt-4 sm:mt-6">
        <h2 className="text-xs sm:text-sm font-semibold tracking-wider text-teal-700">BENEFICIARY DETAILS</h2>
        <div className="mt-2 flex items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl bg-white border border-teal-100 p-3 sm:p-4">
          <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-teal-100" />
          <div>
            <p className="text-xs sm:text-sm text-teal-700">Beneficiary</p>
            <p className="text-sm sm:text-base font-medium text-teal-900">{beneficiaryName}</p>
          </div>
        </div>
      </div>

      <div className="sticky bottom-2 sm:bottom-4 mt-6 sm:mt-8 flex justify-center">
        <button 
          onClick={() => setShowDonationForm(true)}
          className="rounded-full bg-teal-600 px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base text-white shadow-lg hover:bg-teal-700"
        >
          Donate Now
        </button>
      </div>

      {showDonationForm && (
        <DonationForm 
          claim={claim} 
          onClose={() => setShowDonationForm(false)} 
        />
      )}
    </div>
  )
}


