import { useEffect, useState } from 'react';

// Mock API functions for a self-contained component
const mockClaims = [
  { _id: '1', type: 'MEDICAL', title: 'Medical Aid for Employee', description: 'Help with hospital bills for a critical medical procedure.', beneficiaryEhrms: 'EHRMS-1', status: 'pending' },
  { _id: '2', type: 'RETIREMENT', title: 'Retirement Party Fund', description: 'Funds for a grand retirement celebration.', beneficiaryEhrms: 'EHRMS-2', status: 'completed' },
  { _id: '3', type: 'KANYADAN', title: 'Kanyadan for colleague\'s daughter', description: 'Financial support for the wedding of a colleague\'s daughter.', beneficiaryEhrms: 'EHRMS-3', status: 'in-progress' },
  { _id: '4', type: 'DEATH_AFTER_SERVICE', title: 'Support for a Pensioner\'s Family', description: 'Immediate financial aid for the family of a pensioner.', beneficiaryEhrms: 'EHRMS-4', status: 'pending' },
];

const mockCreateClaim = async (payload) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (payload.title === 'fail') {
        reject(new Error('Test submission failed. Please try again.'));
      } else {
        resolve({ message: 'Claim submitted successfully for verification!' });
      }
    }, 1500);
  });
};

const mockFetchAllClaims = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockClaims);
    }, 1000);
  });
};

// Custom ClaimCard component for a clean UI
const ClaimCard = ({ claim }) => {
  const statusColors = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    'completed': 'bg-green-100 text-green-800',
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100 transform transition-transform duration-300 hover:scale-[1.02]">
      <div className="flex justify-between items-start">
        <h4 className="text-lg font-bold text-teal-900 truncate pr-4">{claim.title}</h4>
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[claim.status]}`}>
          {claim.status}
        </span>
      </div>
      <p className="mt-2 text-sm text-gray-600 line-clamp-2">{claim.description}</p>
      <div className="mt-4 text-xs text-gray-500 flex justify-between items-center">
        <span>Beneficiary: {claim.beneficiaryEhrms}</span>
        <span className="font-semibold">{claim.type}</span>
      </div>
    </div>
  );
};

export default function Claims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [type, setType] = useState('MEDICAL');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [beneficiaryEhrms, setBeneficiaryEhrms] = useState('');
  const [submitMsg, setSubmitMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await mockFetchAllClaims();
        setClaims(data);
      } catch (e) {
        setError(e.message || 'Failed to load claims');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitMsg('');
    setSubmitting(true);
    try {
      const body = { type, title, description, beneficiaryEhrms, supportingDocuments: [] };
      const { message } = await mockCreateClaim(body);
      setSubmitMsg(message);
      // Reset form fields on success
      setType('MEDICAL');
      setTitle('');
      setDescription('');
      setBeneficiaryEhrms('');
    } catch (e) {
      setSubmitMsg(e.message || 'Failed to create claim');
    } finally {
      setSubmitting(false);
    }
  }

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
              {claims.map((c) => (
                <ClaimCard key={c._id} claim={c} />
              ))}
            </div>
          )}
        </div>

        {/* Section to create a new claim */}
        <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-200">
          <h2 className="text-2xl font-bold text-teal-900 mb-6">Raise a New Claim</h2>
          {submitMsg && (
            <div className={`p-4 mb-6 rounded-lg font-medium ${submitMsg.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {submitMsg}
            </div>
          )}
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Claim Type</label>
              <select
                className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
              >
                <option value="MEDICAL">Medical</option>
                <option value="RETIREMENT">Retirement</option>
                <option value="DEATH_AFTER_SERVICE">Death After Service</option>
                <option value="DEATH_DURING_SERVICE">Death During Service</option>
                <option value="KANYADAN">Kanyadan</option>
              </select>
            </div>
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
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Beneficiary EHRMS Code</label>
              <input
                type="text"
                className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
                value={beneficiaryEhrms}
                onChange={(e) => setBeneficiaryEhrms(e.target.value)}
                required
                placeholder="Enter the beneficiary's EHRMS code"
              />
            </div>
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
