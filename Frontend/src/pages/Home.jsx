import { useEffect, useState, useMemo, useCallback, useRef } from 'react'; // useRef is no longer used for carousels

import { fetchAllClaims } from '../lib/api/claims'; 
import { getDonationQueue, getMe, getMyDonations } from '../lib/api/donations'; 
import { getDonationCalendar } from '../lib/api/calendar'; // Import the calendar API
import { useNavigate, Link } from 'react-router-dom';
import { getGalleryPhotos, getNewsBlogs, getTestimonials } from '../lib/api/admin';

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

    events?.forEach(event => {
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

const ImageModal = ({ content, onClose, isOpen }) => {
    if (!isOpen || !content) return null;

    // Use a basic image for gallery content or structured text for news
    const isGalleryImage = content.type === 'gallery';
    const modalContent = isGalleryImage ? (
        <img src={content.url} alt={content.title} className="max-h-[80vh] max-w-full object-contain" />
    ) : (
        <div className="bg-white p-6 rounded-xl max-w-3xl w-full mx-auto shadow-2xl">
            <h3 className="text-3xl font-bold text-teal-900 mb-4">{content.title}</h3>
            <img src={content.url} alt={content.title} className="w-full h-64 object-cover rounded-lg mb-4" />
            <p className="text-gray-700 whitespace-pre-wrap">{content.fullText || content.summary}</p>
            {/* You could fetch the full news text here if needed */}
            <p className="mt-4 text-sm text-gray-500">Source: ESCT Blog</p>
        </div>
    );

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
            onClick={onClose} // Close when clicking the backdrop
            role="dialog"
            aria-modal="true"
            aria-label={content.title}
        >
            <div
                className="relative"
                onClick={e => e.stopPropagation()} // Prevent modal content from closing the modal
            >
                {modalContent}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-white bg-black/50 hover:bg-black/75 rounded-full p-2 transition-colors"
                    aria-label="Close modal"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
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
        <div className="flex lg:p-4 p-2 w-full h-full rounded-2xl bg-white border border-gray-100 shadow-md flex-row items-center justify-between space-x-3">
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
                    <div className="lg:mt-4 mt-2 border-t lg:pt-3 pt-1">
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
            <div className="lg:w-1/2 w-1/3 flex-shrink-0 relative aspect-square flex-col items-center justify-center"> {/* Added aspect-square for consistent photo sizing */}
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
                                    className="absolute inset-0 lg:-top-5 -top-8 w-full h-full object-contain z-10"
                                />
                            </>
                        )}

                        {isFarewellClaim && (
                            <>
                                <img
                                    src="/images/party-popper.png" // Adjust path as needed
                                    alt="Party Popper"
                                    className="absolute lg:top-28 top-12 left-0 w-1/2 h-auto object-contain z-10 transform translate-x-1 -translate-y-1" // Position bottom-left
                                />
                            </>
                        )}
                    </>
                )}
                        {isDeathClaim && (
                                <div className="flex flex-col items-center mt-2 justify-center z-20 rounded-xl">
                                    <p className="text-red text-sm font-bold py-1 rounded-lg tracking-wider">
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

            <div className="lg:w-1/2 w-2/3 flex flex-col justify-between h-full">
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
                            </p>
                                <span className="ml-1 text-base text-gray-800 font-bold">{displayClaim.beneficiary.personalDetails?.fullName}</span>
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

const VerticalScroller = ({ children, speed = 'normal' }) => {
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
    const handleLinkClick = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        navigate('/profile');
    };
    const [allClaims, setAllClaims] = useState([]);
    const [myDonationsQueue, setMyDonationsQueue] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState(null);
    const [calendarData, setCalendarData] = useState({}); // { year: [month events] }
    const [myDonations, setMyDonations] = useState([]);

     // New state for dynamic content
    const [galleryImages, setGalleryImages] = useState([]);
    const [newsArticles, setNewsArticles] = useState([]);
    const [testimonials, setTestimonials] = useState([]);
    const [contentLoading, setContentLoading] = useState(true);
    const [contentError, setContentError] = useState(null);


    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const filterClaimsByType = (claims, type) => claims.filter(c => c.type === type);

    const openModal = useCallback((contentData) => {
        setModalContent(contentData);
        setIsModalOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        setModalContent(null);
    }, []);

    const { userId, displayName } = useMemo(() => {
        const user = currentUser;
        const id = user?._id || user?.id || user?.userId || user?.ehrmsCode || null;
        const name = user?.personalDetails?.fullName || user?.name || user?.ehrmsCode || 'Guest';
        
        return { 
            userId: id, 
            displayName: name
        };
    }, [currentUser]);

   const totalUserContribution = useMemo(() => {
        if (!myDonations || !Array.isArray(myDonations) || myDonations.length === 0) {
            return 0;
        }
        // Safely use reduce now that myDonations is guaranteed to be an array
        return myDonations.reduce((total, donation) => {
            if (donation.status === 'COMPLETED') {
                // Ensure donation.amount is a number before summing
                return total + (typeof donation.amount === 'number' ? donation.amount : 0);
            }
            return total;
        }, 0);
    }, [myDonations]);

const sumClaimsRequestedAmount = (claims) => {
    return claims.reduce((sum, claim) => sum + (claim.amountRequested || 0), 0);
};

const claimCounts = useMemo(() => {
    if (!allClaims) {
        // Initialize with 0 amounts
        return { retirement: 0, deathAfter: 0, deathDuring: 0, medical: 0, marriage: 0, total: 0 };
    }

    // 1. Filter claims by type
    const retirementClaims = filterClaimsByType(allClaims, 'Retirement Farewell');
    const deathAfterClaims = filterClaimsByType(allClaims, 'Death After Service');
    const deathDuringClaims = filterClaimsByType(allClaims, 'Death During Service');
    const medicalClaims = filterClaimsByType(allClaims, 'Medical Claim');
    const marriageClaims = filterClaimsByType(allClaims, "Daughter's Marriage");
    
    // 2. Calculate the sum of amountRequested for each filtered set
    return {
        retirement: sumClaimsRequestedAmount(retirementClaims),
        deathAfter: sumClaimsRequestedAmount(deathAfterClaims),
        deathDuring: sumClaimsRequestedAmount(deathDuringClaims),
        medical: sumClaimsRequestedAmount(medicalClaims),
        marriage: sumClaimsRequestedAmount(marriageClaims),
        total: sumClaimsRequestedAmount(allClaims)
    };
}, [allClaims]);

const memberCategoryCounts = useMemo(() => {
    // ... (This hook remains unchanged as it counts unique members, not claims)
    if (!allClaims) {
        return { retirement: 0, deathAfter: 0, deathDuring: 0, medical: 0, marriage: 0 };
    }

    const categoryMap = new Map();

    (allClaims||[]).forEach(claim => {
        const type = claim.type;
        const beneficiaryId = claim.beneficiary?._id || claim.beneficiary?.ehrmsCode;

        if (!type || !beneficiaryId) return;

        if (!categoryMap.has(type)) {
            categoryMap.set(type, new Set());
        }
        categoryMap.get(type).add(beneficiaryId);
    });

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

        const fetchDynamicContent = useCallback(async () => {
        try {
            setContentLoading(true);
            setContentError(null);

            const [galleryRes, newsRes, testimonialsRes] = await Promise.allSettled([
                getGalleryPhotos({ page: 1, limit: 12, isActive: 'true' }),
                getNewsBlogs({ page: 1, limit: 6, isPublished: 'true' }),
                getTestimonials({ page: 1, limit: 6, isActive: 'true' })
            ]);

            // Process gallery images
            if (galleryRes.status === 'fulfilled' && galleryRes.value.data?.galleryItems) {
                setGalleryImages(galleryRes.value.data.galleryItems);
            }

            // Process news articles
            if (newsRes.status === 'fulfilled' && newsRes.value.data?.newsBlogs) {
                setNewsArticles(newsRes.value.data.newsBlogs);
            }

            // Process testimonials
            if (testimonialsRes.status === 'fulfilled' && testimonialsRes.value.data?.testimonials) {
                setTestimonials(testimonialsRes.value.data.testimonials);
            }

        } catch (err) {
            console.error('Error fetching dynamic content:', err);
            setContentError('Failed to load some content');
        } finally {
            setContentLoading(false);
        }
    }, []);

const fetchData = useCallback(async () => {
        try {
            setError(null);
            setLoading(true);
            
            // 1. Use Promise.allSettled to fetch all data concurrently
            const results = await Promise.allSettled([
                getMe(),
                fetchAllClaims(), 
                getDonationQueue(),
                getDonationCalendar(),
                getMyDonations() // This API is suspected of returning a non-array object on success
            ]);

            // 2. Extract values safely using status check
            const user = results[0].status === 'fulfilled' ? results[0].value : null;
            const claimsData = results[1].status === 'fulfilled' ? results[1].value : [];
            const donationQueueData = results[2].status === 'fulfilled' ? results[2].value : [];
            const calendarEvents = results[3].status === 'fulfilled' ? results[3].value : null;
            
            // --- TARGET FIX: Safely handling myDonations (userDonations) ---
            let userDonations = [];
            if (results[4].status === 'fulfilled') {
                const apiValue = results[4].value;
                
                // Assuming the API returns an object like { data: [...] } or just the array [...]
                // We check if it's an array, or if it's an object containing a 'data' array.
                if (Array.isArray(apiValue)) {
                    userDonations = apiValue;
                } else if (apiValue && typeof apiValue === 'object' && Array.isArray(apiValue.data)) {
                    userDonations = apiValue.data;
                } else if (apiValue && typeof apiValue === 'object' && !Array.isArray(apiValue)) {
                    // If it's an object but not the array we expect, default to an empty array.
                    userDonations = []; 
                }
            }
            // -------------------------------------------------------------

            setCurrentUser(user || null);
            
            // 3. Set state with the safely extracted values
            setAllClaims(claimsData);
            setMyDonationsQueue(donationQueueData);
            setMyDonations(userDonations); // Use the safely checked array
            console.log(claimsData);
            
            // Process and set calendar data
            if (calendarEvents) {
                const { calendar } = processCalendarData(calendarEvents);
                setCalendarData(calendar || {});
            }

        } catch (e) {
            // Note: Since Promise.allSettled is used, this catch block is unlikely to run 
            // unless Promise.allSettled itself throws (e.g., if arguments aren't promises).
            console.error("Home Data Fetch Error:", e);
            setError('An unknown error occurred while loading dashboard data.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        fetchDynamicContent();
    }, [fetchData, fetchDynamicContent]);

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
                            <div key={claim._id || claim.claimId} className="w-full p-2">
                                <div className="bg-white rounded-lg p-2 border border-gray-100 shadow-sm">
                                    <ClaimCard claim={claim} type="incoming" />
                                </div>
                            </div>
                        ))}
                    </VerticalScroller>
                ) : (
                    <div className="h-64 overflow-y-auto custom-scrollbar space-y-3 p-2 rounded-lg bg-white border border-gray-200 snap-y scroll-py-2">
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
                                <div className="bg-white rounded-lg p-1 border border-gray-100 shadow-sm">
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
                <div className="h-64 overflow-y-auto custom-scrollbar space-y-3 p-2 rounded-lg bg-white border border-gray-200 snap-y scroll-py-2">
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
            <CarouselStyles />

            <div className="rounded-b-3xl bg-gradient-to-br from-teal-500 to-teal-700 text-white lg:p-6 p-2 shadow-lg">
                <Link to="/profile" onClick={handleLinkClick} className="max-w-7xl mx-auto flex items-center gap-4 no-underline">
                    <img
                        src={currentUser?.photoUrl || 'https://placehold.co/100x100/5eead4/115e59?text=G'}
                        alt={currentUser?.personalDetails?.fullName || displayName || 'avatar'}
                        className="h-16 w-16 rounded-full border-4 border-white/40 shadow-lg object-cover"
                    />
                    <div>
                        <p className="text-lg opacity-90 font-medium">Welcome</p>
                        <p className="lg:text-3xl text-xl font-extrabold">{currentUser?.personalDetails?.fullName || displayName}</p>
                        <p className="lg:text-xl my-1">ESCT ID: {currentUser?.userId || currentUser?.ehrmsCode || 'ESCT00000000'}</p>
                    </div>
                </Link>
            </div>
            
            <div className="max-w-7xl mx-auto mt-6 px-4">
                <div className="bg-white rounded-3xl lg:p-6 p-2">
                    
                    <section className="mb-8">
    <h2 className="text-3xl font-bold text-teal-900 mb-8">
        Our Collective Impact
    </h2>
    <div className="rounded-3xl bg-teal-700 text-white p-4 sm:p-6 shadow-xl transform hover:scale-[1.01] transition-transform duration-300 ease-out">
        
        <div className="text-center mb-6 sm:mb-8">
            <p className="text-base sm:text-lg font-semibold opacity-80 uppercase tracking-wider mb-4">
                Total No. of Donations Till Date
            </p>
            
            <div className="relative bg-teal-800/30 rounded-2xl p-4 sm:p-6 border-2 border-teal-500/50 mx-auto max-w-md">
                <div className="absolute top-0 left-0 right-0 h-4 flex justify-between px-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="w-px h-2 bg-teal-400/50"></div>
                    ))}
                </div>
                
                <div className="relative z-10">
                    <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-teal-100 mb-2 tracking-tight">
                        0
                    </div>
                    
                    <div className="flex items-center justify-center space-x-2 mb-3">
                        <div className="w-8 h-1 bg-gradient-to-r from-green-400 to-yellow-400 rounded-full"></div>
                        <div className="text-xs text-teal-300 font-semibold">ACTIVE METER</div>
                        <div className="w-8 h-1 bg-gradient-to-r from-yellow-400 to-green-400 rounded-full"></div>
                    </div>
                    
                    <div className="w-full bg-teal-900/50 rounded-full h-3 mb-2 overflow-hidden">
                        <div 
                            className="bg-gradient-to-r from-green-400 via-yellow-400 to-green-400 h-full rounded-full animate-pulse"
                            style={{ width: '0%' }}
                        ></div>
                    </div>
                    
                    <div className="flex justify-between text-xs text-teal-300 px-2">
                        <span>0</span>
                        <span>100K</span>
                        <span>200K</span>
                        <span>500K</span>
                        <span>1000K</span>
                    </div>
                </div>
                
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-400/10 to-transparent pointer-events-none"></div>
            </div>
            
        </div>

        <div className="mt-6 sm:mt-8 pt-4 border-t border-teal-500">
            <p className="text-base sm:text-lg font-semibold mb-3 text-center sm:text-left">
                Breakdown by Claim Type
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm sm:text-base font-medium">
                <div className="flex justify-between items-center bg-teal-800/50 p-3 sm:p-2 rounded-lg">
                    <span className="text-sm sm:text-base">Death After Service</span>
                    <span className="font-bold text-base sm:text-lg text-teal-200">0</span>
                </div>
                <div className="flex justify-between items-center bg-teal-800/50 p-3 sm:p-2 rounded-lg">
                    <span className="text-sm sm:text-base">Retirement Farewell</span>
                    <span className="font-bold text-base sm:text-lg text-teal-200">0</span>
                </div>
                <div className="flex justify-between items-center bg-teal-800/50 p-3 sm:p-2 rounded-lg">
                    <span className="text-sm sm:text-base">Death During Service</span>
                    <span className="font-bold text-base sm:text-lg text-teal-200">0</span>
                </div>
                <div className="flex justify-between items-center bg-teal-800/50 p-3 sm:p-2 rounded-lg">
                    <span className="text-sm sm:text-base">Other Help Claims</span>
                    <span className="font-bold text-base sm:text-lg text-teal-200">0</span>
                </div>
            </div>
        </div>
        
    </div>
</section>
<hr className="my-8" />
<section className="mb-8">
    <div className="rounded-3xl bg-teal-700 text-white p-4 sm:p-6 shadow-xl transform hover:scale-[1.01] transition-transform duration-300 ease-out">
        
        {/* Analog Meter Style Total Donations */}
        <div className="text-center mb-6 sm:mb-8">
            <p className="text-base sm:text-lg font-semibold opacity-80 uppercase tracking-wider mb-4">
                Total Amount Disbursed By ESCT
            </p>
            
            {/* Meter Container */}
            <div className="relative bg-teal-800/30 rounded-2xl p-4 sm:p-6 border-2 border-teal-500/50 mx-auto max-w-md">
                {/* Meter Scale Lines */}
                <div className="absolute top-0 left-0 right-0 h-4 flex justify-between px-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="w-px h-2 bg-teal-400/50"></div>
                    ))}
                </div>
                
                {/* Main Number Display */}
                <div className="relative z-10">
                    <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-teal-100 mb-2 tracking-tight">
                        ₹0
                    </div>
                    
                    {/* Animated Meter Needle Effect */}
                    <div className="flex items-center justify-center space-x-2 mb-3">
                        <div className="w-8 h-1 bg-gradient-to-r from-green-400 to-yellow-400 rounded-full"></div>
                        <div className="text-xs text-teal-300 font-semibold">ACTIVE METER</div>
                        <div className="w-8 h-1 bg-gradient-to-r from-yellow-400 to-green-400 rounded-full"></div>
                    </div>
                    
                    {/* Progress Bar Style */}
                    <div className="w-full bg-teal-900/50 rounded-full h-3 mb-2 overflow-hidden">
                        <div 
                            className="bg-gradient-to-r from-green-400 via-yellow-400 to-green-400 h-full rounded-full animate-pulse"
                            style={{ width: '0%' }}
                        ></div>
                    </div>
                    
                    {/* Scale Labels */}
                    <div className="flex justify-between text-xs text-teal-300 px-2">
                        <span>₹0</span>
                        <span>₹500K</span>
                        <span>₹1000K</span>
                        <span>₹2000K</span>
                        <span>₹5000K</span>
                    </div>
                </div>
                
                {/* Glowing Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-400/10 to-transparent pointer-events-none"></div>
            </div>
            
            {/* Achievement Badge */}
            {/* <div className="mt-4 inline-flex items-center space-x-2 bg-teal-600/50 px-4 py-2 rounded-full border border-teal-400/30">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                <span className="text-sm font-semibold text-teal-100">Milestone Achieved! 🎯</span>
            </div> */}
        </div>

        <div className="mt-6 sm:mt-8 pt-4 border-t border-teal-500">
            <p className="text-base sm:text-lg font-semibold mb-3 text-center sm:text-left">
                Breakdown by Claim Type
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm sm:text-base font-medium">
                <div className="flex justify-between items-center bg-teal-800/50 p-3 sm:p-2 rounded-lg">
                    <span className="text-sm sm:text-base">Death After Service</span>
                    <span className="font-bold text-base sm:text-lg text-teal-200">₹0</span>
                </div>
                <div className="flex justify-between items-center bg-teal-800/50 p-3 sm:p-2 rounded-lg">
                    <span className="text-sm sm:text-base">Retirement Farewell</span>
                    <span className="font-bold text-base sm:text-lg text-teal-200">₹0</span>
                </div>
                <div className="flex justify-between items-center bg-teal-800/50 p-3 sm:p-2 rounded-lg">
                    <span className="text-sm sm:text-base">Death During Service</span>
                    <span className="font-bold text-base sm:text-lg text-teal-200">₹0</span>
                </div>
                <div className="flex justify-between items-center bg-teal-800/50 p-3 sm:p-2 rounded-lg">
                    <span className="text-sm sm:text-base">Other Help Claims</span>
                    <span className="font-bold text-base sm:text-lg text-teal-200">₹0</span>
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
                        <div className="flex flex-col sm:flex-row">
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
                        <div className="flex flex-col sm:flex-row">
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
    <h2 className="text-2xl font-bold text-teal-900 mb-6">Claim Amount Disbursed in each Category</h2>
    
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
    
        <div className="text-center">
            <h3 className="text-xs font-semibold text-teal-800 mb-1 h-8 flex items-center justify-center" title="Retirement Farewell">
                <span className="line-clamp-2">Retirement Farewell</span>
            </h3>
            <div className="p-2 sm:p-3 rounded-2xl shadow-lg border bg-teal-100 text-teal-800 border-teal-300 transform transition-transform duration-300 hover:scale-105">
                <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                    <div className="flex-shrink-0 opacity-70">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold">₹{claimCounts.retirement}</p>
                </div>
            </div>
        </div>

        <div className="text-center">
            <h3 className="text-xs font-semibold text-teal-800 mb-1 h-8 flex items-center justify-center" title="Death During Service">
                <span className="line-clamp-2">Death During Service</span>
            </h3>
            <div className="p-2 sm:p-3 rounded-2xl shadow-lg border bg-teal-100 text-teal-800 border-teal-300 transform transition-transform duration-300 hover:scale-105">
                <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                    <div className="flex-shrink-0 opacity-70">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.876c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold">₹{claimCounts.deathDuring}</p>
                </div>
            </div>
        </div>

        <div className="text-center">
            <h3 className="text-xs font-semibold text-teal-800 mb-1 h-8 flex items-center justify-center" title="Death After Service">
                <span className="line-clamp-2">Death After Service</span>
            </h3>
            <div className="p-2 sm:p-3 rounded-2xl shadow-lg border bg-teal-100 text-teal-800 border-teal-300 transform transition-transform duration-300 hover:scale-105">
                <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                    <div className="flex-shrink-0 opacity-70">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold">₹{claimCounts.deathAfter}</p>
                </div>
            </div>
        </div>

        <div className="text-center">
            <h3 className="text-xs font-semibold text-teal-800 mb-1 h-8 flex items-center justify-center" title="Daughter's Marriage">
                <span className="line-clamp-2">Daughter's Marriage</span>
            </h3>
            <div className="p-2 sm:p-3 rounded-2xl shadow-lg border bg-teal-100 text-teal-800 border-teal-300 transform transition-transform duration-300 hover:scale-105">
                <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                    <div className="flex-shrink-0 opacity-70">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1014.625 7.5H9.375A2.625 2.625 0 1012 4.875zM21 11.25H3v-3.75a.75.75 0 01.75-.75h16.5a.75.75 0 01.75.75v3.75z" />
                        </svg>
                    </div>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold">₹{claimCounts.marriage}</p>
                </div>
            </div>
        </div>

        <div className="text-center col-span-2 sm:col-span-3 lg:col-span-1">
            <h3 className="text-xs font-semibold text-teal-800 mb-1 h-8 flex items-center justify-center" title="Medical Claim">
                <span className="line-clamp-2">Medical Claim</span>
            </h3>
            <div className="p-2 sm:p-3 rounded-2xl shadow-lg border bg-teal-100 text-teal-800 border-teal-300 transform transition-transform duration-300 hover:scale-105">
                <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                    <div className="flex-shrink-0 opacity-70">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold">₹{claimCounts.medical}</p>
                </div>
            </div>
        </div>
        
    </div>
</section>
<hr className="my-8" />
<section className="mt-8">
    <h2 className="text-2xl font-bold text-teal-900 mb-6">Claims at each Category</h2>
    
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
    
        <div className="text-center">
            <h3 className="text-xs font-semibold text-teal-800 mb-1 h-8 flex items-center justify-center" title="Retirement Farewell">
                <span className="line-clamp-2">Retirement Farewell</span>
            </h3>
            <div className="p-2 sm:p-3 rounded-2xl shadow-lg border bg-teal-100 text-teal-800 border-teal-300 transform transition-transform duration-300 hover:scale-105">
                <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                    <div className="flex-shrink-0 opacity-70">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold">{memberCategoryCounts.retirement}</p>
                </div>
            </div>
        </div>

        <div className="text-center">
            <h3 className="text-xs font-semibold text-teal-800 mb-1 h-8 flex items-center justify-center" title="Death During Service">
                <span className="line-clamp-2">Death During Service</span>
            </h3>
            <div className="p-2 sm:p-3 rounded-2xl shadow-lg border bg-teal-100 text-teal-800 border-teal-300 transform transition-transform duration-300 hover:scale-105">
                <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                    <div className="flex-shrink-0 opacity-70">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.876c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold">{memberCategoryCounts.deathDuring}</p>
                </div>
            </div>
        </div>

        <div className="text-center">
            <h3 className="text-xs font-semibold text-teal-800 mb-1 h-8 flex items-center justify-center" title="Death After Service">
                <span className="line-clamp-2">Death After Service</span>
            </h3>
            <div className="p-2 sm:p-3 rounded-2xl shadow-lg border bg-teal-100 text-teal-800 border-teal-300 transform transition-transform duration-300 hover:scale-105">
                <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                    <div className="flex-shrink-0 opacity-70">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold">{memberCategoryCounts.deathAfter}</p>
                </div>
            </div>
        </div>

        <div className="text-center">
            <h3 className="text-xs font-semibold text-teal-800 mb-1 h-8 flex items-center justify-center" title="Daughter's Marriage">
                <span className="line-clamp-2">Daughter's Marriage</span>
            </h3>
            <div className="p-2 sm:p-3 rounded-2xl shadow-lg border bg-teal-100 text-teal-800 border-teal-300 transform transition-transform duration-300 hover:scale-105">
                <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                    <div className="flex-shrink-0 opacity-70">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1014.625 7.5H9.375A2.625 2.625 0 1012 4.875zM21 11.25H3v-3.75a.75.75 0 01.75-.75h16.5a.75.75 0 01.75.75v3.75z" />
                        </svg>
                    </div>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold">{memberCategoryCounts.marriage}</p>
                </div>
            </div>
        </div>

        <div className="text-center col-span-2 sm:col-span-3 lg:col-span-1">
            <h3 className="text-xs font-semibold text-teal-800 mb-1 h-8 flex items-center justify-center" title="Medical Claim">
                <span className="line-clamp-2">Medical Claim</span>
            </h3>
            <div className="p-2 sm:p-3 rounded-2xl shadow-lg border bg-teal-100 text-teal-800 border-teal-300 transform transition-transform duration-300 hover:scale-105">
                <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                    <div className="flex-shrink-0 opacity-70">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold">{memberCategoryCounts.medical}</p>
                </div>
            </div>
        </div>
        
    </div>
</section>
{/* <hr className="my-8" /> */}
 <ImageModal isOpen={isModalOpen} content={modalContent} onClose={closeModal} />
            {/* Gallery Section with Dynamic Data */}
            { galleryImages.length > 0 && (
            <section className="mt-8">
                        <h2 className="text-2xl font-bold text-teal-900 mb-4">Gallery</h2>
                        {contentLoading ? (
                            <div className="flex space-x-4 overflow-x-hidden py-2">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="flex-shrink-0 w-72">
                                        <div className="rounded-2xl h-48 w-full bg-gray-200 animate-pulse"></div>
                                    </div>
                                ))}
                            </div>
                        ) : galleryImages.length > 0 ? (
                            <div className="overflow-x-hidden carousel-container py-2" aria-label="Gallery carousel">
                                <div className="flex w-max space-x-4 animate-scroll-gallery pause-on-hover">
                                    {galleryImages.map((image) => (
                                        <div key={image._id} className="flex-shrink-0 w-72">
                                            <a 
                                                href="#" 
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    openModal({
                                                        type: 'gallery',
                                                        url: image.signedImageUrl || image.imageUrl,
                                                        title: image.title,
                                                        id: image._id,
                                                    });
                                                }} 
                                                title={`View ${image.title}`}
                                            >
                                                <img 
                                                    className="rounded-2xl h-48 w-full object-cover shadow-md transition-transform duration-300 hover:scale-[1.02] cursor-pointer" 
                                                    src={image.signedImageUrl || image.imageUrl} 
                                                    alt={image.title} 
                                                />
                                            </a>
                                        </div>
                                    ))}
                                    {/* Duplicate for seamless loop */}
                                    {/* {galleryImages.map((image) => (
                                        <div key={`${image._id}-dup`} aria-hidden="true" className="flex-shrink-0 w-72">
                                            <img 
                                                className="rounded-2xl h-48 w-full object-cover shadow-md" 
                                                src={image.signedImageUrl || image.imageUrl} 
                                                alt={image.title} 
                                            />
                                        </div>
                                    ))} */}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <p>No gallery images available at the moment.</p>
                            </div>
                        )}
                    </section>
            )}
                    {/* News Section with Dynamic Data */}
                    { newsArticles.length > 0 && (
                    <section className="mt-8">
                        <h2 className="text-2xl font-bold text-teal-900 mb-4">Latest News & Blog</h2>
                        {contentLoading ? (
                            <div className="flex space-x-4 overflow-x-hidden py-2">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="flex-shrink-0 w-80 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                                        <div className="w-full h-40 bg-gray-200 animate-pulse"></div>
                                        <div className="p-4">
                                            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                                            <div className="h-3 bg-gray-200 rounded animate-pulse mb-1"></div>
                                            <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : newsArticles.length > 0 ? (
                            <div className="overflow-x-hidden carousel-container py-2">
                                <div className="flex w-max space-x-4 animate-scroll-news pause-on-hover">
                                    {newsArticles.map((article) => (
                                        <a 
                                            key={article._id} 
                                            href="#" 
                                            onClick={(e) => {
                                                e.preventDefault();
                                                openModal({
                                                    type: 'news',
                                                    title: article.title,
                                                    url: article.signedImageUrl || article.imageUrl,
                                                    summary: article.summary,
                                                    fullText: article.content,
                                                    date: article.createdAt,
                                                });
                                            }}
                                        >
                                            <div className="flex-shrink-0 w-80 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                                                <img 
                                                    src={article.signedImageUrl || article.imageUrl} 
                                                    alt={article.title} 
                                                    className="w-full h-40 object-cover" 
                                                />
                                                <div className="p-4">
                                                    <h3 className="text-lg font-bold text-teal-900 truncate">{article.title}</h3>
                                                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">{article.summary}</p>
                                                    <span className="mt-3 inline-block text-sm font-semibold text-teal-600 hover:text-teal-800 transition-colors">
                                                        Read more →
                                                    </span>
                                                </div>
                                            </div>
                                        </a>
                                    ))}
                                    {/* Duplicate for seamless loop */}
                                    {/* {newsArticles.map((article) => (
                                        <div key={`${article._id}-dup`} aria-hidden="true" className="flex-shrink-0 w-80 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                                            <img 
                                                src={article.signedImageUrl || article.imageUrl} 
                                                alt={article.title} 
                                                className="w-full h-40 object-cover" 
                                            />
                                            <div className="p-4">
                                                <h3 className="text-lg font-bold text-teal-900 truncate">{article.title}</h3>
                                                <p className="mt-2 text-sm text-gray-600 line-clamp-2">{article.summary}</p>
                                            </div>
                                        </div>
                                    ))} */}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <p>No news articles available at the moment.</p>
                            </div>
                        )}
                    </section>
                    )}
                    {/* Testimonials Section with Dynamic Data */}
                    {testimonials.length > 0 && (
                    <section className="mt-8">
                        <h2 className="text-2xl font-bold text-teal-900 mb-6">Testimonials</h2>
                        {contentLoading ? (
                            <div className="flex space-x-4 overflow-x-hidden py-2">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="flex-shrink-0 w-80 bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col">
                                        <div className="w-10 h-10 bg-gray-200 rounded animate-pulse mb-4"></div>
                                        <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                                        <div className="flex items-center mt-6">
                                            <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                                            <div className="ml-4">
                                                <div className="h-4 bg-gray-200 rounded animate-pulse w-24 mb-1"></div>
                                                <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : testimonials.length > 0 ? (
                            <div className="overflow-x-hidden carousel-container py-2">
                                <div className="flex w-max space-x-4 animate-scroll-testimonials pause-on-hover">
                                    {testimonials.map((testimonial) => (
                                        <div key={testimonial._id} className="flex-shrink-0 w-80 bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col transition-transform duration-300">
                                            <svg className="w-10 h-10 text-teal-400 mb-4 flex-shrink-0" fill="currentColor" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M13,10H8.5C7.3,10,6.9,10.2,6.5,11.2C6.1,12.2,6,13.8,6,16v6h7V10z M26,10h-4.5c-1.2,0-1.6,0.2-2,1.2c-0.4,1-0.5,2.6-0.5,4.8v6h7V10z"/>
                                            </svg>
                                            <p className="text-gray-700 italic text-lg mb-6 flex-grow">"{testimonial.content}"</p>
                                            <div className="flex items-center mt-auto">
                                                {testimonial.imageUrl ? (
                                                    <img 
                                                        src={testimonial.signedImageUrl || testimonial.imageUrl} 
                                                        alt={testimonial.name} 
                                                        className="w-12 h-12 rounded-full object-cover border-2 border-teal-100" 
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                                                        <svg className="w-6 h-6 text-teal-600" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                                        </svg>
                                                    </div>
                                                )}
                                                <div className="ml-4">
                                                    <h4 className="font-bold text-teal-900">{testimonial.name}</h4>
                                                    <p className="text-sm text-gray-500">
                                                        {[testimonial.position, testimonial.company].filter(Boolean).join(', ')}
                                                    </p>
                                                    <div className="flex items-center mt-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <svg 
                                                                key={i}
                                                                className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                                                fill="currentColor" 
                                                                viewBox="0 0 20 20"
                                                            >
                                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                                            </svg>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {/* Duplicate for seamless loop */}
                                    {/* {testimonials.map((testimonial) => (
                                        <div key={`${testimonial._id}-dup`} aria-hidden="true" className="flex-shrink-0 w-80 bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col">
                                            <svg className="w-10 h-10 text-teal-400 mb-4 flex-shrink-0" fill="currentColor" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M13,10H8.5C7.3,10,6.9,10.2,6.5,11.2C6.1,12.2,6,13.8,6,16v6h7V10z M26,10h-4.5c-1.2,0-1.6,0.2-2,1.2c-0.4,1-0.5,2.6-0.5,4.8v6h7V10z"/>
                                            </svg>
                                            <p className="text-gray-700 italic text-lg mb-6 flex-grow">"{testimonial.content}"</p>
                                            <div className="flex items-center mt-auto">
                                                {testimonial.imageUrl ? (
                                                    <img 
                                                        src={testimonial.signedImageUrl || testimonial.imageUrl} 
                                                        alt={testimonial.name} 
                                                        className="w-12 h-12 rounded-full object-cover border-2 border-teal-100" 
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                                                        <svg className="w-6 h-6 text-teal-600" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                                        </svg>
                                                    </div>
                                                )}
                                                <div className="ml-4">
                                                    <h4 className="font-bold text-teal-900">{testimonial.name}</h4>
                                                    <p className="text-sm text-gray-500">
                                                        {[testimonial.position, testimonial.company].filter(Boolean).join(', ')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))} */}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <p>No testimonials available at the moment.</p>
                            </div>
                        )}
                    </section>
                    )}
                    <hr className="my-8" />
                    <section className="mt-8">
                        <h2 className="text-2xl font-bold text-teal-900 mb-4">Amount of Monthly Donations Raised</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
                            <div className="rounded-2xl bg-teal-600 text-white lg:p-6 p-2 shadow-xl text-center mb-6 md:col-span-1">
                                <p className="text-base font-medium opacity-90">Previous Month</p>
                                <p className="mt-2 text-4xl sm:text-5xl font-extrabold">
                                    {loading ? (
                                        <span className="inline-block w-3/4 h-10 sm:h-12 bg-teal-700 rounded-full animate-pulse"></span>
                                    ) : (
                                        `₹${totalUserContribution.toLocaleString('en-IN')}`
                                    )}
                                </p>
                            </div>
                            <div className="rounded-2xl bg-teal-600 text-white p-6 shadow-xl text-center mb-6 md:col-span-1">
                                <p className="text-base font-medium opacity-90">Current Month</p>
                                <p className="mt-2 text-4xl sm:text-5xl font-extrabold">
                                    {loading ? (
                                        <span className="inline-block w-3/4 h-10 sm:h-12 bg-teal-700 rounded-full animate-pulse"></span>
                                    ) : (
                                        `₹${totalUserContribution.toLocaleString('en-IN')}`
                                    )}
                                </p>
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