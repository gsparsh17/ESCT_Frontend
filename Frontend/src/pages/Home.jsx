import { useEffect, useState, useMemo } from 'react';

// A mock API client for a self-contained component
const mockClaims = [
  // Upcoming claims
  { _id: '1', claimCategory: 'Death After Service', title: 'Pensioner\'s Family Support', raisedBy: { _id: 'user2' }, description: 'Financial support for the family of a retired employee.', amountNeeded: 100000, deadline: '2025-09-30', status: 'pending' },
  { _id: '2', claimCategory: 'Retirement', title: 'Retirement Celebration Fund', raisedBy: { _id: 'user1' }, description: 'Contribution for a grand retirement celebration.', amountNeeded: 25000, deadline: '2025-11-20', status: 'pending' },
  { _id: '3', claimCategory: 'Death During Service', title: 'Family Assistance after Demise', raisedBy: { _id: 'user3' }, description: 'Immediate financial assistance for the family of an employee who passed away on duty.', amountNeeded: 150000, deadline: '2025-10-25', status: 'pending' },
  { _id: '4', claimCategory: 'Retirement', title: 'Retirement Gift Fund', raisedBy: { _id: 'user5' }, description: 'A small gift for an employee retiring after 30 years of service.', amountNeeded: 10000, deadline: '2025-12-05', status: 'pending' },
  // Ongoing claims
  { _id: '5', claimCategory: 'Death After Service', title: 'Ongoing Support for Retired Employee\'s Family', raisedBy: { _id: 'user6' }, description: 'Ongoing support for the family.', amountNeeded: 80000, deadline: '2025-11-10', status: 'ongoing' },
  { _id: '6', claimCategory: 'Retirement', title: 'Farewell Party Contribution', raisedBy: { _id: 'user1' }, description: 'Funds for a farewell party.', amountNeeded: 12000, deadline: '2025-11-25', status: 'ongoing' },
  // My claims (from user1)
  { _id: '7', claimCategory: 'Death During Service', title: 'My Family Assistance Claim', raisedBy: { _id: 'user1' }, description: 'A personal claim for a family member.', amountNeeded: 200000, deadline: '2025-12-15', status: 'pending' },
  { _id: '8', claimCategory: 'Retirement', title: 'My Retirement Claim', raisedBy: { _id: 'user1' }, description: 'My own retirement claim.', amountNeeded: 50000, deadline: '2026-01-01', status: 'ongoing' },
];

const mockDonations = [
  { _id: 'd1', claimId: '5', amount: 500, from: 'user1', category: 'Death After Service' },
  { _id: 'd2', claimId: '2', amount: 1000, from: 'user1', category: 'Retirement' },
  { _id: 'd3', claimId: '7', amount: 250, from: 'user1', category: 'Death During Service' },
];

const mockNews = [
  { id: 1, title: 'ESCT Reaches New Milestone in Donations', summary: 'The Employee Self Care Team has surpassed a major milestone in total donations collected for members in need.', image: 'https://picsum.photos/seed/news1/600/400' },
  { id: 2, title: 'Annual General Meeting Announced', summary: 'The Annual General Meeting will be held on December 10, 2025. All members are encouraged to attend.', image: 'https://picsum.photos/seed/news2/600/400' },
  { id: 3, title: 'New Membership Benefits Roll Out', summary: 'Exciting new benefits for all ESCT members are now live. Check out the new details in your dashboard.', image: 'https://picsum.photos/seed/news3/600/400' },
];

// Mock API functions
const api = {
  get: async (path) => {
    if (path === '/claims') {
      return { data: { data: mockClaims } };
    }
    if (path === '/donations') {
      return { data: { data: mockDonations } };
    }
    return { data: { data: [] } };
  },
};
const fetchAllClaims = async () => (await api.get('/claims')).data.data;
const fetchAllDonations = async () => (await api.get('/donations')).data.data;

// A mock Auth context to make the component runnable
const useAuth = () => ({
  user: {
    _id: 'user1',
    personalDetails: { fullName: 'Jane Doe' },
    ehrmsCode: '12345',
  },
});

// A mock ClaimCard component since we don't have the original
const ClaimCard = ({ claim, type }) => {
  const isOutgoing = type === 'outgoing';
  const categoryClass = (category) => {
    switch (category) {
      case 'Death During Service': return 'bg-red-200 text-red-800';
      case 'Death After Service': return 'bg-gray-200 text-gray-800';
      case 'Retirement': return 'bg-yellow-200 text-yellow-800';
      default: return 'bg-teal-200 text-teal-800';
    }
  };

  return (
    <div className="flex-none p-4 w-full h-full rounded-2xl bg-white border border-gray-100 shadow-md transform transition-transform duration-300 hover:scale-[1.02] active:scale-95 flex flex-col justify-between">
      <div>
        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${categoryClass(claim.claimCategory || claim.category)}`}>
          {isOutgoing ? claim.category : claim.claimCategory}
        </span>
        <h4 className="mt-2 text-lg font-semibold text-teal-900 truncate">
          {claim.title || `Donation for ${claim.category} Claim`}
        </h4>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">
          {claim.description || `Amount donated: ₹${claim.amount?.toLocaleString()}`}
        </p>
      </div>
      <div className="mt-4 flex justify-between items-center">
        {isOutgoing ? (
          <span className="text-xl font-bold text-teal-600">
            ₹{claim.amount?.toLocaleString()}
          </span>
        ) : (
          <span className="text-sm font-medium text-gray-700">
            {claim.amountNeeded ? `Need: ₹${claim.amountNeeded.toLocaleString()}` : 'No amount specified'}
          </span>
        )}
        <a href="#" className="text-sm font-semibold text-teal-600 hover:text-teal-800 transition-colors">
          View Details
        </a>
      </div>
    </div>
  );
};

// Main component
const Home = () => {
  const [allClaims, setAllClaims] = useState([]);
  const [allDonations, setAllDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  const userId = useMemo(
    () => user?._id || user?.id || user?.userId || user?.ehrmsCode || null,
    [user]
  );
  
  const displayName = user?.personalDetails?.fullName || user?.name || user?.ehrmsCode || 'Member';
  
  useEffect(() => {
    (async () => {
      try {
        const [claimsData, donationsData] = await Promise.all([
          fetchAllClaims(),
          fetchAllDonations()
        ]);
        setAllClaims(claimsData);
        setAllDonations(donationsData);
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  
  const filterClaimsByCategory = (claims, category) => claims.filter(c => c.claimCategory === category);

  const upcomingClaims = allClaims.filter(c => c.status === 'pending');
  const myClaims = allClaims.filter(c => c.raisedBy._id === userId);
  const ongoingClaims = allClaims.filter(c => c.status === 'ongoing');
  const outgoingDonations = allDonations.filter(d => d.from === userId);
  
  const totalUserContribution = allDonations
    .filter(d => d.from === userId)
    .reduce((sum, d) => sum + d.amount, 0);

  function CategorySliderWindow({ title, claims, emptyMessage }) {
    return (
      <div className="w-full flex-none sm:w-1/3 p-2">
        <h3 className="text-lg font-semibold text-teal-800 mb-2">{title}</h3>
        <div className="h-64 overflow-y-auto space-y-3 p-1 rounded-lg bg-white border border-gray-200 snap-y scroll-py-2">
          {claims.length > 0 ? (
            claims.map((claim) => (
              <div key={claim._id} className="h-full w-full snap-start">
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
  
  function OutgoingDonationWindow({ title, donations, emptyMessage }) {
    return (
      <div className="w-full flex-none sm:w-1/3 p-2">
        <h3 className="text-lg font-semibold text-teal-800 mb-2">{title}</h3>
        <div className="h-64 overflow-y-auto space-y-3 p-1 rounded-lg bg-white border border-gray-200 snap-y scroll-py-2">
          {donations.length > 0 ? (
            donations.map((donation) => (
              <div key={donation._id} className="h-full w-full snap-start">
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
          
          {/* Donation Stats Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-teal-900 mb-4">ESCT Financial Overview</h2>
            <div className="rounded-2xl bg-teal-700 text-white p-6 shadow-lg">
              <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none]">
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
          
          {/* Upcoming Claims Section */}
          <section className="mt-8">
            <h2 className="text-2xl font-bold text-teal-900 mb-4">Upcoming Claims</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <CategorySliderWindow
                title="Retirement"
                claims={filterClaimsByCategory(upcomingClaims, 'Retirement')}
                emptyMessage="No upcoming retirement claims."
              />
              <CategorySliderWindow
                title="Death After Service"
                claims={filterClaimsByCategory(upcomingClaims, 'Death After Service')}
                emptyMessage="No upcoming death after service claims."
              />
              <CategorySliderWindow
                title="Death During Service"
                claims={filterClaimsByCategory(upcomingClaims, 'Death During Service')}
                emptyMessage="No upcoming death during service claims."
              />
            </div>
          </section>

          {/* My Claims Section */}
          <section className="mt-8">
            <h2 className="text-2xl font-bold text-teal-900 mb-4">My Claims</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <CategorySliderWindow
                title="Retirement"
                claims={filterClaimsByCategory(myClaims, 'Retirement')}
                emptyMessage="You have no retirement claims."
              />
              <CategorySliderWindow
                title="Death After Service"
                claims={filterClaimsByCategory(myClaims, 'Death After Service')}
                emptyMessage="You have no death after service claims."
              />
              <CategorySliderWindow
                title="Death During Service"
                claims={filterClaimsByCategory(myClaims, 'Death During Service')}
                emptyMessage="You have no death during service claims."
              />
            </div>
          </section>

          {/* Ongoing Claims Section */}
          <section className="mt-8">
            <h2 className="text-2xl font-bold text-teal-900 mb-4">Ongoing Claims</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <CategorySliderWindow
                title="Retirement"
                claims={filterClaimsByCategory(ongoingClaims, 'Retirement')}
                emptyMessage="No ongoing retirement claims."
              />
              <CategorySliderWindow
                title="Death After Service"
                claims={filterClaimsByCategory(ongoingClaims, 'Death After Service')}
                emptyMessage="No ongoing death after service claims."
              />
              <CategorySliderWindow
                title="Death During Service"
                claims={filterClaimsByCategory(ongoingClaims, 'Death During Service')}
                emptyMessage="No ongoing death during service claims."
              />
            </div>
          </section>

          {/* My Outgoing Donations Section */}
          <section className="mt-8">
            <h2 className="text-2xl font-bold text-teal-900 mb-4">My Outgoing Donations</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <OutgoingDonationWindow
                title="Retirement"
                donations={allDonations.filter(d => d.category === 'Retirement' && d.from === userId)}
                emptyMessage="You have not donated for any retirement claims."
              />
              <OutgoingDonationWindow
                title="Death After Service"
                donations={allDonations.filter(d => d.category === 'Death After Service' && d.from === userId)}
                emptyMessage="You have not donated for any death after service claims."
              />
              <OutgoingDonationWindow
                title="Death During Service"
                donations={allDonations.filter(d => d.category === 'Death During Service' && d.from === userId)}
                emptyMessage="You have not donated for any death during service claims."
              />
            </div>
          </section>

          {/* Gallery Section */}
          <section className="mt-8">
            <h2 className="text-2xl font-bold text-teal-900 mb-4">Gallery</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <img key={i} className="rounded-2xl h-48 w-full object-cover shadow-md transition-transform duration-300 hover:scale-[1.02] cursor-pointer" src={`https://picsum.photos/seed/${i}/600/400`} alt={`Gallery image ${i}`} />
              ))}
            </div>
          </section>

          {/* News & Blog Section */}
          <section className="mt-8">
            <h2 className="text-2xl font-bold text-teal-900 mb-4">Latest News & Blog</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockNews.map(item => (
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

          {/* Know Your Contribution Section */}
          <section className="mt-8">
            <h2 className="text-2xl font-bold text-teal-900 mb-4">Know Your Contribution</h2>
            <div className="rounded-2xl bg-teal-600 text-white p-6 shadow-lg text-center">
              <p className="text-base font-medium opacity-90">Your Total Contribution to the Community</p>
              <p className="mt-2 text-5xl font-extrabold">
                ₹{totalUserContribution.toLocaleString()}
              </p>
              <a href="#" className="mt-4 inline-block px-6 py-2 bg-white text-teal-600 font-semibold rounded-full shadow-md hover:bg-teal-50 transition-colors">
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
