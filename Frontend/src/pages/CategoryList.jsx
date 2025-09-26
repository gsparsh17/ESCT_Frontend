// File: src/components/CategoryList.js

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom'; 
import { fetchAllClaims } from '../lib/api/claims';
import { initiateDonation } from '../lib/api/donations'; 

const ClaimCard = ({ claim, onClick }) => {
    const statusColors = {
        'Approved': 'bg-blue-100 text-blue-800',
        'Pending Verification': 'bg-yellow-100 text-yellow-800',
        'Fully Funded': 'bg-green-100 text-green-800',
    };
    const status = claim.status || 'Approved';

    return (
        <div 
            onClick={() => onClick(claim)}
            className="p-4 rounded-2xl bg-white border border-gray-100 shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-200 flex justify-between items-center"
        >
            <div>
                <h3 className="text-lg font-semibold text-teal-900">{claim.title}</h3>
                <p className="text-sm text-gray-600 truncate">{claim.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                    Beneficiary: <span className="font-medium text-teal-700">
                        {claim.beneficiary?.personalDetails?.fullName || 'N/A'}
                    </span>
                </p>
            </div>
            <div className="flex flex-col items-end gap-1">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[status]}`}>
                    {status}
                </span>
                <button className="text-sm text-teal-600 hover:text-teal-800">
                    View & Add to Queue →
                </button>
            </div>
        </div>
    );
};

const ClaimDetailModal = ({ claim, onClose, onError }) => {
    const navigate = useNavigate();
    const [adding, setAdding] = useState(false);
    
    if (!claim) return null;

    const handleAddToQueue = async () => {
        setAdding(true);
        onError(null);

        try {
            await initiateDonation(claim._id);
            navigate('/donation-queue?added=true');
        } catch (e) {
            console.error("Add to Queue Error:", e);
            onError(`Failed to add claim to queue: ${e.message || 'Check eligibility.'}`);
        } finally {
            setAdding(false);
            onClose();
        }
    };

    const progressPercentage = (claim.amountRaised / claim.amountRequested) * 100;
    const isApproved = claim.status === 'Approved' || claim.status === 'Fully Funded';
    const isFullyFunded = claim.status === 'Fully Funded';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-lg p-6 bg-white rounded-2xl shadow-2xl">
                <div className="flex items-start justify-between">
                    <h2 className="text-2xl font-bold text-teal-900">{claim.title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="mt-4 space-y-4 text-gray-700">
                    <p>
                        <strong className="text-gray-900">Type:</strong> <span className="text-teal-600 font-semibold">{claim.type}</span>
                    </p>

                    <div className="flex items-center gap-2">
                        <strong className="text-gray-900">Status:</strong>
                        <span className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {isApproved ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.487 0l5.58 9.92c.754 1.348-.278 3.033-1.874 3.033H4.557c-1.596 0-2.62-1.685-1.874-3.033L8.257 3.099zM10 11a1 1 0 100-2 1 1 0 000 2zm.707 4a1 1 0 10-1.414 0 1 1 0 001.414 0z" clipRule="evenodd" />
                                </svg>
                            )}
                            {claim.status}
                        </span>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center text-sm font-medium text-gray-900">
                            <span>Raised: ₹{claim.amountRaised?.toLocaleString()}</span>
                            <span>Goal: ₹{claim.amountRequested?.toLocaleString()}</span>
                        </div>
                        <div className="relative pt-1">
                            <div className="w-full h-2 mt-1 overflow-hidden bg-gray-200 rounded-full">
                                <div className="h-full bg-teal-600 transition-all duration-500 ease-out" style={{ width: `${Math.min(100, progressPercentage)}%` }}></div>
                            </div>
                        </div>
                        <span className="block mt-2 text-xs text-gray-500 text-right">{progressPercentage.toFixed(0)}% Funded</span>
                    </div>

                    <p className="mt-4"><strong>Description:</strong> {claim.description}</p>
                    
                    <div className="border-t border-gray-200 pt-4 mt-4">
                        <h3 className="flex items-center gap-2 text-lg font-semibold text-teal-800 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            Beneficiary Details
                        </h3>
                        <div className="text-sm space-y-1">
                            <p><strong>Name:</strong> {claim.beneficiary?.personalDetails?.fullName || 'N/A'}</p>
                            <p><strong>User ID:</strong> {claim.beneficiary?.userId || 'N/A'}</p>
                            <p><strong>District:</strong> {claim.beneficiary?.employmentDetails?.district || 'N/A'}</p>
                        </div>
                    </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-6">
                    <button 
                        onClick={onClose} 
                        className="px-5 py-2 text-gray-600 transition-colors border rounded-full hover:bg-gray-100"
                        disabled={adding}
                    >
                        Close
                    </button>
                    <button 
                        onClick={handleAddToQueue} 
                        className="flex items-center gap-2 px-6 py-2 font-semibold text-white transition-colors bg-teal-600 rounded-full hover:bg-teal-700 disabled:opacity-60"
                        disabled={adding}
                    >
                        {adding ? (
                            <>
                                <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Adding...
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                                Add to Donation Queue
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function CategoryList() {
    const [params] = useSearchParams();
    const navigate = useNavigate(); // For navigation to the queue page
    const category = params.get('category') || 'Medical Claim';
    
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedClaim, setSelectedClaim] = useState(null); // State for modal data

    useEffect(() => {
        const loadClaims = async () => {
            try {
                const data = await fetchAllClaims();
                setClaims(data);
                setError(null);
            } catch (e) {
                console.error("Claim List Fetch Error:", e);
                setError('Failed to load claims list.');
            } finally {
                setLoading(false);
            }
        };
        loadClaims();
    }, []);

    const filtered = useMemo(() => {
        let filteredClaims = claims; 
        filteredClaims = filteredClaims.filter(c => c.status === 'Approved');

        if (!category) return filteredClaims;

        return filteredClaims.filter((c) => (c.type || '').toLowerCase().includes(category.toLowerCase()));
    }, [claims, category]);
    
    const handleClaimClick = useCallback((claim) => {
        setSelectedClaim(claim);
    }, []);

    return (
<div className="min-h-screen p-6">
            <h1 className="text-3xl font-extrabold text-teal-700">{category} Claims</h1>
            
            {error && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            <div className="mt-6 space-y-4">
                {loading ? (
                    [...Array(6)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-gray-100 animate-pulse" />)
                ) : filtered.length === 0 ? (
                    <p className="text-gray-500 text-center py-10">No {category.toLowerCase()} claims found at this time.</p>
                ) : (
                    filtered.map((c) => (
                        <div key={c._id || c.claimId} className="flex gap-2 items-center">
                            <div className="flex-grow">
                                {/* Clicking the card opens the modal */}
                                <ClaimCard 
                                    claim={c} 
                                    onClick={handleClaimClick}
                                />
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Claim Details Modal */}
            {selectedClaim && (
                <ClaimDetailModal 
                    claim={selectedClaim} 
                    onClose={() => setSelectedClaim(null)} 
                    onError={setError}
                />
            )}
        </div>
    );
}