import { useEffect, useState } from 'react'
import api from '../lib/api/client'
import { getMyNominees } from '../lib/api/nominees'

export default function Nominees() {
	const [nominees, setNominees] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')

	useEffect(() => {
		(async () => {
			try {
				const data = await getMyNominees(api)
				setNominees(data)
			} catch (e) {
				setError(e.message || 'Failed to load nominees')
			} finally {
				setLoading(false)
			}
		})()
	}, [])

	return (
		<div>
			<h2 className="text-xl font-semibold">My Nominees</h2>
			{loading ? (
				<p>Loading...</p>
			) : error ? (
				<p className="text-red-600 text-sm">{error}</p>
			) : (
				<ul className="mt-4 divide-y">
					{nominees.map((n) => (
						<li key={n._id || n.id} className="py-3">
							<p className="font-medium">{n.name} <span className="text-xs text-teal-700">({n.relation})</span></p>
							<p className="text-sm text-teal-700">Aadhaar: {n.aadhaarNumber}</p>
						</li>
					))}
				</ul>
			)}
		</div>
	)
}
