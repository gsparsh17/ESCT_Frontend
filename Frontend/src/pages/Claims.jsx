import { useEffect, useState, useCallback } from 'react';
import { 
    fetchAllClaims, 
    createClaim 
} from '../lib/api/claims'; // ADJUST PATH AS NEEDED

// Custom ClaimCard component for a clean UI
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
        <div className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100 transform transition-transform duration-300 hover:scale-[1.02]">
            <div className="flex justify-between items-start">
                <h4 className="text-lg font-bold text-teal-900 truncate pr-4">{claim.title}</h4>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${statusColors[claim.status] || statusColors['Pending Verification']}`}>
                    {claim.status}
                </span>
            </div>
            <p className="mt-2 text-sm text-gray-600 line-clamp-2">{claim.description}</p>
            
            <div className="mt-3">
                <div className="flex justify-between text-xs font-medium">
                    <span className="text-gray-700">Funding: ${claim.amountRaised?.toLocaleString() || 0} / ${claim.amountRequested?.toLocaleString() || 0}</span>
                    <span className="text-teal-600">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div 
                        className="bg-teal-600 h-1.5 rounded-full" 
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>
            
            <div className="mt-3 text-xs text-gray-500 flex justify-between items-center border-t pt-2">
                <span>Beneficiary: {beneficiaryName}</span>
                <span className="font-semibold">{claim.type}</span>
            </div>
        </div>
    );
};

export default function Claims() {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Form state updated with new claim types and fields
    const [type, setType] = useState('Medical Claim'); // Default to a new valid type
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [beneficiaryId, setBeneficiaryId] = useState(''); // Changed from beneficiaryEhrms to beneficiaryId
    const [amountRequested, setAmountRequested] = useState(''); // New field for initial request
    const [submitMsg, setSubmitMsg] = useState('');
    const [submitting, setSubmitting] = useState(false);
    
    // Claim Type options based on Mongoose enum
    const claimTypes = [
        'Medical Claim',
        'Retirement Farewell',
        'Death During Service',
        'Death After Service',
        "Daughter's Marriage",
    ];

    const clearSubmitMessages = useCallback(() => {
        setSubmitMsg('');
        setError('');
    }, []);

    const fetchClaims = useCallback(async () => {
        try {
            setError('');
            setLoading(true);
            const data = await fetchAllClaims(); 
            setClaims(data);
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
        
        // Basic frontend validation for new fields
        if (!beneficiaryId || !amountRequested || isNaN(Number(amountRequested)) || Number(amountRequested) <= 0) {
             setSubmitMsg("Error: Please provide a valid Beneficiary ID and a positive Amount Requested.");
             setSubmitting(false);
             return;
        }

        const claimBody = { 
            type, 
            title, 
            description, 
            beneficiary: beneficiaryId, // Use the ID field
            amountRequested: Number(amountRequested), // Send the initial request amount
            supportingDocuments: [] 
        };

        try {
            const message = await createClaim(claimBody); 
            
            setSubmitMsg(`Success: ${message}`);
            
            await fetchClaims(); // Refresh list

            // Reset form fields on success
            setType('Medical Claim');
            setTitle('');
            setDescription('');
            setBeneficiaryId('');
            setAmountRequested('');

        } catch (e) {
            console.error("Claim Submission Error:", e);
            
            // Extract the specific validation or eligibility message
            const errorMessage = e.message || 'Failed to create claim due to an unknown error.';
            setSubmitMsg(`Error: ${errorMessage}`);
            
        } finally {
            setSubmitting(false);
        }
    }

    const isSuccess = submitMsg.toLowerCase().startsWith('success');

    return (
        <div className="min-h-screen py-10 px-4">
            <div className="max-w-7xl mx-auto space-y-12">
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-teal-700">Claims Dashboard</h1>
                    <p className="mt-2 text-lg text-gray-500">View community claims or raise a new one.</p>
                </div>

                {/* Section to view all claims */}
                <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-200">
                    <h2 className="text-2xl font-bold text-teal-900 mb-6">All Claims</h2>
                    {loading ? (
                        <p className="text-center text-gray-500">Loading claims...</p>
                    ) : error ? (
                        <p className="text-red-600 text-center">{error}</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {claims.length > 0 ? (
                                claims.map((c) => (
                                    // Ensure key is correct, assuming _id or claimId exists
                                    <ClaimCard key={c._id || c.claimId} claim={c} /> 
                                ))
                            ) : (
                                <p className="text-gray-500 text-center md:col-span-3">No claims found.</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Section to create a new claim */}
                <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-200">
                    <h2 className="text-2xl font-bold text-teal-900 mb-6">Raise a New Claim</h2>
                    {submitMsg && (
                        <div className={`p-4 mb-6 rounded-lg font-medium ${isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {/* Display message cleanly, removing 'Success:' or 'Error:' prefix if present */}
                            {submitMsg.replace(/^(Success|Error): /, '')} 
                        </div>
                    )}
                    <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Claim Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Claim Type</label>
                            <select
                                className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                required
                            >
                                {claimTypes.map(ct => <option key={ct} value={ct}>{ct}</option>)}
                            </select>
                        </div>
                        {/* Amount Requested */}
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Amount Requested ($)</label>
                            <input
                                type="number"
                                step="any"
                                min="1"
                                className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
                                value={amountRequested}
                                onChange={(e) => setAmountRequested(e.target.value)}
                                required
                                placeholder="e.g., 50000"
                            />
                        </div>
                        {/* Claim Title */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Claim Title</label>
                            <input
                                type="text"
                                className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                placeholder="e.g., Funds for critical surgery"
                            />
                        </div>
                        {/* Description */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                rows="4"
                                className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                                placeholder="Provide a detailed description of the claim and the beneficiary's need."
                            />
                        </div>
                        {/* Beneficiary ID */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Beneficiary User ID (ObjectId)</label>
                            <input
                                type="text"
                                className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
                                value={beneficiaryId}
                                onChange={(e) => setBeneficiaryId(e.target.value)}
                                required
                                placeholder="Enter the MongoDB ObjectId of the beneficiary user"
                            />
                        </div>
                        {/* Submit Button */}
                        <div className="md:col-span-2">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full flex items-center justify-center gap-2 rounded-full bg-teal-600 px-6 py-2.5 text-white font-semibold shadow-md disabled:opacity-60 disabled:cursor-not-allowed hover:bg-teal-700 transition-colors"
                            >
                                {submitting ? 'Submitting...' : 'Submit Claim for Verification'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}