import { useEffect, useState } from 'react';

// Mock data and API functions for a self-contained component
const mockUser = {
  _id: 'user1',
  personalDetails: {
    fullName: 'Jane Doe',
    dateOfBirth: '1985-04-20',
    age: 40,
    sex: 'FEMALE',
    aadhaarNumber: '123456789012',
    phone: '9876543210',
    email: 'jane.doe@example.com',
  },
  employmentDetails: {
    state: 'Uttar Pradesh',
    district: 'Lucknow',
    department: 'Health',
    designation: 'Senior Analyst',
    dateOfJoining: '2010-06-15',
  },
  bankDetails: {
    accountNumber: '1234567890',
    ifscCode: 'HDFC0000123',
    bankName: 'HDFC Bank',
  },
};

const mockNominees = [
  { _id: 'n1', name: 'John Doe', relation: 'Husband', dateOfBirth: '1980-01-01', aadhaarNumber: '987654321012', isPrimary: true },
  { _id: 'n2', name: 'Emily Doe', relation: 'Daughter', dateOfBirth: '2010-05-15', aadhaarNumber: '567890123456', isPrimary: false },
];

const mockAPI = {
  fetchUserData: () => new Promise(resolve => setTimeout(() => resolve(mockUser), 500)),
  fetchNominees: () => new Promise(resolve => setTimeout(() => resolve(mockNominees), 500)),
  updateProfile: (data) => new Promise(resolve => setTimeout(() => resolve({ message: 'Profile updated successfully.' }), 500)),
  addNominee: (nominee) => new Promise(resolve => setTimeout(() => resolve({ ...nominee, _id: Date.now().toString() }), 500)),
  deleteNominee: () => new Promise(resolve => setTimeout(() => resolve({ message: 'Nominee deleted.' }), 500)),
};

const Profile = () => {
  const [activeTab, setActiveTab] = useState('Personal');
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [nominees, setNominees] = useState([]);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState({ Personal: false, Employment: false, Bank: false, Nominees: false });
  const [newNominee, setNewNominee] = useState({ name: '', relation: '', dateOfBirth: '', aadhaarNumber: '', isPrimary: false });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await mockAPI.fetchUserData();
        const noms = await mockAPI.fetchNominees();
        setUserData(user);
        setNominees(noms);
      } catch (err) {
        setError('Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpdate = async (updatedData) => {
    try {
      await mockAPI.updateProfile(updatedData);
      setUserData(prev => ({ ...prev, ...updatedData }));
      setEditMode({ ...editMode, [activeTab]: false });
    } catch (err) {
      setError('Failed to update profile.');
    }
  };

  const handleAddNominee = async (e) => {
    e.preventDefault();
    if (!newNominee.name || !newNominee.relation || !newNominee.dateOfBirth) {
      setError('Please fill all required nominee fields.');
      return;
    }
    const addedNominee = await mockAPI.addNominee(newNominee);
    setNominees([...nominees, addedNominee]);
    setNewNominee({ name: '', relation: '', dateOfBirth: '', aadhaarNumber: '', isPrimary: false });
  };

  const handleDeleteNominee = async (id) => {
    await mockAPI.deleteNominee(id);
    setNominees(nominees.filter(n => n._id !== id));
  };

  if (loading) return <div className="text-center py-12">Loading profile...</div>;
  if (error) return <div className="text-center py-12 text-red-600">{error}</div>;

  const renderContent = () => {
    const commonClasses = "mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4";
    const labelClasses = "block text-sm font-medium text-gray-700";
    const inputClasses = "mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm disabled:bg-gray-100 disabled:cursor-not-allowed";

    switch (activeTab) {
      case 'Personal':
        return (
          <div>
            <div className={commonClasses}>
              <div><label className={labelClasses}>Full Name</label><input type="text" value={userData.personalDetails.fullName} disabled={true} className={inputClasses} /></div>
              <div><label className={labelClasses}>Date of Birth</label><input type="date" value={userData.personalDetails.dateOfBirth} disabled={true} className={inputClasses} /></div>
              <div><label className={labelClasses}>Sex</label><input type="text" value={userData.personalDetails.sex} disabled={true} className={inputClasses} /></div>
              <div><label className={labelClasses}>Aadhaar Number</label><input type="text" value={userData.personalDetails.aadhaarNumber} disabled={true} className={inputClasses} /></div>
              <div><label className={labelClasses}>Phone</label><input type="text" value={userData.personalDetails.phone} disabled={!editMode.Personal} className={inputClasses} /></div>
              <div><label className={labelClasses}>Email</label><input type="email" value={userData.personalDetails.email} disabled={!editMode.Personal} className={inputClasses} /></div>
            </div>
            <div className="mt-6">
              <button onClick={() => setEditMode({ ...editMode, Personal: !editMode.Personal })} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">{editMode.Personal ? 'Save Changes' : 'Edit Personal Info'}</button>
            </div>
          </div>
        );
      case 'Employment':
        return (
          <div>
            <div className={commonClasses}>
              <div><label className={labelClasses}>State</label><input type="text" value={userData.employmentDetails.state} disabled={true} className={inputClasses} /></div>
              <div><label className={labelClasses}>District</label><input type="text" value={userData.employmentDetails.district} disabled={true} className={inputClasses} /></div>
              <div><label className={labelClasses}>Department</label><input type="text" value={userData.employmentDetails.department} disabled={true} className={inputClasses} /></div>
              <div><label className={labelClasses}>Designation</label><input type="text" value={userData.employmentDetails.designation} disabled={true} className={inputClasses} /></div>
              <div><label className={labelClasses}>Date of Joining</label><input type="date" value={userData.employmentDetails.dateOfJoining} disabled={true} className={inputClasses} /></div>
            </div>
            <div className="mt-6">
              <button onClick={() => setEditMode({ ...editMode, Employment: !editMode.Employment })} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">{editMode.Employment ? 'Save Changes' : 'Edit Employment Info'}</button>
            </div>
          </div>
        );
      case 'Bank':
        return (
          <div>
            <div className={commonClasses}>
              <div><label className={labelClasses}>Bank Name</label><input type="text" value={userData.bankDetails.bankName} disabled={!editMode.Bank} className={inputClasses} /></div>
              <div><label className={labelClasses}>Account Number</label><input type="text" value={userData.bankDetails.accountNumber} disabled={!editMode.Bank} className={inputClasses} /></div>
              <div><label className={labelClasses}>IFSC Code</label><input type="text" value={userData.bankDetails.ifscCode} disabled={!editMode.Bank} className={inputClasses} /></div>
            </div>
            <div className="mt-6">
              <button onClick={() => setEditMode({ ...editMode, Bank: !editMode.Bank })} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">{editMode.Bank ? 'Save Changes' : 'Edit Bank Info'}</button>
            </div>
          </div>
        );
      case 'Nominees':
        return (
          <div>
            <h3 className="text-xl font-bold text-gray-800">My Nominees ({nominees.length}/2)</h3>
            <div className="mt-4 space-y-4">
              {nominees.map(n => (
                <div key={n._id} className="bg-gray-50 p-4 rounded-lg border flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{n.name} <span className="text-xs text-gray-500">({n.relation})</span></p>
                    <p className="text-sm text-gray-500">Aadhaar: {n.aadhaarNumber}</p>
                    {n.isPrimary && <span className="text-xs font-semibold text-teal-600">Primary Nominee</span>}
                  </div>
                  <button onClick={() => handleDeleteNominee(n._id)} className="text-red-500 hover:text-red-700">Delete</button>
                </div>
              ))}
            </div>
            {nominees.length < 2 && (
              <div className="mt-6 p-6 border rounded-lg">
                <h4 className="font-semibold text-lg mb-4">Add a New Nominee</h4>
                <form onSubmit={handleAddNominee} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className={labelClasses}>Name</label><input type="text" value={newNominee.name} onChange={e => setNewNominee({ ...newNominee, name: e.target.value })} required className={inputClasses} /></div>
                  <div><label className={labelClasses}>Relation</label><input type="text" value={newNominee.relation} onChange={e => setNewNominee({ ...newNominee, relation: e.target.value })} required className={inputClasses} /></div>
                  <div><label className={labelClasses}>Date of Birth</label><input type="date" value={newNominee.dateOfBirth} onChange={e => setNewNominee({ ...newNominee, dateOfBirth: e.target.value })} required className={inputClasses} /></div>
                  <div><label className={labelClasses}>Aadhaar</label><input type="text" value={newNominee.aadhaarNumber} onChange={e => setNewNominee({ ...newNominee, aadhaarNumber: e.target.value })} className={inputClasses} /></div>
                  <div className="flex items-center mt-4">
                    <input type="checkbox" checked={newNominee.isPrimary} onChange={e => setNewNominee({ ...newNominee, isPrimary: e.target.checked })} className="rounded text-teal-600 focus:ring-teal-500" />
                    <span className="ml-2 text-sm text-gray-700">Set as Primary</span>
                  </div>
                  <button type="submit" className="md:col-span-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">Add Nominee</button>
                </form>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl border border-gray-200 p-8">
        <h1 className="text-3xl font-extrabold text-center text-teal-700">My Profile</h1>
        <div className="mt-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex flex-wrap space-x-4 sm:space-x-8">
              {['Personal', 'Employment', 'Bank', 'Nominees'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                    ${activeTab === tab ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
          <div className="mt-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
