import { useEffect, useState, useCallback } from 'react';
// Import the real API functions (assuming they are now in lib/api/profile)
import { 
    fetchUserData, 
    updateProfile, 
    getMyNominees, 
    addNominee, 
    deleteNominee 
} from '../lib/api/profile'; // ADJUST PATH AS NEEDED
import { updateNominee } from '../lib/api/profile';

const Profile = () => {
    const [activeTab, setActiveTab] = useState('Personal');
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState({
        personalDetails: {},
        employmentDetails: {},
        bankDetails: {},
    });
    const [nominees, setNominees] = useState([]);
    const [editingNomineeId, setEditingNomineeId] = useState(null);
    const [editingNomineeLocal, setEditingNomineeLocal] = useState(null);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null); 
    
    const [localPersonalDetails, setLocalPersonalDetails] = useState({});
    const [localBankDetails, setLocalBankDetails] = useState({});

    const [editMode, setEditMode] = useState({ Personal: false, Employment: false, Bank: false });
    
    const [newNominee, setNewNominee] = useState({ 
        name: '', 
        relation: '', 
        dateOfBirth: '', 
        aadhaarNumber: '', 
        isPrimary: false,
        bankDetails: {
            accountNumber: '',
            confirmAccountNumber: '',
            ifscCode: '',
            bankName: '',
            branchName: '',
        }
    });

    const clearMessages = useCallback(() => {
        setError(null);
        setSuccessMessage(null);
    }, []);

    // Relation dropdown options for nominees
    const RELATION_OPTIONS = [
        'Spouse',
        'Son',
        'Daughter',
        'Father',
        'Mother',
        'Brother',
        'Sister',
        'Other'
    ];

    useEffect(() => {
        clearMessages();
        const fetchData = async () => {
            try {
                const user = await fetchUserData();
                const noms = await getMyNominees();

                setUserData(user);
                setLocalPersonalDetails(user.personalDetails || {});
                setLocalBankDetails(user.bankDetails || {});
                setNominees(noms);
            } catch (err) {
                console.error("Fetch Data Error:", err);
                setError('Failed to load profile data.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [clearMessages]);

    const handleLocalChange = (tab, field, value) => {
        if (tab === 'Personal') {
            setLocalPersonalDetails(prev => ({ ...prev, [field]: value }));
        } else if (tab === 'Bank') {
            setLocalBankDetails(prev => ({ ...prev, [field]: value }));
        }
    };
    
    const handleNewNomineeChange = (field, value, isBankDetail = false) => {
        if (isBankDetail) {
            setNewNominee(prev => ({ 
                ...prev, 
                bankDetails: { ...prev.bankDetails, [field]: value }
            }));
        } else {
            setNewNominee(prev => ({ ...prev, [field]: value }));
        }
    };


    const handleUpdate = async (tab) => {
        clearMessages();
        
        let section;
        let dataToSave;
        
        if (tab === 'Personal') {
            section = 'personal';
            dataToSave = { 
                phone: localPersonalDetails.phone, 
                email: localPersonalDetails.email 
            };
        } else if (tab === 'Bank') {
            section = 'bank';
            dataToSave = localBankDetails;
        } else {
            return;
        }

        try {
            const res = await updateProfile(section, dataToSave);
            
            setUserData(prev => ({ 
                ...prev, 
                [`${section}Details`]: {...prev[`${section}Details`], ...dataToSave}
            }));

            setEditMode(prev => ({ ...prev, [tab]: false }));
            setSuccessMessage(res.message || `${tab} details updated successfully.`);
        } catch (err) {
            console.error("Update Error:", err);
            if (tab === 'Personal') setLocalPersonalDetails(userData.personalDetails);
            if (tab === 'Bank') setLocalBankDetails(userData.bankDetails);
            
            setError('Failed to update profile.');
        }
    };

    const handleAddNominee = async (e) => {
        e.preventDefault();
        clearMessages();
        
        // Frontend validation for required fields
        const requiredFields = [
            newNominee.name, 
            newNominee.relation, 
            newNominee.dateOfBirth, 
            newNominee.aadhaarNumber,
            newNominee.bankDetails.accountNumber,
            newNominee.bankDetails.ifscCode,
            newNominee.bankDetails.bankName,
        ];

        if (requiredFields.some(field => !field || field.length === 0)) {
            setError('Please fill all required nominee and bank details fields (Name, Relation, DOB, Aadhaar, Bank Name, A/C No, IFSC).');
            return;
        }
        // Ensure account numbers match
        if (newNominee.bankDetails.accountNumber !== newNominee.bankDetails.confirmAccountNumber) {
            setError('Nominee account number and confirmation do not match.');
            return;
        }
        
        try {
            const addedNominee = await addNominee(newNominee); 
            setNominees([...nominees, addedNominee]);
            
            // Reset new nominee form
            setNewNominee({ 
                name: '', 
                relation: '', 
                dateOfBirth: '', 
                aadhaarNumber: '', 
                isPrimary: false,
                bankDetails: { accountNumber: '', ifscCode: '', bankName: '', branchName: '' }
            });

            setSuccessMessage('Nominee added successfully.');
        } catch (err) {
            console.error("Add Nominee Error:", err);
            
            // 🎯 UPDATED ERROR HANDLING: Extract the specific message from the error object
            // The message often contains all validation failures.
            const errorMessage = err.message || 'An unknown error occurred while adding the nominee.';
            
            setError(`Failed to add nominee: ${errorMessage}`);
        }
    };

    const startEditNominee = (nominee) => {
        setEditingNomineeId(nominee._id);
        // Make a shallow copy of nominee for local edits
        const localCopy = JSON.parse(JSON.stringify(nominee));
        // Prefill confirm field so UI shows matching value by default
        if (!localCopy.bankDetails) localCopy.bankDetails = {};
        localCopy.bankDetails.confirmAccountNumber = localCopy.bankDetails.accountNumber || '';
        setEditingNomineeLocal(localCopy);
        clearMessages();
    };

    const cancelEditNominee = () => {
        setEditingNomineeId(null);
        setEditingNomineeLocal(null);
        clearMessages();
    };

    const handleEditingNomineeChange = (field, value, isBankDetail = false) => {
        if (!editingNomineeLocal) return;
        if (isBankDetail) {
            setEditingNomineeLocal(prev => ({ ...prev, bankDetails: { ...prev.bankDetails, [field]: value } }));
        } else {
            setEditingNomineeLocal(prev => ({ ...prev, [field]: value }));
        }
    };

    const saveEditedNominee = async () => {
        if (!editingNomineeLocal || !editingNomineeId) return;
        clearMessages();
        // Validate account confirmation if present
        const acc = editingNomineeLocal.bankDetails?.accountNumber;
        const accConfirm = editingNomineeLocal.bankDetails?.confirmAccountNumber;
        if (acc || accConfirm) {
            if (String(acc || '') !== String(accConfirm || '')) {
                setError('Nominee account number and confirmation do not match.');
                return;
            }
        }
        try {
            const updated = await updateNominee(editingNomineeId, editingNomineeLocal);
            setNominees(prev => prev.map(n => (n._id === editingNomineeId ? updated : n)));
            setSuccessMessage('Nominee updated successfully.');
            setEditingNomineeId(null);
            setEditingNomineeLocal(null);
        } catch (err) {
            console.error('Update Nominee Error:', err);
            // Prefer server-provided message if present (common pattern: { message, errors })
            const serverMessage = err?.response?.data?.message;
            const serverErrors = err?.response?.data?.errors;
            const errorMessage = serverMessage || err.message || 'Failed to update nominee.';

            // If there are structured validation errors, append a compact summary
            let validationSummary = '';
            if (serverErrors && typeof serverErrors === 'object') {
                try {
                    // serverErrors may be an array or object; generate a short joined summary
                    if (Array.isArray(serverErrors)) {
                        validationSummary = serverErrors.map(e => e.msg || e.message || JSON.stringify(e)).join('; ');
                    } else {
                        validationSummary = Object.values(serverErrors).flat().map(e => e.msg || e.message || JSON.stringify(e)).join('; ');
                    }
                } catch (e) {
                    validationSummary = '';
                }
            }

            setError(`Failed to update nominee: ${errorMessage}${validationSummary ? ' — ' + validationSummary : ''}`);
        }
    };

    const handleDeleteNominee = async (id) => {
        clearMessages();
        try {
            const res = await deleteNominee(id); 
            setNominees(nominees.filter(n => n._id !== id));
            setSuccessMessage(res.message || 'Nominee deleted successfully.');
        } catch (err) {
            console.error("Delete Nominee Error:", err);
            setError('Failed to delete nominee.');
        }
    };

    if (loading) return <div className="text-center py-12">Loading profile...</div>;

    // Aadhaar helpers (used to show masked number and image if available)
    const aadhaarNumber = userData?.personalDetails?.aadhaarNumber;
    const aadhaarMasked = aadhaarNumber ? `xxxx-xxxx-${String(aadhaarNumber).slice(-4)}` : null;
    const aadhaarUrl = userData?.personalDetails?.aadhaarUrl;

    const getDetails = (tab) => {
        if (tab === 'Personal') return editMode.Personal ? localPersonalDetails : userData.personalDetails;
        if (tab === 'Bank') return editMode.Bank ? localBankDetails : userData.bankDetails;
        if (tab === 'Employment') return userData.employmentDetails;
        return {};
    };

    const renderContent = () => {
        const commonClasses = "mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4";
        const labelClasses = "block text-sm font-medium text-gray-700";
        const inputClasses = "mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm disabled:bg-gray-100 disabled:cursor-not-allowed";

        const personalDetails = getDetails('Personal');
        const bankDetails = getDetails('Bank');
        const employmentDetails = getDetails('Employment'); 

        switch (activeTab) {
            case 'Personal':
                return (
                    <div>
                        <div className={commonClasses}>
                            <div><label className={labelClasses}>Full Name</label><input type="text" value={userData.personalDetails?.fullName || ''} disabled={true} className={inputClasses} /></div>
                            <div><label className={labelClasses}>Date of Birth</label><input type="date" value={userData.personalDetails?.dateOfBirth || ''} disabled={true} className={inputClasses} /></div>
                            <div><label className={labelClasses}>Sex</label><input type="text" value={userData.personalDetails?.sex || ''} disabled={true} className={inputClasses} /></div>
                            <div><label className={labelClasses}>Aadhaar Number</label><input type="text" value={userData.personalDetails?.aadhaarNumber || ''} disabled={true} className={inputClasses} /></div>
                            
                            <div><label className={labelClasses}>Phone</label><input type="text" value={personalDetails.phone || ''} disabled={!editMode.Personal} onChange={e => handleLocalChange('Personal', 'phone', e.target.value)} className={inputClasses} /></div>
                            <div><label className={labelClasses}>Email</label><input type="email" value={personalDetails.email || ''} disabled={!editMode.Personal} onChange={e => handleLocalChange('Personal', 'email', e.target.value)} className={inputClasses} /></div>
                        </div>
                        <div className="mt-6">
                            <button 
                                onClick={() => editMode.Personal ? handleUpdate('Personal') : setEditMode({ ...editMode, Personal: true })} 
                                className={`px-4 py-2 text-white rounded-lg transition-colors ${editMode.Personal ? 'bg-green-600 hover:bg-green-700' : 'bg-teal-600 hover:bg-teal-700'}`}
                            >
                                {editMode.Personal ? 'Save Changes' : 'Edit Personal Info'}
                            </button>
                        </div>
                    </div>
                );
            case 'Employment':
                return (
                    <div>
                        <div className={commonClasses}>
                            <div><label className={labelClasses}>State</label><input type="text" value={employmentDetails.state || ''} disabled={true} className={inputClasses} /></div>
                            <div><label className={labelClasses}>District</label><input type="text" value={employmentDetails.district || ''} disabled={true} className={inputClasses} /></div>
                            <div><label className={labelClasses}>Department</label><input type="text" value={employmentDetails.department || ''} disabled={true} className={inputClasses} /></div>
                            <div><label className={labelClasses}>Designation</label><input type="text" value={employmentDetails.designation || ''} disabled={true} className={inputClasses} /></div>
                            <div><label className={labelClasses}>Date of Joining</label><input type="date" value={employmentDetails.dateOfJoining || ''} disabled={true} className={inputClasses} /></div>
                        </div>
                        <div className="mt-6">
                            <button disabled={true} className="px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed">Employment Info is Read-Only</button>
                        </div>
                    </div>
                );
            case 'Bank':
                return (
                    <div>
                        <div className={commonClasses}>
                            <div><label className={labelClasses}>Bank Name</label><input type="text" value={bankDetails.bankName || ''} disabled={!editMode.Bank} onChange={e => handleLocalChange('Bank', 'bankName', e.target.value)} className={inputClasses} /></div>
                            <div><label className={labelClasses}>Account Number</label><input type="text" value={bankDetails.accountNumber || ''} disabled={!editMode.Bank} onChange={e => handleLocalChange('Bank', 'accountNumber', e.target.value)} className={inputClasses} /></div>
                            <div><label className={labelClasses}>IFSC Code</label><input type="text" value={bankDetails.ifscCode || ''} disabled={!editMode.Bank} onChange={e => handleLocalChange('Bank', 'ifscCode', e.target.value)} className={inputClasses} /></div>
                        </div>
                        <div className="mt-6">
                            <button 
                                onClick={() => editMode.Bank ? handleUpdate('Bank') : setEditMode({ ...editMode, Bank: true })} 
                                className={`px-4 py-2 text-white rounded-lg transition-colors ${editMode.Bank ? 'bg-green-600 hover:bg-green-700' : 'bg-teal-600 hover:bg-teal-700'}`}
                            >
                                {editMode.Bank ? 'Save Changes' : 'Edit Bank Info'}
                            </button>
                        </div>
                    </div>
                );
            case 'Nominees':
                return (
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">My Nominees ({nominees.length}/2)</h3>
                        <div className="mt-4 space-y-4">
                            {nominees.map(n => (
                                <div key={n._id} className="bg-gray-50 p-4 rounded-lg border">
                                    {editingNomineeId === n._id ? (
                                        <div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className={labelClasses}>Name</label>
                                                    <input className={inputClasses} value={editingNomineeLocal.name || ''} onChange={e => handleEditingNomineeChange('name', e.target.value)} />
                                                </div>
                                                <div>
                                                    <label className={labelClasses}>Relation</label>
                                                    <select className={inputClasses} value={editingNomineeLocal.relation || ''} onChange={e => handleEditingNomineeChange('relation', e.target.value)}>
                                                        <option value="">Select relation</option>
                                                        {RELATION_OPTIONS.map(opt => (
                                                            <option key={opt} value={opt}>{opt}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className={labelClasses}>Date of Birth</label>
                                                    <input type="date" className={inputClasses} value={editingNomineeLocal.dateOfBirth || ''} onChange={e => handleEditingNomineeChange('dateOfBirth', e.target.value)} />
                                                </div>
                                                <div>
                                                    <label className={labelClasses}>Aadhaar</label>
                                                    <input className={inputClasses} value={editingNomineeLocal.aadhaarNumber || ''} onChange={e => handleEditingNomineeChange('aadhaarNumber', e.target.value)} />
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <h5 className="font-medium mb-2">Bank Details</h5>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className={labelClasses}>Bank Name</label>
                                                        <input className={inputClasses} value={editingNomineeLocal.bankDetails?.bankName || ''} onChange={e => handleEditingNomineeChange('bankName', e.target.value, true)} />
                                                    </div>
                                                    <div>
                                                        <label className={labelClasses}>Account Number</label>
                                                        <input className={inputClasses} value={editingNomineeLocal.bankDetails?.accountNumber || ''} onChange={e => handleEditingNomineeChange('accountNumber', e.target.value, true)} />
                                                    </div>
                                                    <div>
                                                        <label className={labelClasses}>Confirm A/C Number</label>
                                                        <input className={inputClasses} value={editingNomineeLocal.bankDetails?.confirmAccountNumber || ''} onChange={e => handleEditingNomineeChange('confirmAccountNumber', e.target.value, true)} />
                                                    </div>
                                                    <div>
                                                        <label className={labelClasses}>IFSC Code</label>
                                                        <input className={inputClasses} value={editingNomineeLocal.bankDetails?.ifscCode || ''} onChange={e => handleEditingNomineeChange('ifscCode', e.target.value, true)} />
                                                    </div>
                                                    <div>
                                                        <label className={labelClasses}>Branch Name</label>
                                                        <input className={inputClasses} value={editingNomineeLocal.bankDetails?.branchName || ''} onChange={e => handleEditingNomineeChange('branchName', e.target.value, true)} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-4 flex gap-3">
                                                <button onClick={saveEditedNominee} className="px-4 py-2 bg-green-600 text-white rounded-lg">Save</button>
                                                <button onClick={cancelEditNominee} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold">{n.name} <span className="text-xs text-gray-500">({n.relation})</span></p>
                                                    <p className="text-sm text-gray-500">Aadhaar: {n.aadhaarNumber}</p>
                                                    {n.isPrimary && <span className="text-xs font-semibold text-teal-600">Primary Nominee</span>}
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <button onClick={() => startEditNominee(n)} className="text-sm text-teal-600 hover:text-teal-800">Edit</button>
                                                    <button onClick={() => handleDeleteNominee(n._id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                                                </div>
                                            </div>
                                            {n.bankDetails && (
                                                <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-600">
                                                    <p className="font-medium">Bank: {n.bankDetails.bankName} {n.bankDetails.branchName ? `(${n.bankDetails.branchName})` : ''}</p>
                                                    <p>A/C No: {n.bankDetails.accountNumber} | IFSC: {n.bankDetails.ifscCode}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        {nominees.length < 2 && (
                            <div className="mt-6 p-6 border rounded-lg">
                                <h4 className="font-semibold text-lg mb-4">Add a New Nominee</h4>
                                <form onSubmit={handleAddNominee}>
                                    <h5 className="font-medium mb-2 text-gray-700">Nominee Details</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div><label className={labelClasses}>Name*</label><input type="text" value={newNominee.name} onChange={e => handleNewNomineeChange('name', e.target.value)} required className={inputClasses} /></div>
                                        <div>
                                            <label className={labelClasses}>Relation*</label>
                                            <select required className={inputClasses} value={newNominee.relation} onChange={e => handleNewNomineeChange('relation', e.target.value)}>
                                                <option value="">Select relation</option>
                                                {RELATION_OPTIONS.map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div><label className={labelClasses}>Date of Birth*</label><input type="date" value={newNominee.dateOfBirth} onChange={e => handleNewNomineeChange('dateOfBirth', e.target.value)} required className={inputClasses} /></div>
                                        <div><label className={labelClasses}>Aadhaar*</label><input type="text" value={newNominee.aadhaarNumber} onChange={e => handleNewNomineeChange('aadhaarNumber', e.target.value)} required className={inputClasses} /></div>
                                    </div>
                                    
                                    <h5 className="font-medium mb-2 mt-4 text-gray-700">Bank Details (Nominee's Account)</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div><label className={labelClasses}>Bank Name*</label><input type="text" value={newNominee.bankDetails.bankName} onChange={e => handleNewNomineeChange('bankName', e.target.value, true)} required className={inputClasses} /></div>
                                        <div>
                                            <label className={labelClasses}>A/C Number*</label>
                                            <input type="text" value={newNominee.bankDetails.accountNumber} onChange={e => handleNewNomineeChange('accountNumber', e.target.value, true)} required className={inputClasses} />
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Confirm A/C Number*</label>
                                            <input type="text" value={newNominee.bankDetails.confirmAccountNumber || ''} onChange={e => handleNewNomineeChange('confirmAccountNumber', e.target.value, true)} required className={inputClasses} />
                                        </div>
                                        <div><label className={labelClasses}>IFSC Code*</label><input type="text" value={newNominee.bankDetails.ifscCode} onChange={e => handleNewNomineeChange('ifscCode', e.target.value, true)} required className={inputClasses} /></div>
                                        <div><label className={labelClasses}>Branch Name</label><input type="text" value={newNominee.bankDetails.branchName} onChange={e => handleNewNomineeChange('branchName', e.target.value, true)} className={inputClasses} /></div>
                                    </div>

                                    <div className="flex items-center mt-6 mb-4">
                                        <input type="checkbox" checked={newNominee.isPrimary} onChange={e => handleNewNomineeChange('isPrimary', e.target.checked)} className="rounded text-teal-600 focus:ring-teal-500" />
                                        <span className="ml-2 text-sm text-gray-700">Set as Primary</span>
                                    </div>

                                    <button type="submit" className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">Add Nominee</button>
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
                <div className="flex items-center justify-center gap-6">
                    <div className="flex items-center gap-4">
                        <img
                            src={userData?.photoUrl || userData?.personalDetails?.photoUrl || 'https://placehold.co/100x100/5eead4/115e59?text=User'}
                            alt={userData?.personalDetails?.fullName || 'Profile'}
                            className="h-20 w-20 rounded-full object-cover border-4 border-white/40 shadow-lg"
                        />
                        <div className="text-left">
                            <h1 className="text-3xl font-extrabold text-teal-700">My Profile</h1>
                            <p className="text-sm text-gray-600 mt-1">{userData?.personalDetails?.fullName}</p>
                        </div>
                    </div>

                    {/* Aadhaar display */}
                    <div className="ml-auto flex items-center gap-3">
                        {aadhaarUrl ? (
                            <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg border">
                                <img src={aadhaarUrl} alt="Aadhaar" className="h-24 w-36 object-cover rounded-md border" />
                                <div>
                                    <p className="text-xs text-gray-500">Aadhaar</p>
                                    <p className="font-medium">{aadhaarMasked || '—'}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg border text-gray-400">
                                <div className="h-24 w-36 bg-gray-200 rounded-md flex items-center justify-center">No Aadhaar</div>
                                <div>
                                    <p className="text-xs">Aadhaar</p>
                                    <p className="text-sm">Not provided</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Error and Success Messages */}
                {error && (
                    <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg" role="alert">
                        <p className="font-semibold">Error:</p> {error}
                    </div>
                )}
                {successMessage && (
                    <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg" role="alert">
                        {successMessage}
                    </div>
                )}
                
                <div className="mt-8">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex flex-wrap space-x-4 sm:space-x-8">
                            {['Personal', 'Employment', 'Bank', 'Nominees'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => { setActiveTab(tab); clearMessages(); }}
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