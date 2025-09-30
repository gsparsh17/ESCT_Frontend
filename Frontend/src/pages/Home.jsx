import { useEffect, useState, useMemo, useCallback, useRef } from 'react'; // useRef is no longer used for carousels

import { fetchAllClaims } from '../lib/api/claims'; 
import { getDonationQueue, getMe } from '../lib/api/donations'; 
import { getDonationCalendar } from '../lib/api/calendar'; // Import the calendar API
import { useNavigate, Link } from 'react-router-dom';

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
    { id: 4, title: 'Volunteer Drive This Weekend', summary: 'Join fellow members this weekend for a community volunteer drive. All skill levels welcome.', image: 'https://picsum.photos/seed/news4/600/400' },
    { id: 5, title: 'Health Camp Success', summary: 'Our free health camp provided checkups to over 300 members. See the full report and photos.', image: 'https://picsum.photos/seed/news5/600/400' },
    { id: 6, title: 'Policy Update: Claim Window', summary: 'A small update to claim submission timelines has been published. Please review the guidelines.', image: 'https://picsum.photos/seed/news6/600/400' },
];

const staticTestimonials = [
    {
        id: 1,
        name: 'R. K. Sharma',
        role: 'Retired Member (Batch 1985)',
        comment: "The ESCT team made my retirement farewell so special. The support from my colleagues was overwhelming. Thank you for everything!",
        image: 'https://picsum.photos/seed/person1/100/100'
    },
    {
        id: 2,
        name: 'Anjali P.',
        role: 'Member',
        comment: "When my family faced a medical emergency, ESCT was our first line of support. The financial aid was processed quickly and saved us a lot of stress.",
        image: 'https://picsum.photos/seed/person2/100/100'
    },
    {
        id: 3,
        name: 'Sunita Devi',
        role: 'Beneficiary',
        comment: "After my husband passed away, I was lost. The ESCT community helped me navigate the claims and provided incredible support for my family.",
        image: 'https://picsum.photos/seed/person3/100/100'
    }
];

staticTestimonials.push(
    {
        id: 4,
        name: 'Arjun S.',
        role: 'Member',
        comment: 'A very helpful organisation. The donation process was transparent and quick.',
        image: 'https://picsum.photos/seed/person4/100/100'
    },
    {
        id: 5,
        name: 'Lata M.',
        role: 'Volunteer',
        comment: 'Volunteering with ESCT has been a meaningful experience for me and my family.',
        image: 'https://picsum.photos/seed/person5/100/100'
    },
    {
        id: 6,
        name: 'Vikram R.',
        role: 'Beneficiary',
        comment: 'Support received was timely and helped us during a tough time.',
        image: 'https://picsum.photos/seed/person6/100/100'
    }
);

// This is the data for the gallery
const galleryImages = [
    { id: 1, seed: 'gallery1' },
    { id: 2, seed: 'gallery2' },
    { id: 3, seed: 'gallery3' },
    { id: 4, seed: 'gallery4' },
    { id: 5, seed: 'gallery5' },
    { id: 6, seed: 'gallery6' },
    { id: 7, seed: 'gallery7' },
    { id: 8, seed: 'gallery8' },
    { id: 9, seed: 'gallery9' },
    { id: 10, seed: 'gallery10' },
];


const ClaimCard = ({ claim, type }) => {
    const isOutgoing = type === 'outgoing';
    const displayClaim = isOutgoing ? claim.claimId || claim : claim;
    // Assuming monthly donation amount is stored on the queue item or is fixed at 200
    const donationAmount = isOutgoing ? claim.donationId?.amount || DONATION_AMOUNT : null;

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

    return (
        <div className="flex p-4 w-full h-full rounded-2xl bg-white border border-gray-100 shadow-md flex-row items-center justify-between space-x-3">
           <div className='w-1/3'>
           {displayClaim.beneficiary.photoUrl && (
                                <img
                                    src={displayClaim.beneficiary.photoUrl}
                                    alt={displayClaim.beneficiary.personalDetails?.fullName || 'Beneficiary'}
                                    className="rounded-xl object-cover border border-gray-200"
                                />
                            )}
           </div>
            <div className='w-2/3'>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${categoryClass(displayClaim.type || displayClaim.category)}`}>
                    {displayClaim.type || displayClaim.category}
                </span>
                <h4 className="mt-2 text-lg font-semibold text-teal-900 truncate">
                    {displayClaim.title || `Donation for ${displayClaim.type} Claim`}
                </h4>

                {!isOutgoing && displayClaim.beneficiary && (
                    <div className="mt-4 border-t pt-3">
                        <h5 className="text-sm font-semibold text-gray-700 mb-2">Beneficiary Details</h5>
                        <div className="flex items-center space-x-3">
                            <div className="text-sm text-gray-600">
                                <p className="text-lg text-gray-800">{displayClaim.beneficiary.personalDetails?.fullName}</p>
                                {/* Bank Details */}
                                {displayClaim.beneficiary.bankDetails && (
                                    <>
                                        <p>A/C: {displayClaim.beneficiary.bankDetails.accountNumber}</p>
                                        <p>IFSC: {displayClaim.beneficiary.bankDetails.ifscCode}</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
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
            
        </div>
    );
};


const ClaimCard2 = ({ claim, type }) => {
    const isOutgoing = type === 'outgoing';
    const displayClaim = isOutgoing ? claim.claimId || claim : claim;
    // Assuming monthly donation amount is stored on the queue item or is fixed at 200
    const donationAmount = isOutgoing ? claim.donationId?.amount || 200 : null; // Changed DONATION_AMOUNT to 200 for example

    const claimType = displayClaim.type || displayClaim.category;
    const isDeathClaim = claimType === 'Death During Service' || claimType === 'Death After Service';
    const isFarewellClaim = claimType === 'Retirement Farewell';

    // Helper for category specific background colors/text colors
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

    return (
        <div className="flex p-4 w-full h-full rounded-2xl bg-white border border-gray-100 shadow-md flex-row items-center justify-between space-x-4">
            
            {/* Beneficiary Photo Section */}
            <div className="w-1/2 flex-shrink-0 relative aspect-square flex-col items-center justify-center"> {/* Added aspect-square for consistent photo sizing */}
                {!isOutgoing && displayClaim.beneficiary && displayClaim.beneficiary.photoUrl && (
                    <>
                        {/* Base Photo */}
                        <img
                            src={displayClaim.beneficiary.photoUrl}
                            alt={displayClaim.beneficiary.personalDetails?.fullName || 'Beneficiary'}
                            className={`w-full h-full object-cover rounded-xl ${isDeathClaim ? '' : isFarewellClaim ? 'rounded-full' : ''}`}
                        />
                        {isDeathClaim && (
                            <>
                                <img
                                    src="/images/garland.png" // Adjust path as needed
                                    alt="Garland"
                                    className="absolute inset-0 -top-5 w-full h-full object-contain z-10"
                                />
                            </>
                        )}

                        {isFarewellClaim && (
                            <>
                                <img
                                    src="/images/party-popper.png" // Adjust path as needed
                                    alt="Party Popper"
                                    className="absolute top-28 left-0 w-1/2 h-auto object-contain z-10 transform translate-x-1 -translate-y-1" // Position bottom-left
                                />
                            </>
                        )}
                    </>
                )}
                        {isDeathClaim && (
                                <div className="flex flex-col items-center mt-2 justify-center z-20 rounded-xl">
                                    <p className="text-red text-sm font-bold px-4 py-1 rounded-lg tracking-wider">
                                        ॐ शांति
                                    </p>
                                    <p className="text-gray-600 bg-teal-100/70 text-xs rounded-md px-2 py-0.5">May their soul rest in peace.</p>
                                </div>
                        )}
                        {isFarewellClaim && (
                                <div className="flex flex-col items-center justify-center z-20 rounded-full text-center"> {/* Ensure text is visible over the round photo */}
                                    <p className="text-yellow-600 text-sm font-bold px-3 py-1 rounded-full mt-auto mb-2">
                                         शुभकामनाएँ!
                                    </p>
                                    <p className="text-yellow-900 text-xs text-center bg-yellow-100/70 rounded-md px-2 py-0.5">Wishing a joyful retirement!</p>
                                </div>
                        )}
            </div>

            <div className="w-1/2 flex flex-col justify-between h-full">
                <div>
                    {/* Category Tag */}
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${categoryClass(claimType)}`}>
                        {claimType}
                    </span>
                    {/* Claim Title */}
                    <h4 className="mt-2 text-lg font-bold text-teal-900 truncate">
                        {displayClaim.title || `Donation for ${claimType} Claim`}
                    </h4>

                    {/* Beneficiary Name Only */}
                    {!isOutgoing && displayClaim.beneficiary && (
                        <div className="mt-2">
                            <p className="text-sm text-gray-700 font-medium">
                                Beneficiary: 
                                <span className="ml-1 text-base text-gray-800 font-bold">{displayClaim.beneficiary.personalDetails?.fullName}</span>
                            </p>
                        </div>
                    )}
                </div>

                {/* Donation Amount */}
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
                </div>
            </div>
        </div>
    );
};

// --- THIS IS THE NEW CSS FOR THE CAROUSELS ---
// You should move this to your global CSS file (like index.css)
const CarouselStyles = () => (
    <style>{`
        /* This is the keyframe animation. 
          It moves the content from 0% to -50% (halfway), creating the loop.
        */
        @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }

        /* These are the animation classes. 
          I've given each a different duration (speed).
        */
        .animate-scroll-gallery {
            animation: scroll 60s linear infinite;
        }
        .animate-scroll-news {
            animation: scroll 45s linear infinite;
        }
        .animate-scroll-testimonials {
            animation: scroll 50s linear infinite;
        }

        /* This pauses the animation on hover. 
          This is applied to the track.
        */
        .pause-on-hover:hover {
            animation-play-state: paused;
        }

        /* This is the FIX to "remove the slider".
          It hides the scrollbar on all major browsers.
        */
        .carousel-container::-webkit-scrollbar { 
            display: none; /* Safari and Chrome */
        }
        .carousel-container { 
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
        }
        /* Vertical auto-scroll keyframes */
        @keyframes scroll-vertical {
            0% { transform: translateY(0); }
            100% { transform: translateY(-50%); }
        }

        /* Vertical animation classes */
        .animate-scroll-vertical-fast { animation: scroll-vertical 18s linear infinite; }
        .animate-scroll-vertical { animation: scroll-vertical 30s linear infinite; }
        .animate-scroll-vertical-slow { animation: scroll-vertical 45s linear infinite; }

        /* Track settings for vertical scrollers */
        .vertical-scroller-track { display: flex; flex-direction: column; }
        .pause-on-hover:hover { animation-play-state: paused; }
    `}</style>
);

// Simple vertical scroller wrapper: duplicates children and applies vertical animation.
const VerticalScroller = ({ children, speed = 'normal' }) => {
    // speed: 'fast' | 'normal' | 'slow' or a number (seconds)
    const className = typeof speed === 'number'
        ? ''
        : speed === 'fast' ? 'animate-scroll-vertical-fast' : speed === 'slow' ? 'animate-scroll-vertical-slow' : 'animate-scroll-vertical';

    return (
        <div className="h-64 overflow-hidden rounded-lg">
            <div className={`vertical-scroller-track pause-on-hover ${className}`} style={{ willChange: 'transform' }}>
                {children}
                {/* duplicate for seamless loop */}
                {children}
            </div>
        </div>
    );
};


const Home = () => {
    const navigate = useNavigate();
    // Click handler used by header Link to navigate to profile. We keep it here so Link can be used on <a> or other elements.
    const handleLinkClick = (e) => {
        // allow Link to work normally for accessibility; preventDefault only if anchor used elsewhere
        if (e && e.preventDefault) e.preventDefault();
        navigate('/profile');
    };
    const [allClaims, setAllClaims] = useState([]);
    const [myDonationsQueue, setMyDonationsQueue] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    
    // --- NEW STATE ADDED ---
    const [calendarData, setCalendarData] = useState({}); // { year: [month events] }

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const filterClaimsByType = (claims, type) => claims.filter(c => c.type === type);

    
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

    // --- ADD THIS NEW useMemo HOOK ---
    const claimCounts = useMemo(() => {
        if (!allClaims) {
            return { retirement: 0, deathAfter: 0, deathDuring: 0, medical: 0, marriage: 0, total: 0 };
        }
        
        // Use the existing filter function to get the length of each category
        return {
            retirement: filterClaimsByType(allClaims, 'Retirement Farewell').length,
            deathAfter: filterClaimsByType(allClaims, 'Death After Service').length,
            deathDuring: filterClaimsByType(allClaims, 'Death During Service').length,
            medical: filterClaimsByType(allClaims, 'Medical Claim').length,
            marriage: filterClaimsByType(allClaims, "Daughter's Marriage").length,
            total: allClaims.length
        };
    }, [allClaims]); // This recalculates only when allClaims changes

    // --- ADD THIS NEW useMemo HOOK ---
    const memberCategoryCounts = useMemo(() => {
        if (!allClaims) {
            return { retirement: 0, deathAfter: 0, deathDuring: 0, medical: 0, marriage: 0 };
        }

        // Use a Map to store Sets of unique beneficiary IDs for each category
        const categoryMap = new Map();

        allClaims.forEach(claim => {
            const type = claim.type;
            
            // We must assume a unique ID exists on the beneficiary object.
            // Based on your 'getMe' logic, '_id' or 'ehrmsCode' are likely.
            const beneficiaryId = claim.beneficiary?._id || claim.beneficiary?.ehrmsCode;

            // Skip if there's no type or no unique ID to count
            if (!type || !beneficiaryId) return;

            // If the category isn't in the map, add it with a new Set
            if (!categoryMap.has(type)) {
                categoryMap.set(type, new Set());
            }
            
            // Add the beneficiary's ID to the Set for that category
            // A Set only stores unique values, so one member is only counted once.
            categoryMap.get(type).add(beneficiaryId);
        });

        // Helper function to get the final size (count) from the Set
        const getCount = (category) => categoryMap.get(category)?.size || 0;

        return {
            retirement: getCount('Retirement Farewell'),
            deathAfter: getCount('Death After Service'),
            deathDuring: getCount('Death During Service'),
            medical: getCount('Medical Claim'),
            marriage: getCount("Daughter's Marriage"),
        };
    }, [allClaims]); // This recalculates only when allClaims changes
    
    const getCategoryUrl = useCallback((categoryName) => {
        const encodedCategory = encodeURIComponent(categoryName);
        return `/claims-list?category=${encodedCategory}`;
    }, []);

    // --- CAROUSEL LOGIC IS GONE FROM HERE ---
    // No more `useRef` or `useAutoScroll` needed.

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

    const upcomingClaims = allClaims.filter(c => c.status === 'Pending Verification');
    const ongoingClaims = allClaims.filter(c => c.status === 'Approved');

    if (loading) return <div className="text-center py-12 text-teal-600 font-semibold text-xl">Loading dashboard...</div>;
    if (error) return <div className="text-center py-12 text-red-600">{error}</div>;

    const CategoryWindowLinkWrapper = ({ categoryName, children, disableLink = false }) => {
        const url = getCategoryUrl(categoryName);

        const content = (
            <div className="transition-transform duration-300 transform group-hover:scale-[1.03] group-active:scale-[0.98]">
                {children}
            </div>
        );

        if (disableLink) {
            return (
                <div className="w-full flex-none sm:w-1/3 p-2 block pointer-events-none" aria-disabled="true">
                    {content}
                </div>
            );
        }

        return (
            <a
                href={url}
                className="w-full flex-none sm:w-1/3 p-2 group block"
            >
                {content}
            </a>
        );
    };

    function CategorySliderWindow({ title, claims, emptyMessage, disableLink = false }) {
        const categoryName = title; 

        return (
            <CategoryWindowLinkWrapper categoryName={categoryName} disableLink={disableLink}>
                <h3 className="text-lg font-semibold text-teal-800 mb-2">{title}</h3>
                {/* Vertical slider: auto-scroll when multiple items */}
                {claims.length > 1 ? (
                    <VerticalScroller>
                        {claims.map((claim) => (
                            <div key={claim._id || claim.claimId} className="w-full p-1">
                                <div className="bg-white rounded-lg p-2 border border-gray-100 shadow-sm">
                                    <ClaimCard claim={claim} type="incoming" />
                                </div>
                            </div>
                        ))}
                    </VerticalScroller>
                ) : (
                    <div className="h-64 overflow-y-auto custom-scrollbar space-y-3 p-1 rounded-lg bg-white border border-gray-200 snap-y scroll-py-2">
                        {claims.length > 0 ? (
                            claims.slice(0, 3).map((claim) => (
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
                )}
            </CategoryWindowLinkWrapper>
        );
    }

    function CategorySliderWindow2({ title, claims, emptyMessage, disableLink = false }) {
        const categoryName = title; 

        return (
            <CategoryWindowLinkWrapper categoryName={categoryName} disableLink={disableLink}>
                <h3 className="text-lg font-semibold text-teal-800 mb-2">{title}</h3>
                {claims.length > 1 ? (
                    <VerticalScroller>
                        {claims.map((claim) => (
                            <div key={claim._id || claim.claimId} className="w-full p-1">
                                <div className="bg-white rounded-lg p-2 border border-gray-100 shadow-sm">
                                    <ClaimCard2 claim={claim} type="incoming" />
                                </div>
                            </div>
                        ))}
                    </VerticalScroller>
                ) : (
                    <div className="h-64 overflow-y-auto custom-scrollbar space-y-3 p-1 rounded-lg bg-white border border-gray-200 snap-y scroll-py-2">
                        {claims.length > 0 ? (
                            claims.slice(0, 3).map((claim) => (
                                <div key={claim._id || claim.claimId} className="w-full">
                                    <ClaimCard2 claim={claim} type="incoming" /> 
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex items-center justify-center p-4 rounded-lg bg-gray-50 text-gray-500 italic text-sm">
                                <p className="text-center">{emptyMessage}</p>
                            </div>
                        )}
                    </div>
                )}
            </CategoryWindowLinkWrapper>
        );
    }
    
    function OutgoingDonationWindow({ title, donations, emptyMessage, claimTypeFilter }) {
        const filteredDonations = donations.filter(d => d.claimId?.type === claimTypeFilter);
        const categoryName = claimTypeFilter; 

        return (
            <CategoryWindowLinkWrapper categoryName={categoryName}>
                <h3 className="text-lg font-semibold text-teal-800 mb-2">{title}</h3>
                <div className="h-64 overflow-y-auto custom-scrollbar space-y-3 p-1 rounded-lg bg-white border border-gray-200 snap-y scroll-py-2">
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
            {/* --- NEW CSS ADDED HERE --- */}
            <CarouselStyles />

            <div className="rounded-b-3xl bg-gradient-to-br from-teal-500 to-teal-700 text-white p-6 shadow-lg">
                {/* Header is clickable - navigates to Profile */}
                <Link to="/profile" onClick={handleLinkClick} className="max-w-7xl mx-auto flex items-center gap-4 no-underline">
                    <img
                        src={currentUser?.photoUrl || 'https://placehold.co/100x100/5eead4/115e59?text=JD'}
                        alt={currentUser?.personalDetails?.fullName || displayName || 'avatar'}
                        className="h-16 w-16 rounded-full border-4 border-white/40 shadow-lg object-cover"
                    />
                    <div>
                        <p className="text-lg opacity-90 font-medium">Welcome</p>
                        <p className="text-3xl font-extrabold">{currentUser?.personalDetails?.fullName || displayName}</p>
                        <p className="text-xl my-1">ESCT ID: {currentUser?.userId || currentUser?.ehrmsCode || 'ESCT00000003'}</p>
                    </div>
                </Link>
            </div>
            
            <div className="max-w-7xl mx-auto mt-6 px-4">
                <div className="bg-white rounded-3xl p-6">
                    
                    <section className="mb-8">
    <h2 className="text-2xl font-extrabold text-teal-900 mb-4">
        Our Collective Impact: ESCT Funds Disbursed
    </h2>
    <div className="rounded-3xl bg-teal-700 text-white p-6 shadow-xl transform hover:scale-[1.01] transition-transform duration-300 ease-out">
        
        <p className="text-lg font-semibold opacity-80 uppercase tracking-wider mb-2">Total No. of Donations Till Date</p>
        <p className="text-center text-4xl sm:text-4xl font-extrabold mt-3">
            <span className="text-white text-opacity-90">1,78,950</span>
        </p>

        <div className="mt-8 pt-4 border-t border-teal-500">
            <p className="text-lg font-semibold mb-3">Breakdown by Claim Type</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-base font-medium">
                <div className="flex justify-between items-center bg-teal-800/50 p-2 rounded-lg">
                    <span>Death After Service</span>
                    <span className="font-bold text-lg text-teal-200">42,300</span>
                </div>
                <div className="flex justify-between items-center bg-teal-800/50 p-2 rounded-lg">
                    <span>Retirement Farewell</span>
                    <span className="font-bold text-lg text-teal-200">35,650</span>
                </div>
                <div className="flex justify-between items-center bg-teal-800/50 p-2 rounded-lg">
                    <span>Death During Service</span>
                    <span className="font-bold text-lg text-teal-200">20,100</span>
                </div>
                <div className="flex justify-between items-center bg-teal-800/50 p-2 rounded-lg">
                    <span>Other Help Claims</span>
                    <span className="font-bold text-lg text-teal-200">28,900</span>
                </div>
            </div>
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
                            <CategorySliderWindow2
                                title="Retirement Farewell"
                                claims={filterClaimsByType(ongoingClaims, 'Retirement Farewell')}
                                emptyMessage="No ongoing retirement claims."
                                disableLink={true}
                            />
                            <CategorySliderWindow2
                                title="Death After Service"
                                claims={filterClaimsByType(ongoingClaims, 'Death After Service')}
                                emptyMessage="No ongoing death after service claims."
                                disableLink={true}
                            />
                            <CategorySliderWindow2
                                title="Death During Service"
                                claims={filterClaimsByType(ongoingClaims, 'Death During Service')}
                                emptyMessage="No ongoing death during service claims."
                                disableLink={true}
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
                                disableLink={true}
                            />
                            <CategorySliderWindow
                                title="Death After Service"
                                claims={filterClaimsByType(upcomingClaims, 'Death After Service')}
                                emptyMessage="No pending death after service claims."
                                disableLink={true}
                            />
                            <CategorySliderWindow
                                title="Death During Service"
                                claims={filterClaimsByType(upcomingClaims, "Death During Service")}
                                emptyMessage="No ongoing death during service claims."
                                disableLink={true}
                            />
                        </div>
                    </section>
                    
                    <hr className="my-8" />
                    <section className="mt-8">
    <h2 className="text-2xl font-bold text-teal-900 mb-6">Claims in each Category</h2>
    
    <div className="grid grid-cols-5 gap-3">
    
        <div className="text-center">
            <h3 className="text-xs font-semibold text-teal-800 mb-1 h-8" title="Retirement Farewell">
                Retirement Farewell
            </h3>
            <div className="p-3 rounded-2xl shadow-lg border bg-teal-100 text-teal-800 border-teal-300 transform transition-transform duration-300 hover:scale-105">
                <div className="flex items-center justify-center space-x-2">
                    <div className="flex-shrink-0 opacity-70">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-2xl font-bold">{claimCounts.retirement}</p>
                </div>
            </div>
        </div>

        <div className="text-center">
            <h3 className="text-xs font-semibold text-teal-800 mb-1 h-8" title="Death During Service">
                Death During Service
            </h3>
            <div className="p-3 rounded-2xl shadow-lg border bg-teal-100 text-teal-800 border-teal-300 transform transition-transform duration-300 hover:scale-105">
                <div className="flex items-center justify-center space-x-2">
                    <div className="flex-shrink-0 opacity-70">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.876c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <p className="text-2xl font-bold">{claimCounts.deathDuring}</p>
                </div>
            </div>
        </div>

        <div className="text-center">
            <h3 className="text-xs font-semibold text-teal-800 mb-1 h-8" title="Death After Service">
                Death After Service
            </h3>
            <div className="p-3 rounded-2xl shadow-lg border bg-teal-100 text-teal-800 border-teal-300 transform transition-transform duration-300 hover:scale-105">
                <div className="flex items-center justify-center space-x-2">
                    <div className="flex-shrink-0 opacity-70">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <p className="text-2xl font-bold">{claimCounts.deathAfter}</p>
                </div>
            </div>
        </div>

        <div className="text-center">
            <h3 className="text-xs font-semibold text-teal-800 mb-1 h-8" title="Daughter's Marriage">
                Daughter's Marriage
            </h3>
            <div className="p-3 rounded-2xl shadow-lg border bg-teal-100 text-teal-800 border-teal-300 transform transition-transform duration-300 hover:scale-105">
                <div className="flex items-center justify-center space-x-2">
                    <div className="flex-shrink-0 opacity-70">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1014.625 7.5H9.375A2.625 2.625 0 1012 4.875zM21 11.25H3v-3.75a.75.75 0 01.75-.75h16.5a.75.75 0 01.75.75v3.75z" />
                        </svg>
                    </div>
                    <p className="text-2xl font-bold">{claimCounts.marriage}</p>
                </div>
            </div>
        </div>

        <div className="text-center">
            <h3 className="text-xs font-semibold text-teal-800 mb-1 h-8" title="Medical Claim">
                Medical Claim
            </h3>
            <div className="p-3 rounded-2xl shadow-lg border bg-teal-100 text-teal-800 border-teal-300 transform transition-transform duration-300 hover:scale-105">
                <div className="flex items-center justify-center space-x-2">
                    <div className="flex-shrink-0 opacity-70">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <p className="text-2xl font-bold">{claimCounts.medical}</p>
                </div>
            </div>
        </div>
        
    </div>
</section>
<hr className="my-8" />
<section className="mt-8">
    <h2 className="text-2xl font-bold text-teal-900 mb-6">Members at each Category</h2>
    
    <div className="grid grid-cols-5 gap-3">
    
        <div className="text-center">
            <h3 className="text-xs font-semibold text-teal-800 mb-1 h-8" title="Retirement Farewell">
                Retirement Farewell
            </h3>
            <div className="p-3 rounded-2xl shadow-lg border bg-teal-100 text-teal-800 border-teal-300 transform transition-transform duration-300 hover:scale-105">
                <div className="flex items-center justify-center space-x-2">
                    <div className="flex-shrink-0 opacity-70">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-2xl font-bold">{memberCategoryCounts.retirement}</p>
                </div>
            </div>
        </div>

        <div className="text-center">
            <h3 className="text-xs font-semibold text-teal-800 mb-1 h-8" title="Death During Service">
                Death During Service
            </h3>
            <div className="p-3 rounded-2xl shadow-lg border bg-teal-100 text-teal-800 border-teal-300 transform transition-transform duration-300 hover:scale-105">
                <div className="flex items-center justify-center space-x-2">
                    <div className="flex-shrink-0 opacity-70">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.876c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <p className="text-2xl font-bold">{memberCategoryCounts.deathDuring}</p>
                </div>
            </div>
        </div>

        <div className="text-center">
            <h3 className="text-xs font-semibold text-teal-800 mb-1 h-8" title="Death After Service">
                Death After Service
            </h3>
            <div className="p-3 rounded-2xl shadow-lg border bg-teal-100 text-teal-800 border-teal-300 transform transition-transform duration-300 hover:scale-105">
                <div className="flex items-center justify-center space-x-2">
                    <div className="flex-shrink-0 opacity-70">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <p className="text-2xl font-bold">{memberCategoryCounts.deathAfter}</p>
                </div>
            </div>
        </div>

        <div className="text-center">
            <h3 className="text-xs font-semibold text-teal-800 mb-1 h-8" title="Daughter's Marriage">
                Daughter's Marriage
            </h3>
            <div className="p-3 rounded-2xl shadow-lg border bg-teal-100 text-teal-800 border-teal-300 transform transition-transform duration-300 hover:scale-105">
                <div className="flex items-center justify-center space-x-2">
                    <div className="flex-shrink-0 opacity-70">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1014.625 7.5H9.375A2.625 2.625 0 1012 4.875zM21 11.25H3v-3.75a.75.75 0 01.75-.75h16.5a.75.75 0 01.75.75v3.75z" />
                        </svg>
                    </div>
                    <p className="text-2xl font-bold">{memberCategoryCounts.marriage}</p>
                </div>
            </div>
        </div>

        <div className="text-center">
            <h3 className="text-xs font-semibold text-teal-800 mb-1 h-8" title="Medical Claim">
                Medical Claim
            </h3>
            <div className="p-3 rounded-2xl shadow-lg border bg-teal-100 text-teal-800 border-teal-300 transform transition-transform duration-300 hover:scale-105">
                <div className="flex items-center justify-center space-x-2">
                    <div className="flex-shrink-0 opacity-70">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <p className="text-2xl font-bold">{memberCategoryCounts.medical}</p>
                </div>
            </div>
        </div>
        
    </div>
</section>
<hr className="my-8" />
                    
                    {/* --- GALLERY CAROUSEL (NEW CSS METHOD) --- */}
                    <section className="mt-8">
                        <h2 className="text-2xl font-bold text-teal-900 mb-4">Gallery</h2>
                        {/* 1. Wrapper hides overflow and the scrollbar (no plugin needed) */}
                        <div
                            className="overflow-x-hidden carousel-container py-2"
                            aria-label="Gallery carousel"
                        >
                            {/* 2. Track uses flex, w-max, and applies the animation */}
                            <div className="flex w-max space-x-4 animate-scroll-gallery pause-on-hover">
                                {/* 3. Original Items */}
                                {galleryImages.map((img) => (
                                    <div key={img.id} className="flex-shrink-0 w-72">
                                        <a href="#" onClick={(e) => e.preventDefault()} title={`View Gallery Image ${img.id}`}>
                                            <img className="rounded-2xl h-48 w-full object-cover shadow-md transition-transform duration-300 hover:scale-[1.02] cursor-pointer" src={`https://picsum.photos/seed/${img.seed}/600/400`} alt={`Gallery image ${img.id}`} />
                                        </a>
                                    </div>
                                ))}
                                {/* 4. DUPLICATE Items (for seamless loop) */}
                                {galleryImages.map((img) => (
                                    <div key={`${img.id}-dup`} aria-hidden="true" className="flex-shrink-0 w-72">
                                        <a href="#" onClick={(e) => e.preventDefault()} title={`View Gallery Image ${img.id}`} tabIndex={-1}>
                                            <img className="rounded-2xl h-48 w-full object-cover shadow-md transition-transform duration-300 hover:scale-[1.02] cursor-pointer" src={`https://picsum.photos/seed/${img.seed}/600/400`} alt={`Gallery image ${img.id}`} />
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                    
                    {/* --- LATEST NEWS CAROUSEL (NEW CSS METHOD) --- */}
                    <section className="mt-8">
                        <h2 className="text-2xl font-bold text-teal-900 mb-4">Latest News & Blog</h2>
                        {/* 1. Wrapper */}
                        <div className="overflow-x-hidden carousel-container py-2">
                            {/* 2. Track */}
                            <div className="flex w-max space-x-4 animate-scroll-news pause-on-hover">
                                {/* 3. Original Items */}
                                {staticNews.map(item => (
                                    <div key={item.id} className="flex-shrink-0 w-80 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
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
                                {/* 4. DUPLICATE Items */}
                                {staticNews.map(item => (
                                    <div key={`${item.id}-dup`} aria-hidden="true" className="flex-shrink-0 w-80 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                                        <img src={item.image} alt={item.title} className="w-full h-40 object-cover" />
                                        <div className="p-4">
                                            <h3 className="text-lg font-bold text-teal-900 truncate">{item.title}</h3>
                                            <p className="mt-2 text-sm text-gray-600 line-clamp-2">{item.summary}</p>
                                            <a href="#" tabIndex={-1} className="mt-3 inline-block text-sm font-semibold text-teal-600 hover:text-teal-800 transition-colors">
                                                Read more →
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                    
<hr className="my-8" />
{/* --- TESTIMONIALS CAROUSEL (NEW CSS METHOD) --- */}
<section className="mt-8">
    <h2 className="text-2xl font-bold text-teal-900 mb-6">Testimonials</h2>
    {/* 1. Wrapper */}
    <div className="overflow-x-hidden carousel-container py-2">
        {/* 2. Track */}
        <div className="flex w-max space-x-4 animate-scroll-testimonials pause-on-hover">
            {/* 3. Original Items */}
            {staticTestimonials.map(item => (
                <div key={item.id} className="flex-shrink-0 w-80 bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col transition-transform duration-300">
                    <svg className="w-10 h-10 text-teal-400 mb-4 flex-shrink-0" fill="currentColor" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13,10H8.5C7.3,10,6.9,10.2,6.5,11.2C6.1,12.2,6,13.8,6,16v6h7V10z M26,10h-4.5c-1.2,0-1.6,0.2-2,1.2c-0.4,1-0.5,2.6-0.5,4.8v6h7V10z"/>
                    </svg>
                    <p className="text-gray-700 italic text-lg mb-6 flex-grow">"{item.comment}"</p>
                    <div className="flex items-center mt-auto">
                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-full object-cover border-2 border-teal-100" />
                        <div className="ml-4">
                            <h4 className="font-bold text-teal-900">{item.name}</h4>
                            <p className="text-sm text-gray-500">{item.role}</p>
                        </div>
                    </div>
                </div>
            ))}
            {/* 4. DUPLICATE Items */}
            {staticTestimonials.map(item => (
                <div key={`${item.id}-dup`} aria-hidden="true" className="flex-shrink-0 w-80 bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col transition-transform duration-300">
                    <svg className="w-10 h-10 text-teal-400 mb-4 flex-shrink-0" fill="currentColor" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13,10H8.5C7.3,10,6.9,10.2,6.5,11.2C6.1,12.2,6,13.8,6,16v6h7V10z M26,10h-4.5c-1.2,0-1.6,0.2-2,1.2c-0.4,1-0.5,2.6-0.5,4.8v6h7V10z"/>
                    </svg>
                    <p className="text-gray-700 italic text-lg mb-6 flex-grow">"{item.comment}"</p>
                    <div className="flex items-center mt-auto">
                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-full object-cover border-2 border-teal-100" />
                        <div className="ml-4">
                            <h4 className="font-bold text-teal-900">{item.name}</h4>
                            <p className="text-sm text-gray-500">{item.role}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
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
                                        {Object.keys(calendarData).sort((a, b) => b - a).map(year => (
                                            <div key={year}>
                                                <h4 className="text-sm font-bold text-gray-700 mb-2">{year}</h4>
                                                <div className="grid grid-cols-6 sm:grid-cols-12 gap-1 sm:gap-2">
                                                    {calendarData[year].map((event, index) => (
                                                        <MonthBox 
                                                            key={index}
                                                            month={MONTH_NAMES[index]}
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
                    {/* <hr className="my-8" />
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
                    </section> */}
                </div>
            </div>
        </div>
    );
};

export default Home;