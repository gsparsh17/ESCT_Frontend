// File: src/components/MyDonationQueue.js

import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getDonationQueue, removeDonationFromQueue, createDonationOrder } from '../lib/api/donations'; 

const QueueItemCard = ({ item, onRemove, isRemoving, submittingOrder }) => {
    const claim = item.claimId;
    const pendingDonation = item.donationId; 
    const isReadyToDonate = claim.status === 'Approved' || (claim.status === 'Fully Funded' && pendingDonation.status === 'PENDING');
    
    const monthlyAmount = pendingDonation?.amount || 200; 

    return (
        <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 flex items-center justify-between transition-shadow hover:shadow-xl">
            <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-teal-900 truncate">{claim.title}</h3>
                <p className="text-sm text-gray-500">{claim.type}</p>
                <p className="mt-1 text-base font-semibold text-teal-600">
                    Monthly Donation: ₹{monthlyAmount.toLocaleString()}
                </p>
                <span className={`mt-1 inline-block text-xs font-medium ${isReadyToDonate ? 'text-green-600' : 'text-red-600'}`}>
                    Status: {claim.status}
                </span>
            </div>
            
            <div className="flex flex-col gap-2 items-end ml-4">
                <button
                    onClick={() => onRemove(pendingDonation._id)}
                    disabled={isRemoving || submittingOrder}
                    className="px-3 py-1 text-xs rounded-full bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
                >
                    {isRemoving ? 'Removing...' : 'Remove'}
                </button>
                <button
                    onClick={() => submittingOrder(pendingDonation._id)} 
                    disabled={!isReadyToDonate || isRemoving || submittingOrder}
                    className="px-3 py-1 text-sm rounded-full bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 transition-colors"
                >
                    Donate Now
                </button>
            </div>
        </div>
    );
};

export default function MyDonationQueue() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');
    
    const [removingId, setRemovingId] = useState(null);
    const [isProcessingOrder, setIsProcessingOrder] = useState(false);

    const fetchQueue = useCallback(async () => {
        try {
            setError(null);
            const data = await getDonationQueue();
            setQueue(data);
        } catch (e) {
            setError(`Failed to load queue: ${e.message || 'Check connection.'}`);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchQueue();
        
        if (params.get('added')) {
            setMessage('Claim successfully added to your donation queue! You can proceed to donate.');
            navigate({ search: '' }, { replace: true });
        }
    }, [fetchQueue, params, navigate]);

    const handleRemove = async (donationId) => {
        setError(null);
        setMessage('');
        setRemovingId(donationId);
        
        try {
            await removeDonationFromQueue(donationId);
            setMessage('Claim removed from queue.');
            setQueue(prev => prev.filter(item => item.donationId._id !== donationId));
        } catch (e) {
            setError(`Failed to remove claim: ${e.message || 'Try again.'}`);
        } finally {
            setRemovingId(null);
        }
    };
    const handleCreateOrder = async (donationId) => {
        setError(null);
        setMessage('');
        setIsProcessingOrder(true);
        
        try {
            const orderResult = await createDonationOrder(donationId); 
            
            setMessage('Payment gateway opened...');
            
            console.log("Simulating Razorpay Payment initiation with order:", orderResult);
            
        } catch (e) {
            setError(`Failed to start payment: ${e.message || 'Check claim status.'}`);
        } finally {
            setIsProcessingOrder(false);
        }
    };

    return (
        <div className="min-h-screen py-10 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-extrabold text-teal-700 mb-6">My Donation Queue</h1>
                
                {/* Messages */}
                {error && (
                    <div className="p-3 mb-4 rounded-lg bg-red-100 text-red-700 border border-red-400">
                        Error: {error}
                    </div>
                )}
                {message && !error && (
                    <div className="p-3 mb-4 rounded-lg bg-green-100 text-green-700 border border-green-400">
                        {message}
                    </div>
                )}

                {/* Queue List */}
                {queue.length === 0 ? (
                    <div className="p-10 text-center bg-white rounded-xl shadow-lg border">
                        <p className="text-xl text-gray-500">Your donation queue is empty! 😭</p>
                        <p className="mt-2 text-gray-600">Browse approved claims to add items here.</p>
                        <a href="/" className="mt-4 inline-block text-teal-600 font-semibold hover:text-teal-800 transition-colors">
                            Go to Claims Dashboard →
                        </a>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {queue.map(item => (
                            <QueueItemCard 
                                key={item._id || item.claimId._id}
                                item={item}
                                onRemove={handleRemove}
                                isRemoving={removingId === item.claimId._id}
                                submittingOrder={handleCreateOrder}
                            />
                        ))}
                        
                        <div className="mt-8 pt-4 border-t text-center">
                            <p className="text-sm text-gray-600">
                                Total {queue.length} claims in queue. Click 'Donate Now' to proceed with payment.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}