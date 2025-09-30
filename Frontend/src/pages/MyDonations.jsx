import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getMyDonations } from '../lib/api/donations';

const DonationCard = ({ donation }) => {
    if (!donation || !donation.claimId) {
        return null;
    }

    const { amount, status, createdAt, claimId, beneficiaryId } = donation;

    // --- MODIFICATION HERE: Logic to find the beneficiary's name ---
    const beneficiaryName = beneficiaryId?.personalDetails?.fullName || beneficiaryId?.name || 'N/A';

    const statusClasses = {
        COMPLETED: 'bg-green-100 text-green-800',
        PENDING: 'bg-yellow-100 text-yellow-800',
        FAILED: 'bg-red-100 text-red-800',
    };

    return (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="text-lg font-bold text-teal-800">{claimId.title}</h4>
                    <p className="text-sm text-gray-600">
                        {/* Use the new beneficiaryName variable */}
                        To: <span className="font-semibold">{beneficiaryName}</span>
                    </p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
                    {status}
                </span>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-end">
                <div>
                    <p className="text-sm text-gray-500">Donated On</p>
                    <p className="text-base font-medium text-gray-800">
                        {new Date(createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <div>
                    <p className="text-sm text-gray-500 text-right">Amount</p>
                    <p className="text-2xl font-bold text-teal-600">
                        ₹{amount.toLocaleString('en-IN')}
                    </p>
                </div>
            </div>
        </div>
    );
};


const MyDonations = () => {
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDonations = async () => {
            try {
                setLoading(true);
                const userDonations = await getMyDonations();
                setDonations(userDonations);
            } catch (err) {
                setError('Could not load your donations. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDonations();
    }, []);

    const groupedDonations = useMemo(() => {
        if (!donations || donations.length === 0) {
            return {};
        }

        return donations.reduce((acc, donation) => {
            // --- MODIFICATION HERE: Logic to find the category type ---
            const category = donation.claimId?.type || 'Uncategorized';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(donation);
            return acc;
        }, {});
    }, [donations]);

    if (loading) {
        return <div className="text-center py-20 text-xl font-semibold text-teal-600">Loading Your Donations...</div>;
    }

    if (error) {
        return <div className="text-center py-20 text-xl font-semibold text-red-600">{error}</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-4xl font-extrabold text-teal-900">My Donations</h1>
                    {/* <Link 
                        to="/" 
                        className="px-4 py-2 bg-white text-teal-600 font-semibold rounded-full shadow-md hover:bg-teal-50 transition-colors border border-gray-200 flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        Back to Dashboard
                    </Link> */}
                </div>

                {Object.keys(groupedDonations).length === 0 ? (
                    <div className="text-center py-16 px-6 bg-white rounded-2xl shadow-md">
                        <h2 className="text-2xl font-semibold text-gray-700">No Donations Found</h2>
                        <p className="mt-2 text-gray-500">You haven't made any donations yet. Browse ongoing claims to get started!</p>
                    </div>
                ) : (
                    <div className="space-y-10">
                        {Object.keys(groupedDonations).map(category => (
                            <section key={category}>
                                <h2 className="text-2xl font-bold text-teal-800 border-b-2 border-teal-200 pb-2 mb-6">
                                    {category}
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {groupedDonations[category].map(donation => (
                                        <DonationCard key={donation._id} donation={donation} />
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyDonations;

