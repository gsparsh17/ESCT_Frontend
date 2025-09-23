import { useEffect, useState } from 'react'
import api from '../lib/api/client'
import { fetchAllClaims, createClaim } from '../lib/api/claims'

export default function Claims() {
	const [claims, setClaims] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')

	const [type, setType] = useState('MEDICAL')
	const [title, setTitle] = useState('')
	const [description, setDescription] = useState('')
	const [beneficiaryEhrms, setBeneficiaryEhrms] = useState('')
	const [submitMsg, setSubmitMsg] = useState('')
	const [submitting, setSubmitting] = useState(false)

	useEffect(() => {
		(async () => {
			try {
				const data = await fetchAllClaims(api)
				setClaims(data)
			} catch (e) {
				setError(e.message || 'Failed to load claims')
			} finally {
				setLoading(false)
			}
		})()
	}, [])

	async function onSubmit(e) {
		e.preventDefault()
		setSubmitMsg('')
		setSubmitting(true)
		try {
			const body = { type, title, description, beneficiaryEhrms, supportingDocuments: [] }
			const msg = await createClaim(body, api)
			setSubmitMsg(msg)
		} catch (e) {
			setSubmitMsg(e.message || 'Failed to create claim')
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div className="space-y-8">
			<div>
				<h2 className="text-xl font-semibold">Claims</h2>
				{loading ? (
					<p>Loading...</p>
				) : error ? (
					<p className="text-red-600 text-sm">{error}</p>
				) : (
					<ul className="mt-4 divide-y">
						{claims.map((c) => (
							<li key={c._id || c.id} className="py-3 flex items-center justify-between">
								<div>
									<p className="font-medium">{c.title}</p>
									<p className="text-sm text-teal-700">{c.description}</p>
								</div>
								<span className="text-xs rounded bg-teal-100 text-teal-800 px-2 py-0.5">{c.type || c.category}</span>
							</li>
						))}
					</ul>
				)}
			</div>

			<div>
				<h3 className="text-lg font-semibold">Create Claim</h3>
				<form onSubmit={onSubmit} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="block text-sm text-teal-700">Type</label>
						<input className="mt-1 w-full rounded border border-teal-300 px-3 py-2" value={type} onChange={(e) => setType(e.target.value)} required />
					</div>
					<div className="md:col-span-2">
						<label className="block text-sm text-teal-700">Title</label>
						<input className="mt-1 w-full rounded border border-teal-300 px-3 py-2" value={title} onChange={(e) => setTitle(e.target.value)} required />
					</div>
					<div className="md:col-span-2">
						<label className="block text-sm text-teal-700">Description</label>
						<textarea className="mt-1 w-full rounded border border-teal-300 px-3 py-2" value={description} onChange={(e) => setDescription(e.target.value)} required />
					</div>
					<div className="md:col-span-2">
						<label className="block text-sm text-teal-700">Beneficiary EHRMS</label>
						<input className="mt-1 w-full rounded border border-teal-300 px-3 py-2" value={beneficiaryEhrms} onChange={(e) => setBeneficiaryEhrms(e.target.value)} required />
					</div>
					{submitMsg && <p className="md:col-span-2 text-sm {submitMsg.includes('success') ? 'text-green-700' : 'text-red-600'}">{submitMsg}</p>}
					<button disabled={submitting} className="md:col-span-2 rounded-md bg-teal-600 px-4 py-2 text-white disabled:opacity-60">{submitting ? 'Submitting...' : 'Submit Claim'}</button>
				</form>
			</div>
		</div>
	)
}
