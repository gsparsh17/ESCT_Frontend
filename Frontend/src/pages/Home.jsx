import { useEffect, useState, useMemo, useCallback } from 'react';

import { fetchAllClaims } from '../lib/api/claims'; 
import { getDonationQueue, getMe } from '../lib/api/donations'; 
import { getDonationCalendar } from '../lib/api/calendar'; // Import the calendar API
import { useNavigate } from 'react-router-dom';

// Assuming the fixed donation amount is 200 INR
const DONATION_AMOUNT = 200;

// Month names array for calendar rendering
const MONTH_NAMES = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

// Helper function to process flat event array into a nested structure by year
const processCalendarData = (events) => {
    const calendar = {};
    let totalDonations = 0;

    events.forEach(event => {
        // Handle YYYY-MM format
        const [year, monthIndex] = event.monthYear.split('-').map(v => parseInt(v)); 
        
        if (!calendar[year]) {
            // Initialize array for 12 months with default null values
            calendar[year] = Array(12).fill(null);
        }

        // Store the event at the correct index (monthIndex - 1)
        calendar[year][monthIndex - 1] = event;
        
        totalDonations += event.donationsCompleted || 0;
    });

    return { calendar, totalDonations };
};

const MonthBox = ({ month, status }) => {
    let bgColor, icon;
    
    if (status === 'COMPLETED') {
        bgColor = 'bg-green-100 text-green-700 border-green-300';
        icon = (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
        ); 
    } else if (status === 'PARTIAL') {
        bgColor = 'bg-yellow-100 text-yellow-700 border-yellow-300';
        icon = (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
        ); 
    } else {
        bgColor = 'text-red-700';
        icon = (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
        ); 
    }

    return (
        <div className={`p-2 sm:p-3 flex flex-col items-center justify-center rounded-lg shadow-sm border ${bgColor} transition-shadow hover:shadow-md`}>
            <span className="text-xs font-semibold">{month}</span>
            <div className="mt-1">{icon}</div>
        </div>
    );
};


const staticNews = [
    { id: 1, title: 'ESCT Reaches New Milestone in Donations', summary: 'The Employee Self Care Team has surpassed a major milestone in total donations collected for members in need.', image: 'https://picsum.photos/seed/news1/600/400' },
    { id: 2, title: 'Annual General Meeting Announced', summary: 'The Annual General Meeting will be held on December 10, 2025. All members are encouraged to attend.', image: 'https://picsum.photos/seed/news2/600/400' },
    { id: 3, title: 'New Membership Benefits Roll Out', summary: 'Exciting new benefits for all ESCT members are now live. Check out the new details in your dashboard.', image: 'https://picsum.photos/seed/news3/600/400' },
];

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

    const displayClaim = isOutgoing ? claim.claimId || claim : claim;
    // Assuming monthly donation amount is stored on the queue item or is fixed at 200
    const donationAmount = isOutgoing ? claim.donationId?.amount || DONATION_AMOUNT : null;

    return (
        <div className="flex-none p-4 w-full h-full rounded-2xl bg-white border border-gray-100 shadow-md flex flex-col justify-between">
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
                {/* <a href={`/claims/${displayClaim._id || displayClaim.claimId}`} className="text-sm font-semibold text-teal-600 hover:text-teal-800 transition-colors">
                    View Details
                </a> */}
            </div>
        </div>
    );
};

const Home = () => {
    const navigate = useNavigate();
    const [allClaims, setAllClaims] = useState([]);
    const [myDonationsQueue, setMyDonationsQueue] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    
    // --- NEW STATE ADDED ---
    const [calendarData, setCalendarData] = useState({}); // { year: [month events] }

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const { userId, displayName } = useMemo(() => {
        const user = currentUser;
        const id = user?._id || user?.id || user?.userId || user?.ehrmsCode || null;
        const name = user?.personalDetails?.fullName || user?.name || user?.ehrmsCode || 'Member';
        
        return { 
            userId: id, 
            displayName: name
        };
    }, [currentUser]);

    // Calculate total contribution from the calendar data
    const totalUserContribution = useMemo(() => {
        let totalDonations = 0;
        Object.values(calendarData).forEach(yearEvents => {
            yearEvents.forEach(event => {
                totalDonations += event?.donationsCompleted || 0;
            });
        });
        return totalDonations * DONATION_AMOUNT;
    }, [calendarData]);
    
    const getCategoryUrl = useCallback((categoryName) => {
        const encodedCategory = encodeURIComponent(categoryName);
        return `/claims-list?category=${encodedCategory}`;
    }, []);

    const fetchData = useCallback(async () => {
        try {
            setError(null);
            setLoading(true);
            
            // Fetch multiple data sources concurrently
            const [user, claimsData, donationQueueData, calendarEvents] = await Promise.all([
                getMe(),
                fetchAllClaims(), 
                getDonationQueue(),
                getDonationCalendar() // Fetch the calendar data
            ]);

            setCurrentUser(user);
            
            if (user) {
                setAllClaims(claimsData);
                setMyDonationsQueue(donationQueueData);
                console.log(claimsData)
                
                // Process and set calendar data
                const { calendar } = processCalendarData(calendarEvents);
                setCalendarData(calendar);

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

    const filterClaimsByType = (claims, type) => claims.filter(c => c.type === type);

    const upcomingClaims = allClaims.filter(c => c.status === 'Pending Verification');
    const ongoingClaims = allClaims.filter(c => c.status === 'Approved');

    if (loading) return <div className="text-center py-12 text-teal-600 font-semibold text-xl">Loading dashboard...</div>;
    if (error) return <div className="text-center py-12 text-red-600">{error}</div>;

    const CategoryWindowLinkWrapper = ({ categoryName, children }) => {
        const url = getCategoryUrl(categoryName);
        return (
            <a 
                href={url}
                className="w-full flex-none sm:w-1/3 p-2 group block"
            >
                <div className="transition-transform duration-300 transform group-hover:scale-[1.03] group-active:scale-[0.98] cursor-pointer">
                    {children}
                </div>
            </a>
        );
    };

    function CategorySliderWindow({ title, claims, emptyMessage }) {
        const categoryName = title; 

        return (
            <CategoryWindowLinkWrapper categoryName={categoryName}>
                <h3 className="text-lg font-semibold text-teal-800 mb-2">{title}</h3>
                <div className="h-64 overflow-y-hidden space-y-3 p-1 rounded-lg bg-white border border-gray-200 snap-y scroll-py-2">
                    {claims.length > 0 ? (
                        claims.slice(0, 3).map((claim) => ( // Show first few claims as preview
                            <div key={claim._id || claim.claimId} className="w-full">
                                <ClaimCard claim={claim} type="incoming" /> 
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex items-center justify-center p-4 rounded-lg bg-gray-50 text-gray-500 italic text-sm">
                            <p className="text-center">{emptyMessage}</p>
                        </div>
                    )}
                </div>
            </CategoryWindowLinkWrapper>
        );
    }
    
    function OutgoingDonationWindow({ title, donations, emptyMessage, claimTypeFilter }) {
        const filteredDonations = donations.filter(d => d.claimId?.type === claimTypeFilter);
        const categoryName = claimTypeFilter; 

        return (
            <CategoryWindowLinkWrapper categoryName={categoryName}>
                <h3 className="text-lg font-semibold text-teal-800 mb-2">{title}</h3>
                <div className="h-64 overflow-y-hidden space-y-3 p-1 rounded-lg bg-white border border-gray-200 snap-y scroll-py-2">
                    {filteredDonations.length > 0 ? (
                        filteredDonations.slice(0, 3).map((donation) => (
                            <div key={donation._id || donation.claimId._id} className="w-full">
                                <ClaimCard claim={donation} type="outgoing" />
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex items-center justify-center p-4 rounded-lg bg-gray-50 text-gray-500 italic text-sm">
                            <p className="text-center">{emptyMessage}</p>
                        </div>
                    )}
                </div>
            </CategoryWindowLinkWrapper>
        );
    }

    return (
        <div className="min-h-screen pb-12 lg:-m-6 -m-2">
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
                <div className="bg-white rounded-3xl p-6">
                    
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-teal-900 mb-4">ESCT Financial Overview</h2>
                        <div className="rounded-2xl bg-teal-700 text-white p-6 shadow-lg">
                            <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none]">
                                {/* Placeholder for total community contributions */}
                                {[2, 4, 5, 7, 8, 9, 5, 0].map((n, i) => (
                                    <div key={i} className="rounded-lg bg-teal-800/70 px-4 py-2 text-3xl font-bold flex-shrink-0 shadow-inner">
                                        {n}
                                    </div>
                                ))}
                            </div>
                            <p className="mt-4 text-lg font-medium">Total Donation on ESCT Till Date</p>
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm font-medium opacity-90">
                                <div className="flex justify-between"><span>Death After Service</span><span className="font-semibold">₹65,42,300</span></div>
                                <div className="flex justify-between"><span>Retirement</span><span className="font-semibold">₹87,35,650</span></div>
                                <div className="flex justify-between"><span>Death During Service</span><span className="font-semibold">₹45,20,100</span></div>
                                <div className="flex justify-between"><span>Other Help</span><span className="font-semibold">₹47,80,900</span></div>
                            </div>
                        </div>
                    </section>
                    
                    
                    
                    <hr className="my-8" />

                    <section className="mt-8">
                        <h2 className="text-2xl font-bold text-teal-900 mb-4">Ongoing Claims (Approved)</h2>
                        <div className="flex flex-col sm:flex-row -m-2">
                            <CategorySliderWindow
                                title="Retirement Farewell"
                                claims={filterClaimsByType(ongoingClaims, 'Retirement Farewell')}
                                emptyMessage="No ongoing retirement claims."
                            />
                            <CategorySliderWindow
                                title="Death After Service"
                                claims={filterClaimsByType(ongoingClaims, 'Death After Service')}
                                emptyMessage="No ongoing death after service claims."
                            />
                            <CategorySliderWindow
                                title="Death During Service"
                                claims={filterClaimsByType(ongoingClaims, 'Death During Service')}
                                emptyMessage="No ongoing death during service claims."
                            />
                        </div>
                    </section>

                    <hr className="my-8" />

                    <section className="mt-8">
                        <h2 className="text-2xl font-bold text-teal-900 mb-4">Current Claims (Benefeciaries)</h2>
                        <div className="flex flex-col sm:flex-row -m-2">
                            <CategorySliderWindow
                                title="Retirement Farewell"
                                claims={filterClaimsByType(ongoingClaims, 'Retirement Farewell')}
                                emptyMessage="No ongoing retirement claims."
                            />
                            <CategorySliderWindow
                                title="Death After Service"
                                claims={filterClaimsByType(ongoingClaims, 'Death After Service')}
                                emptyMessage="No ongoing death after service claims."
                            />
                            <CategorySliderWindow
                                title="Death During Service"
                                claims={filterClaimsByType(ongoingClaims, 'Death During Service')}
                                emptyMessage="No ongoing death during service claims."
                            />
                        </div>
                    </section>
                    
                    <hr className="my-8" />
                    <section className="mt-8">
                        <h2 className="text-2xl font-bold text-teal-900 mb-4">Upcoming Claims (Pending Verification)</h2>
                        <div className="flex flex-col sm:flex-row -m-2">
                            <CategorySliderWindow
                                title="Retirement Farewell"
                                claims={filterClaimsByType(upcomingClaims, 'Retirement Farewell')}
                                emptyMessage="No pending retirement claims."
                            />
                            <CategorySliderWindow
                                title="Death After Service"
                                claims={filterClaimsByType(upcomingClaims, 'Death After Service')}
                                emptyMessage="No pending death after service claims."
                            />
                            <CategorySliderWindow
                                title="Death During Service"
                                claims={filterClaimsByType(upcomingClaims, "Death During Service")}
                                emptyMessage="No ongoing death during service claims."
                            />
                        </div>
                    </section>
                    
                    <hr className="my-8" />
                    <section className="mt-8">
                        <h2 className="text-2xl font-bold text-teal-900 mb-4">My Outgoing Donations (Queue)</h2>
                        <div className="flex flex-col sm:flex-row -m-2">
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
                    <section className="mt-8">
                        <h2 className="text-2xl font-bold text-teal-900 mb-4">Gallery</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <img key={i} className="rounded-2xl h-48 w-full object-cover shadow-md transition-transform duration-300 hover:scale-[1.02] cursor-pointer" src={`https://picsum.photos/seed/${i}/600/400`} alt={`Gallery image ${i}`} />
                            ))}
                        </div>
                    </section>
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
                    <hr className="my-8" />
                    <section className="mt-8">
                        <h2 className="text-2xl font-bold text-teal-900 mb-4">Know Your Contribution</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="rounded-2xl bg-teal-600 text-white p-6 shadow-xl text-center mb-6 md:col-span-1">
                                <p className="text-base font-medium opacity-90">Your Total Contribution to the Community</p>
                                <p className="mt-2 text-4xl sm:text-5xl font-extrabold">
                                    {loading ? (
                                        <span className="inline-block w-3/4 h-10 sm:h-12 bg-teal-700 rounded-full animate-pulse"></span>
                                    ) : (
                                        `₹${totalUserContribution.toLocaleString('en-IN')}`
                                    )}
                                </p>
                                <button 
                                    onClick={() => navigate('/my-donations')}
                                    className="mt-4 inline-block px-6 py-2 bg-white text-teal-600 font-semibold rounded-full shadow-md hover:bg-teal-50 transition-colors"
                                >
                                    View All Donations
                                </button>
                            </div>

                            {/* Calendar Report (col-span-2 or 3) */}
                            <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 md:col-span-2">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Donation History Compliance</h3>
                                {loading ? (
                                    <div className="text-center text-gray-500 py-6">Loading calendar...</div>
                                ) : error ? (
                                    <div className="text-red-600 text-center text-sm py-4">{error}</div>
                                ) : Object.keys(calendarData).length === 0 ? (
                                    <div className="text-gray-500 text-center text-sm py-4">No donation history found since joining.</div>
                                ) : (
                                    <div className="space-y-4">
                                        {/* Render each year */}
                                        {Object.keys(calendarData).sort((a, b) => b - a).map(year => (
                                            <div key={year}>
                                                <h4 className="text-sm font-bold text-gray-700 mb-2">{year}</h4>
                                                <div className="grid grid-cols-6 sm:grid-cols-12 gap-1 sm:gap-2">
                                                    {/* Render 12 months for the current year */}
                                                    {calendarData[year].map((event, index) => (
                                                        <MonthBox 
                                                            key={index}
                                                            month={MONTH_NAMES[index]}
                                                            // Pass 'COMPLETED', 'PARTIAL', 'PENDING' or null
                                                            status={event ? event.status : 'PENDING'} 
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Home;
