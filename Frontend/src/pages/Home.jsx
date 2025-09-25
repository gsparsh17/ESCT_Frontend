import { useEffect, useState, useMemo, useCallback } from 'react';
// Import real API functions
import { fetchAllClaims } from '../lib/api/claims'; 
import { getDonationQueue, getMe } from '../lib/api/donations'; // Import getMe and getDonationQueue

// --- MOCK DATA REMAINS ---
const staticNews = [
    { id: 1, title: 'ESCT Reaches New Milestone in Donations', summary: 'The Employee Self Care Team has surpassed a major milestone in total donations collected for members in need.', image: 'https://picsum.photos/seed/news1/600/400' },
    { id: 2, title: 'Annual General Meeting Announced', summary: 'The Annual General Meeting will be held on December 10, 2025. All members are encouraged to attend.', image: 'https://picsum.photos/seed/news2/600/400' },
    { id: 3, title: 'New Membership Benefits Roll Out', summary: 'Exciting new benefits for all ESCT members are now live. Check out the new details in your dashboard.', image: 'https://picsum.photos/seed/news3/600/400' },
];

// Mock ClaimCard component (Kept for component functionality)
const ClaimCard = ({ claim, type }) => {
    const isOutgoing = type === 'outgoing';
    const categoryClass = (category) => {
        switch (category) {
            case 'Death During Service': return 'bg-red-200 text-red-800';
            case 'Death After Service': return 'bg-gray-200 text-gray-800';
            case 'Retirement Farewell': return 'bg-yellow-200 text-yellow-800';
            case "Daughter's Marriage": return 'bg-pink-200 text-pink-800';
            case 'Medical Claim': return 'bg-blue-200 text-blue-800';
            default: return 'bg-teal-200 text-teal-800';
        }
    };

    // For outgoing donations, 'claim' is actually a queue item containing claimId: { claim details }
    const displayClaim = isOutgoing ? claim.claimId || claim : claim;

    // Use the actual donation amount from the queue item for outgoing cards
    const donationAmount = isOutgoing ? claim.amount : null;

    // Calculate progress for incoming claims view
    const progress = displayClaim.amountRequested > 0 
        ? Math.min(100, Math.round((displayClaim.amountRaised / displayClaim.amountRequested) * 100)) 
        : 0;

    return (
        <div className="flex-none p-4 w-full h-full rounded-2xl bg-white border border-gray-100 shadow-md transform transition-transform duration-300 hover:scale-[1.02] active:scale-95 flex flex-col justify-between">
            <div>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${categoryClass(displayClaim.type || displayClaim.category)}`}>
                    {displayClaim.type || displayClaim.category}
                </span>
                <h4 className="mt-2 text-lg font-semibold text-teal-900 truncate">
                    {displayClaim.title || `Donation for ${displayClaim.type} Claim`}
                </h4>
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                    {isOutgoing ? `Monthly contribution amount: ₹${donationAmount?.toLocaleString()}` : displayClaim.description}
                </p>
            </div>
            <div className="mt-4 flex justify-between items-center">
                {isOutgoing ? (
                    <span className="text-xl font-bold text-teal-600">
                        ₹{donationAmount?.toLocaleString()} / month
                    </span>
                ) : (
                    <span className="text-sm font-medium text-gray-700">
                        {displayClaim.amountRequested ? `Need: ₹${displayClaim.amountRequested.toLocaleString()}` : 'No amount specified'}
                    </span>
                )}
                <a href={`/claims/${displayClaim._id || displayClaim.claimId}`} className="text-sm font-semibold text-teal-600 hover:text-teal-800 transition-colors">
                    View Details
                </a>
            </div>
        </div>
    );
};

// Main component
const Home = () => {
    const [allClaims, setAllClaims] = useState([]);
    const [myDonationsQueue, setMyDonationsQueue] = useState([]); // Renamed from allDonations
    const [currentUser, setCurrentUser] = useState(null); // New state for current user
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Determine the unique user ID and display name from the fetched user data
    const { userId, displayName, totalUserContribution } = useMemo(() => {
        const user = currentUser;
        const id = user?._id || user?.id || user?.userId || user?.ehrmsCode || null;
        const name = user?.personalDetails?.fullName || user?.name || user?.ehrmsCode || 'Member';
        const contribution = user?.totalDonationsCompleted || 0; // Assuming totalDonationsCompleted is a direct field on the User object
        
        return { 
            userId: id, 
            displayName: name,
            totalUserContribution: contribution
        };
    }, [currentUser]);
    
    // Fetch Data from Real API Endpoints
    const fetchData = useCallback(async () => {
        try {
            setError(null);
            setLoading(true);

            // Fetch current user data first
            const user = await getMe();
            setCurrentUser(user);

            if (user) {
                // Use Promise.all to fetch claims and donations simultaneously
                const [claimsData, donationQueueData] = await Promise.all([
                    fetchAllClaims(), 
                    getDonationQueue() 
                ]);
                
                setAllClaims(claimsData);
                setMyDonationsQueue(donationQueueData);
            }
        } catch (e) {
            console.error("Home Data Fetch Error:", e);
            setError('Failed to load dashboard data. Please check your login status.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- Data Filtering and Processing ---

    // Filter claims by the Mongoose 'type' enum names
    const filterClaimsByType = (claims, type) => claims.filter(c => c.type === type);

    // Claims filtering logic based on Mongoose schema statuses
    const upcomingClaims = allClaims.filter(c => c.status === 'Pending Verification');
    const myClaims = allClaims.filter(c => c.raisedBy === userId); // Filter claims raised by current user ID
    const ongoingClaims = allClaims.filter(c => c.status === 'Approved'); // 'Approved' claims are the active/ongoing ones

    if (loading) return <div className="text-center py-12">Loading dashboard...</div>;
    if (error) return <div className="text-center py-12 text-red-600">{error}</div>;

    function CategorySliderWindow({ title, claims, emptyMessage }) {
        return (
            <div className="w-full flex-none sm:w-1/3 p-2">
                <h3 className="text-lg font-semibold text-teal-800 mb-2">{title}</h3>
                <div className="h-64 overflow-y-auto space-y-3 p-1 rounded-lg bg-white border border-gray-200 snap-y scroll-py-2">
                    {claims.length > 0 ? (
                        claims.map((claim) => (
                            <div key={claim._id || claim.claimId} className="h-full w-full snap-start">
                                <ClaimCard claim={claim} type="incoming" /> 
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex items-center justify-center p-4 rounded-lg bg-gray-50 text-gray-500 italic text-sm">
                            <p className="text-center">{emptyMessage}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }
    
    function OutgoingDonationWindow({ title, donations, emptyMessage, claimTypeFilter }) {
        // Filter the queue based on the claim type within the queue item
        const filteredDonations = donations.filter(d => d.claimId?.type === claimTypeFilter);

        return (
            <div className="w-full flex-none sm:w-1/3 p-2">
                <h3 className="text-lg font-semibold text-teal-800 mb-2">{title}</h3>
                <div className="h-64 overflow-y-auto space-y-3 p-1 rounded-lg bg-white border border-gray-200 snap-y scroll-py-2">
                    {filteredDonations.length > 0 ? (
                        filteredDonations.map((donation) => (
                            // Use the queue item ID for the key, assuming it has one
                            <div key={donation._id || donation.claimId._id} className="h-full w-full snap-start">
                                <ClaimCard claim={donation} type="outgoing" />
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex items-center justify-center p-4 rounded-lg bg-gray-50 text-gray-500 italic text-sm">
                            <p className="text-center">{emptyMessage}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-12 lg:-m-6 -m-2">
            {/* Welcome header */}
            <div className="rounded-b-3xl bg-gradient-to-br from-teal-500 to-teal-700 text-white p-6 shadow-lg">
                <div className="max-w-7xl mx-auto flex items-center gap-4">
                    <img src="https://placehold.co/100x100/5eead4/115e59?text=JD" alt="avatar" className="h-16 w-16 rounded-full border-4 border-white/40 shadow-lg" />
                    <div>
                        <p className="text-lg opacity-90 font-medium">Welcome back,</p>
                        <p className="text-3xl font-extrabold">{displayName}</p>
                    </div>
                </div>
            </div>
            
            <div className="max-w-7xl mx-auto mt-6 px-4">
                {/* Main Content Area */}
                <div className="bg-white rounded-3xl p-6">
                    
                    {/* Donation Stats Section (MOCK DATA KEPT FOR UI STRUCTURE) */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-teal-900 mb-4">ESCT Financial Overview</h2>
                        <div className="rounded-2xl bg-teal-700 text-white p-6 shadow-lg">
                            <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none]">
                                {/* Placeholder for Total Donation amount */}
                                {[2, 4, 5, 7, 8, 9, 5, 0].map((n, i) => (
                                    <div key={i} className="rounded-lg bg-teal-800/70 px-4 py-2 text-3xl font-bold flex-shrink-0 shadow-inner">
                                        {n}
                                    </div>
                                ))}
                            </div>
                            <p className="mt-4 text-lg font-medium">Total Donation on ESCT Till Date</p>
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm font-medium opacity-90">
                                {/* Placeholder for Category Totals */}
                                <div className="flex justify-between"><span>Death After Service</span><span className="font-semibold">₹65,42,300</span></div>
                                <div className="flex justify-between"><span>Retirement</span><span className="font-semibold">₹87,35,650</span></div>
                                <div className="flex justify-between"><span>Death During Service</span><span className="font-semibold">₹45,20,100</span></div>
                                <div className="flex justify-between"><span>Other Help</span><span className="font-semibold">₹47,80,900</span></div>
                            </div>
                        </div>
                    </section>
                    
                    <hr className="my-8" />

                    {/* Upcoming Claims Section (Using real API data) */}
                    <section className="mt-8">
                        <h2 className="text-2xl font-bold text-teal-900 mb-4">Upcoming Claims</h2>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <CategorySliderWindow
                                title="Retirement"
                                claims={filterClaimsByType(upcomingClaims, 'Retirement Farewell')}
                                emptyMessage="No upcoming retirement claims."
                            />
                            <CategorySliderWindow
                                title="Death After Service"
                                claims={filterClaimsByType(upcomingClaims, 'Death After Service')}
                                emptyMessage="No upcoming death after service claims."
                            />
                            <CategorySliderWindow
                                title="Death During Service"
                                claims={filterClaimsByType(upcomingClaims, 'Death During Service')}
                                emptyMessage="No upcoming death during service claims."
                            />
                        </div>
                    </section>
                    
                    <hr className="my-8" />

                    {/* My Claims Section (Using real API data) */}
                    <section className="mt-8">
                        <h2 className="text-2xl font-bold text-teal-900 mb-4">My Claims (Raised)</h2>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <CategorySliderWindow
                                title="Retirement"
                                claims={filterClaimsByType(myClaims, 'Retirement Farewell')}
                                emptyMessage="You haven't raised any retirement claims."
                            />
                            <CategorySliderWindow
                                title="Daughter's Marriage"
                                claims={filterClaimsByType(myClaims, "Daughter's Marriage")}
                                emptyMessage="You haven't raised any marriage claims."
                            />
                            <CategorySliderWindow
                                title="Medical Claim"
                                claims={filterClaimsByType(myClaims, 'Medical Claim')}
                                emptyMessage="You haven't raised any medical claims."
                            />
                        </div>
                    </section>
                    
                    <hr className="my-8" />

                    {/* My Outgoing Donations Section (Using real API data - Donation Queue) */}
                    <section className="mt-8">
                        <h2 className="text-2xl font-bold text-teal-900 mb-4">My Outgoing Donations (Queue)</h2>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <OutgoingDonationWindow
                                title="Retirement"
                                donations={myDonationsQueue}
                                claimTypeFilter={'Retirement Farewell'}
                                emptyMessage="You have no retirement claims in your queue."
                            />
                            <OutgoingDonationWindow
                                title="Death After Service"
                                donations={myDonationsQueue}
                                claimTypeFilter={'Death After Service'}
                                emptyMessage="You have no death after service claims in your queue."
                            />
                            <OutgoingDonationWindow
                                title="Death During Service"
                                donations={myDonationsQueue}
                                claimTypeFilter={'Death During Service'}
                                emptyMessage="You have no death during service claims in your queue."
                            />
                        </div>
                    </section>
                    
                    <hr className="my-8" />

                    {/* Gallery Section (MOCK DATA KEPT) */}
                    <section className="mt-8">
                        <h2 className="text-2xl font-bold text-teal-900 mb-4">Gallery</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <img key={i} className="rounded-2xl h-48 w-full object-cover shadow-md transition-transform duration-300 hover:scale-[1.02] cursor-pointer" src={`https://picsum.photos/seed/${i}/600/400`} alt={`Gallery image ${i}`} />
                            ))}
                        </div>
                    </section>

                    {/* News & Blog Section (MOCK DATA KEPT) */}
                    <section className="mt-8">
                        <h2 className="text-2xl font-bold text-teal-900 mb-4">Latest News & Blog</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {staticNews.map(item => (
                                <div key={item.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                                    <img src={item.image} alt={item.title} className="w-full h-40 object-cover" />
                                    <div className="p-4">
                                        <h3 className="text-lg font-bold text-teal-900 truncate">{item.title}</h3>
                                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{item.summary}</p>
                                        <a href="#" className="mt-3 inline-block text-sm font-semibold text-teal-600 hover:text-teal-800 transition-colors">
                                            Read more →
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Know Your Contribution Section (Using real API data) */}
                    <section className="mt-8">
                        <h2 className="text-2xl font-bold text-teal-900 mb-4">Know Your Contribution</h2>
                        <div className="rounded-2xl bg-teal-600 text-white p-6 shadow-lg text-center">
                            <p className="text-base font-medium opacity-90">Your Total Contribution to the Community</p>
                            <p className="mt-2 text-5xl font-extrabold">
                                {/* Display total contribution from user state */}
                                ₹{totalUserContribution.toLocaleString()}
                            </p>
                            <a href="/my-donations" className="mt-4 inline-block px-6 py-2 bg-white text-teal-600 font-semibold rounded-full shadow-md hover:bg-teal-50 transition-colors">
                                View My Donations
                            </a>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
};

export default Home;