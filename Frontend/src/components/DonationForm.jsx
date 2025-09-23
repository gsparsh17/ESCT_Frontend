import { useState } from 'react'

export default function DonationForm({ claim, onClose }) {
  const [amount, setAmount] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setSubmitting(false)
    setSuccess(true)
    
    // Auto close after 2 seconds
    setTimeout(() => {
      onClose()
    }, 2000)
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-teal-900 mb-2">Donation Successful!</h3>
          <p className="text-teal-700">Thank you for your contribution to {claim?.title || 'this cause'}.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg sm:text-xl font-semibold text-teal-900">Add to Donations</h3>
          <button onClick={onClose} className="text-teal-600 hover:text-teal-800">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4 p-3 bg-teal-50 rounded-lg">
          <p className="text-sm text-teal-700">Donating to: <span className="font-medium">{claim?.title || 'Claim'}</span></p>
          <p className="text-xs text-teal-600">Goal: ₹{claim?.amountRequested || 0}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-teal-700 mb-1">Donation Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border border-teal-300 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Enter amount"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-teal-700 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-teal-300 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Your full name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-teal-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-teal-300 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-teal-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-teal-300 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="+91 9876543210"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-teal-700 mb-1">Message (Optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-lg border border-teal-300 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Leave a message of support..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-teal-300 px-4 py-2 text-sm text-teal-700 hover:bg-teal-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-teal-600 px-4 py-2 text-sm text-white hover:bg-teal-700 disabled:opacity-50"
            >
              {submitting ? 'Processing...' : 'Donate Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
