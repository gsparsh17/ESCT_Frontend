import { Link } from 'react-router-dom'

export default function ClaimCard({ claim }) {
	const id = claim._id || claim.id
	const title = claim.title || claim.category || 'Claim'
	const raisedBy = claim?.raisedBy?.personalDetails?.fullName || 'Unknown'
	const goal = claim.amountRequested || 0
	const image = claim.beneficiary.photoUrl || `https://i.pravatar.cc/150?u=${id}`
	return (
		<Link to={`/claims/${id}`} className="block rounded-xl sm:rounded-2xl bg-white border border-teal-100 p-2 sm:p-3 shadow-sm hover:shadow">
			<div className="flex items-center gap-2 sm:gap-3">
				<img src={image} alt="" className="h-12 w-12 sm:h-14 sm:w-14 rounded-lg sm:rounded-xl object-cover" />
				<div className="flex-1 min-w-0">
					<p className="font-semibold text-sm sm:text-base text-teal-900 truncate">{title}</p>
					<p className="text-xs sm:text-sm text-teal-700 truncate">Raised by: {raisedBy}</p>
				</div>
				<span className="text-xs rounded-md bg-teal-100 text-teal-800 px-1.5 sm:px-2 py-0.5 sm:py-1 flex-shrink-0">Goal: ₹{goal}</span>
			</div>
		</Link>
	)
}
