import { useEffect, useState, useCallback } from 'react';
import { 
    fetchAllClaims, 
    createClaim,
    getMyClaims 
} from '../lib/api/claims'; 

// --- ClaimCard Component ---
const ClaimCard = ({ claim }) => {
    // Updated statuses based on the Mongoose model
    const statusColors = {
        'Pending Verification': 'bg-yellow-100 text-yellow-800',
        'Approved': 'bg-blue-100 text-blue-800',
        'Rejected': 'bg-red-100 text-red-800',
        'Fully Funded': 'bg-green-100 text-green-800',
        'Closed': 'bg-gray-100 text-gray-500',
    };
    
    // Calculate progress (using the virtual field logic)
    const progress = claim.amountRequested > 0 
        ? Math.min(100, Math.round((claim.amountRaised / claim.amountRequested) * 100)) 
        : 0;
    
    // Display Beneficiary info if populated
    const beneficiaryName = claim.beneficiary?.personalDetails?.fullName || claim.beneficiary?._id || 'N/A';

    return (
        <div className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100 transform transition-transform duration-300 hover:scale-[1.02] flex flex-col">
            <div className="flex justify-between items-start">
                {/* BUG FIX: Ensure h4 title can shrink, preventing overflow on mobile */}
                <h4 className="text-lg font-bold text-teal-900 pr-2 overflow-hidden overflow-ellipsis whitespace-nowrap min-w-0 flex-1">{claim.title}</h4>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${statusColors[claim.status] || statusColors['Pending Verification']}`}>
                    {claim.status}
                </span>
            </div>
            <p className="mt-2 text-sm text-gray-600 line-clamp-2 flex-grow">{claim.description}</p>
            
            <div className="mt-3">
                <div className="flex justify-between text-xs font-medium">
                    <span className="text-gray-700">Funds: ₹{claim.amountRaised?.toLocaleString() || 0} / ₹{claim.amountRequested?.toLocaleString() || 0}</span>
                    <span className="text-teal-600 font-semibold">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div 
                        className="bg-teal-600 h-1.5 rounded-full transition-all duration-500" 
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>
            
            <div className="mt-3 text-xs text-gray-500 flex justify-between items-center border-t pt-2">
                <span>Beneficiary: <span className="font-medium text-teal-700">{beneficiaryName}</span></span>
                <span className="font-semibold text-teal-600">{claim.type}</span>
            </div>
        </div>
    );
};

// --- Claims Component ---
export default function Claims() {
    const [claims, setClaims] = useState([]);
    const [myClaims, setMyClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // --- State setup (no functional change) ---
    const [type, setType] = useState('Medical Claim'); 
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [beneficiaryEhrms, setBeneficiaryEhrms] = useState(''); 
    const [submitMsg, setSubmitMsg] = useState('');
    const [submitting, setSubmitting] = useState(false);
    
    const claimTypes = [
        // 'Medical Claim',
        // "Daughter's Marriage",
        'Death During Service',
        'Retirement Farewell',
        'Death After Service',
    ];

    const clearSubmitMessages = useCallback(() => {
        setSubmitMsg('');
        setError('');
    }, []);

    const fetchClaims = useCallback(async () => {
        try {
            setError('');
            setLoading(true);
            
            const [allData, myData] = await Promise.all([
                fetchAllClaims(), 
                getMyClaims()
            ]);
            
            setClaims(allData);
            setMyClaims(myData); // Set the new state
        } catch (e) {
            setError(e.message || 'Failed to load claims.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchClaims();
    }, [fetchClaims]);

    async function onSubmit(e) {
        e.preventDefault();
        clearSubmitMessages(); 
        setSubmitting(true);
        
        if (!beneficiaryEhrms.trim()) {
            setSubmitMsg("Error: Beneficiary EHMRS code is required.");
            setSubmitting(false);
            return;
        }

        const claimBody = { 
            type, 
            title, 
            description, 
            beneficiaryEhrms, 
            supportingDocuments: [] 
        };

        try {
            const newClaim = await createClaim(claimBody); 
            console.log(newClaim)
            setSubmitMsg(`Success: Claim ${newClaim.data.claimId} submitted for verification. Requested amount: ₹${newClaim.data.amountRequested?.toLocaleString() || newClaim.amountRequested || 'N/A'}`);
            
            await fetchClaims();
            // Reset form fields
            setType(claimTypes[0]);
            setTitle('');
            setDescription('');
            setBeneficiaryEhrms('');

        } catch (e) {
            console.error("Claim Submission Error:", e);
            const errorMessage = e.message || 'Failed to create claim due to an unknown error.';
            setSubmitMsg(`Error: ${errorMessage}`);
            
        } finally {
            setSubmitting(false);
        }
    }

    const isSuccess = submitMsg.toLowerCase().startsWith('success');

    return (
        // --- UPDATED MAIN LAYOUT FOR RESPONSIVENESS ---
        <div className="min-h-screen py-10 px-4">
            <div className="max-w-7xl mx-auto space-y-10">
                <div className="text-center">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-teal-800 tracking-tight">Community Claims Portal</h1>
                    <p className="mt-2 text-base text-gray-500">View and support fellow members, or submit your own claim for verification.</p>
                </div>

                {/* Grid layout: Form (left) and List (right) */}
                {/* On mobile, the grid becomes 1 column (stacking the form above the list) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* --- 1. CLAIM SUBMISSION FORM (Mobile-First Sticky) --- */}
                    {/* Use lg:col-span-1 for small side column on large screens */}
                    <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-xl border border-gray-100 h-fit lg:sticky lg:top-24">
                        <h2 className="text-xl font-bold text-teal-900 mb-5 border-b pb-3">
                            Submit a New Claim
                        </h2>
                        {submitMsg && (
                            <div className={`p-3 mb-5 rounded-lg text-sm font-medium ${isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {submitMsg.replace(/^(Success|Error): /, '')} 
                            </div>
                        )}
                        <form onSubmit={onSubmit} className="space-y-4">
                            
                            <fieldset className="grid grid-cols-1 gap-4">
                                <legend className="text-sm font-semibold text-teal-700 mb-2">Claim Details</legend>
                                {/* Claim Type */}
                                <div>
                                    <label htmlFor="claimType" className="block text-xs font-medium text-gray-700">Claim Type <span className="text-red-500">*</span></label>
                                    <select
                                        id="claimType"
                                        className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm text-sm"
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                        required
                                    >
                                        {claimTypes.map(ct => <option key={ct} value={ct}>{ct}</option>)}
                                    </select>
                                </div>
                                {/* Claim Title */}
                                <div>
                                    <label htmlFor="claimTitle" className="block text-xs font-medium text-gray-700">Claim Title <span className="text-red-500">*</span></label>
                                    <input
                                        id="claimTitle"
                                        type="text"
                                        className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm text-sm"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                        maxLength="100"
                                        placeholder="Max 100 characters, e.g., Critical Surgery Funds"
                                    />
                                </div>
                            </fieldset>

                            {/* Beneficiary Details */}
                            <fieldset className="pt-2 border-t border-gray-100">
                                <legend className="text-sm font-semibold text-teal-700 mb-2">Beneficiary Identification</legend>
                                {/* Beneficiary ID */}
                                <div>
                                    <label htmlFor="beneficiaryEhrms" className="block text-xs font-medium text-gray-700">Beneficiary EHMRS Code <span className="text-red-500">*</span></label>
                                    <input
                                        id="beneficiaryEhrms"
                                        type="text"
                                        className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm text-sm"
                                        value={beneficiaryEhrms}
                                        onChange={(e) => setBeneficiaryEhrms(e.target.value)}
                                        required
                                        placeholder="e.g., EMP002, ADMIN001"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">This is the unique employee code, required for eligibility check.</p>
                                </div>
                            </fieldset>
                            
                            {/* Description */}
                            <div>
                                <label htmlFor="description" className="block text-xs font-medium text-gray-700">Detailed Description <span className="text-red-500">*</span></label>
                                <textarea
                                    id="description"
                                    rows="3"
                                    className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm text-sm"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                    placeholder="Explain the urgency, purpose, and context of the claim clearly."
                                />
                            </div>

                            {/* Note and Submit Button */}
                            <div className="pt-2 border-t border-gray-100">
                                <p className="text-xs text-gray-500 mb-3">
                                    Note: Amount is **automatically calculated** by the system based on the Beneficiary's history.
                                </p>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full flex items-center justify-center gap-2 rounded-full bg-teal-600 px-6 py-3 text-white font-semibold shadow-lg disabled:opacity-60 disabled:cursor-not-allowed hover:bg-teal-700 transition-colors text-base"
                                >
                                    {submitting ? (
                                        <>
                                            <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Submitting...
                                        </>
                                    ) : 'Submit Claim for Verification'}
                                </button>
                            </div>
                        </form>
                    </div>
                    
                    {/* --- 2. CLAIMS LIST (Mobile-First Scrolling) --- */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* --- NEW: MY CLAIMS REPORT SECTION --- */}
                        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
                            <h2 className="text-xl sm:text-2xl font-bold text-teal-900 mb-4 border-b pb-3 flex justify-between items-center">
                                My Claims Report ({myClaims.length})
                                <span className="text-sm font-medium text-gray-500">Claims I have raised</span>
                            </h2>
                            {loading ? (
                                <p className="text-center text-gray-500 py-4">Loading your claims...</p>
                            ) : myClaims.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">You have not submitted any claims yet.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left font-semibold text-gray-600">Claim ID</th>
                                                <th className="px-6 py-3 text-left font-semibold text-gray-600">Type</th>
                                                <th className="px-6 py-3 text-left font-semibold text-gray-600">Status</th>
                                                <th className="px-6 py-3 text-right font-semibold text-gray-600">Requested (₹)</th>
                                                <th className="px-6 py-3 text-right font-semibold text-gray-600">Raised (₹)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {myClaims.map(claim => (
                                                <tr key={claim._id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">{claim.claimId}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">{claim.type}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-0.5 text-xs font-medium rounded bg-gray-200 text-gray-800`}>
                                                            {claim.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">{claim.amountRequested?.toLocaleString() || 0}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-teal-700 font-medium">{claim.amountRaised?.toLocaleString() || 0}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-teal-900 mb-6 border-b pb-3">Active Community Claims ({claims.length})</h2>
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Loading placeholders are responsive */}
                                {[...Array(4)].map((_, i) => <div key={i} className="h-40 rounded-2xl bg-gray-200 animate-pulse" />)}
                            </div>
                        ) : error ? (
                            <p className="text-red-600 text-center p-10 bg-white rounded-xl shadow">{error}</p>
                        ) : (
                            // The list itself is responsive: 1 column on mobile, 2 on medium+ screens
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {claims.length > 0 ? (
                                    claims.map((c) => (
                                        <ClaimCard key={c._id || c.claimId} claim={c} /> 
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-center md:col-span-2 p-10 bg-white rounded-xl shadow">No claims found.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}