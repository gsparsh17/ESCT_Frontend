import { useEffect, useState } from 'react'
import api from '../lib/api/client'
import { fetchAllClaims } from '../lib/api/claims'
import ClaimCard from '../components/ClaimCard'
import { Link } from 'react-router-dom'

export default function Home() {
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

	function Section({ title, empty }) {
		return (
			<section className="mt-6 sm:mt-8">
				<h3 className="text-lg sm:text-2xl font-semibold text-teal-900">{title}</h3>
				<div className="mt-3 sm:mt-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-teal-50 to-white border border-teal-100 p-4 sm:p-6 lg:p-8 text-center text-sm sm:text-base text-teal-700">
					{empty}
				</div>
			</section>
		)
	}

	return (
		<div>
			{/* Welcome header */}
			<div className="rounded-b-2xl sm:rounded-b-3xl bg-gradient-to-b from-teal-700 to-teal-500 text-white p-4 sm:p-6">
				<div className="flex items-center gap-3 sm:gap-4">
					<img src="https://i.pravatar.cc/100?img=1" alt="avatar" className="h-12 w-12 sm:h-16 sm:w-16 rounded-full border-2 sm:border-4 border-white/40" />
					<div>
						<p className="text-sm sm:text-lg opacity-90">Welcome</p>
						<p className="text-xl sm:text-3xl font-semibold">Shivam</p>
					</div>
				</div>
			</div>

			<div className="py-4 sm:py-6">
				<Section title="Current Donations" empty="No donations in this category." />
				<Section title="Ongoing Donations" empty="No donations in this category." />

				{/* Upcoming Donations slider */}
				<section className="mt-6 sm:mt-8">
					<div className="flex items-center justify-between">
						<h3 className="text-lg sm:text-2xl font-semibold text-teal-900">Upcoming Donations</h3>
						<Link to="/claims" className="text-sm sm:text-base text-teal-700 font-medium">View All →</Link>
					</div>
					<div className="mt-3 sm:mt-4 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none]">
						<div className="flex gap-3 sm:gap-4 min-w-max pr-3 sm:pr-4">
							{loading ? (
								[...Array(3)].map((_, i) => (
									<div key={i} className="h-32 sm:h-40 w-64 sm:w-72 rounded-2xl bg-teal-100 animate-pulse" />
								))
							) : (
								claims.slice(0, 10).map((c) => (
									<div key={c._id || c.id} className="w-64 sm:w-72">
										<ClaimCard claim={c} />
									</div>
								))
							)}
						</div>
					</div>
				</section>

				{/* Stats card */}
				<section className="mt-6 sm:mt-8">
					<div className="rounded-2xl sm:rounded-3xl bg-teal-700 text-white p-4 sm:p-6 shadow">
						<div className="flex gap-1 sm:gap-2 overflow-x-auto">
							{[2,4,5,7,8,9,5,0].map((n, i) => (
								<div key={i} className="rounded-lg bg-teal-800/70 px-2 sm:px-3 py-1 sm:py-2 text-lg sm:text-2xl font-semibold flex-shrink-0">{n}</div>
							))}
						</div>
						<p className="mt-3 sm:mt-4 text-sm sm:text-lg">Total Donation on ESCT Till Date</p>
						<div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm opacity-90">
							<div className="flex justify-between"><span>Death After Service</span><span>₹65,42,300</span></div>
							<div className="flex justify-between"><span>Retirement</span><span>₹87,35,650</span></div>
							<div className="flex justify-between"><span>Death During Service</span><span>₹45,20,100</span></div>
							<div className="flex justify-between"><span>Other Help</span><span>₹47,80,900</span></div>
						</div>
					</div>
				</section>

				{/* Gallery */}
				<section className="mt-6 sm:mt-8">
					<h3 className="text-lg sm:text-2xl font-semibold text-teal-900">Gallery</h3>
					<div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
						{[1,2,3,4].map((i) => (
							<img key={i} className="rounded-xl sm:rounded-2xl h-32 sm:h-40 w-full object-cover" src={`https://picsum.photos/seed/${i}/600/300`} />
						))}
					</div>
				</section>
			</div>
		</div>
	)
}
