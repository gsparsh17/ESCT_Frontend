import { useEffect, useState, useCallback } from 'react';
import { 
    fetchUserData, 
    updateProfile, 
    getMyNominees, 
    addNominee, 
    deleteNominee 
} from '../lib/api/profile';
import { updateNominee } from '../lib/api/profile';

const Profile = () => {
    const [activeTab, setActiveTab] = useState('Personal');
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState({
        personalDetails: {},
        employmentDetails: {},
        bankDetails: {},
        isVerified: false
    });
    const [nominees, setNominees] = useState([]);
    const [editingNomineeId, setEditingNomineeId] = useState(null);
    const [editingNomineeLocal, setEditingNomineeLocal] = useState(null);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null); 
    
    const [localPersonalDetails, setLocalPersonalDetails] = useState({});
    const [localBankDetails, setLocalBankDetails] = useState({});
    const [localEmploymentDetails, setLocalEmploymentDetails] = useState({});

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
        },
        // Add file states for new nominee
        aadhaarFront: null,
        aadhaarBack: null
    });

    const [uploadingFiles, setUploadingFiles] = useState({
        profilePhoto: false,
        aadhaarFront: false,
        aadhaarBack: false,
        newNominee: false,
        editingNominee: false
    });

    const clearMessages = useCallback(() => {
        setError(null);
        setSuccessMessage(null);
    }, []);

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
                setLocalEmploymentDetails(user.employmentDetails || {});
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

    // Check if user can edit based on verification status
    const canEditPersonal = !userData.isVerified;
    const canEditEmployment = !userData.isVerified;
    const canEditBank = true;
    const canEditNominees = true;

    const handleLocalChange = (tab, field, value) => {
        if (tab === 'Personal') {
            setLocalPersonalDetails(prev => ({ ...prev, [field]: value }));
        } else if (tab === 'Bank') {
            setLocalBankDetails(prev => ({ ...prev, [field]: value }));
        }
        else if (tab === 'Employment') {
            setLocalEmploymentDetails(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleFileUpload = async (file, fileType) => {
        if (!file || !canEditPersonal) return null;
        
        setUploadingFiles(prev => ({ ...prev, [fileType]: true }));
        try {
            const formData = new FormData();
            formData.append(fileType, file);
            
            const response = await updateProfile(formData);
            
            // Handle response based on file type with new field names
            if (fileType === 'profilePhoto' && response.data.photoUrl) {
                return response.data.photoUrl;
            } else if (fileType === 'aadhaarFront' && response.data.personalDetails?.aadhaarFrontUrl) {
                return response.data.personalDetails.aadhaarFrontUrl;
            } else if (fileType === 'aadhaarBack' && response.data.personalDetails?.aadhaarBackUrl) {
                return response.data.personalDetails.aadhaarBackUrl;
            }
            
            return null;
        } catch (err) {
            console.error(`File upload error for ${fileType}:`, err);
            setError(`Failed to upload ${fileType}`);
            return null;
        } finally {
            setUploadingFiles(prev => ({ ...prev, [fileType]: false }));
        }
    };

    const handleProfilePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (file && canEditPersonal) {
            const photoUrl = await handleFileUpload(file, 'profilePhoto');
            if (photoUrl) {
                setUserData(prev => ({ ...prev, photoUrl }));
                setSuccessMessage('Profile photo updated successfully.');
            }
        }
    };

    const handleAadhaarFrontChange = async (e) => {
        const file = e.target.files[0];
        if (file && canEditPersonal) {
            const aadhaarFrontUrl = await handleFileUpload(file, 'aadhaarFront');
            if (aadhaarFrontUrl) {
                setUserData(prev => ({ 
                    ...prev, 
                    personalDetails: { ...prev.personalDetails, aadhaarFrontUrl } 
                }));
                setSuccessMessage('Aadhaar front updated successfully.');
            }
        }
    };

    const handleAadhaarBackChange = async (e) => {
        const file = e.target.files[0];
        if (file && canEditPersonal) {
            const aadhaarBackUrl = await handleFileUpload(file, 'aadhaarBack');
            if (aadhaarBackUrl) {
                setUserData(prev => ({ 
                    ...prev, 
                    personalDetails: { ...prev.personalDetails, aadhaarBackUrl } 
                }));
                setSuccessMessage('Aadhaar back updated successfully.');
            }
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

    // Handle file upload for new nominee
    const handleNewNomineeFileChange = (fileType, files) => {
        setNewNominee(prev => ({ ...prev, [fileType]: files }));
    };

    // Handle file upload for editing nominee
    const handleEditingNomineeFileChange = (fileType, files) => {
        if (!editingNomineeLocal) return;
        setEditingNomineeLocal(prev => ({ ...prev, [fileType]: files }));
    };

const handleAddNominee = async (e) => {
    e.preventDefault();
    clearMessages();
    
    // Frontend validation for required fields
    const requiredFields = [
        newNominee.name, 
        newNominee.relation,
    ];

    if (requiredFields.some(field => !field || field.length === 0)) {
        setError('Please fill all required nominee fields (Name, Relation).');
        return;
    }
    
    setUploadingFiles(prev => ({ ...prev, newNominee: true }));
    
    try {
        const formData = new FormData();
        
        // Append basic nominee data
        formData.append('name', newNominee.name);
        formData.append('relation', newNominee.relation);
        if (newNominee.dateOfBirth) formData.append('dateOfBirth', newNominee.dateOfBirth);
        if (newNominee.aadhaarNumber) formData.append('aadhaarNumber', newNominee.aadhaarNumber);
        formData.append('isPrimary', newNominee.isPrimary);
        
        // Append bank details as a JSON string (like registration does)
        const bankDetails = {
            accountNumber: newNominee.bankDetails.accountNumber,
            ifscCode: newNominee.bankDetails.ifscCode,
            bankName: newNominee.bankDetails.bankName,
            branchName: newNominee.bankDetails.branchName,
        };
        formData.append('bankDetails', JSON.stringify(bankDetails));
        
        if (newNominee.aadhaarFront && newNominee.aadhaarFront[0]) {
            formData.append('nomineeAadhaarFront_0', newNominee.aadhaarFront[0]);
        }
        if (newNominee.aadhaarBack && newNominee.aadhaarBack[0]) {
            formData.append('nomineeAadhaarBack_0', newNominee.aadhaarBack[0]);
        }
        
        // Debug: Check FormData contents
        console.log('FormData entries:');
        for (let [key, value] of formData.entries()) {
            console.log(key, value);
        }
        
        const addedNominee = await addNominee(formData); 
        setNominees([...nominees, addedNominee]);
        
        // Reset new nominee form
        setNewNominee({ 
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
                branchName: '' 
            },
            aadhaarFront: null,
            aadhaarBack: null
        });

        setSuccessMessage('Nominee added successfully.');
    } catch (err) {
        console.error("Add Nominee Error:", err);
        const errorMessage = err.message || 'An unknown error occurred while adding the nominee.';
        setError(`Failed to add nominee: ${errorMessage}`);
    } finally {
        setUploadingFiles(prev => ({ ...prev, newNominee: false }));
    }
};

    const startEditNominee = (nominee) => {
        setEditingNomineeId(nominee._id);
        const localCopy = JSON.parse(JSON.stringify(nominee));
        if (!localCopy.bankDetails) localCopy.bankDetails = {};
        localCopy.bankDetails.confirmAccountNumber = localCopy.bankDetails.accountNumber || '';
        // Initialize file states for editing
        localCopy.aadhaarFront = null;
        localCopy.aadhaarBack = null;
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
        
        const acc = editingNomineeLocal.bankDetails?.accountNumber;
        const accConfirm = editingNomineeLocal.bankDetails?.confirmAccountNumber;
        if (acc || accConfirm) {
            if (String(acc || '') !== String(accConfirm || '')) {
                setError('Nominee account number and confirmation do not match.');
                return;
            }
        }
        
        setUploadingFiles(prev => ({ ...prev, editingNominee: true }));
        
        try {
            const formData = new FormData();
            
            // Append basic nominee data as individual fields
            formData.append('name', editingNomineeLocal.name);
            formData.append('relation', editingNomineeLocal.relation);
            if (editingNomineeLocal.dateOfBirth) formData.append('dateOfBirth', editingNomineeLocal.dateOfBirth);
            if (editingNomineeLocal.aadhaarNumber) formData.append('aadhaarNumber', editingNomineeLocal.aadhaarNumber);
            formData.append('isPrimary', editingNomineeLocal.isPrimary);
            
            // Append bank details as individual fields
            if (editingNomineeLocal.bankDetails?.bankName) formData.append('bankDetails[bankName]', editingNomineeLocal.bankDetails.bankName);
            if (editingNomineeLocal.bankDetails?.accountNumber) formData.append('bankDetails[accountNumber]', editingNomineeLocal.bankDetails.accountNumber);
            if (editingNomineeLocal.bankDetails?.ifscCode) formData.append('bankDetails[ifscCode]', editingNomineeLocal.bankDetails.ifscCode);
            if (editingNomineeLocal.bankDetails?.branchName) formData.append('bankDetails[branchName]', editingNomineeLocal.bankDetails.branchName);
            
            // Append files if they exist
            if (editingNomineeLocal.aadhaarFront && editingNomineeLocal.aadhaarFront[0]) {
            formData.append('aadhaarFront', editingNomineeLocal.aadhaarFront[0]);
        }
        if (editingNomineeLocal.aadhaarBack && editingNomineeLocal.aadhaarBack[0]) {
            formData.append('aadhaarBack', editingNomineeLocal.aadhaarBack[0]);
        }

            const updated = await updateNominee(editingNomineeId, formData);
            setNominees(prev => prev.map(n => (n._id === editingNomineeId ? updated : n)));
            setSuccessMessage('Nominee updated successfully.');
            setEditingNomineeId(null);
            setEditingNomineeLocal(null);
        } catch (err) {
            console.error('Update Nominee Error:', err);
            const serverMessage = err?.response?.data?.message;
            const serverErrors = err?.response?.data?.errors;
            const errorMessage = serverMessage || err.message || 'Failed to update nominee.';

            let validationSummary = '';
            if (serverErrors && typeof serverErrors === 'object') {
                try {
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
        } finally {
            setUploadingFiles(prev => ({ ...prev, editingNominee: false }));
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

    const handleUpdate = async (tab) => {
        clearMessages();
        
        let dataToSave = {};
        
        if (tab === 'Personal') {
            if (!canEditPersonal) {
                setError('Personal details cannot be edited after verification.');
                return;
            }
            dataToSave = {
                personalDetails: {
                    ...localPersonalDetails, 
                    phone: localPersonalDetails.phone, 
                    email: localPersonalDetails.email 
                }
            };
        } else if (tab === 'Bank') {
            dataToSave = {
                bankDetails: localBankDetails
            };
        } else if (tab === 'Employment') {
            dataToSave = {
                employmentDetails: localEmploymentDetails
            };
        }

        try {
            const res = await updateProfile(dataToSave);
            
            setUserData(prev => ({ 
                ...prev, 
                ...dataToSave
            }));

            setEditMode(prev => ({ ...prev, [tab]: false }));
            setSuccessMessage(res.message || `${tab} details updated successfully.`);
        } catch (err) {
            console.error("Update Error:", err);
            if (tab === 'Personal') setLocalPersonalDetails(userData.personalDetails);
            if (tab === 'Bank') setLocalBankDetails(userData.bankDetails);
            if (tab === 'Employment') setLocalEmploymentDetails(userData.employmentDetails);
            setError('Failed to update profile.', err.message);
        }
    };

    if (loading) return <div className="text-center py-12">Loading profile...</div>;

    const aadhaarNumber = userData?.personalDetails?.aadhaarNumber;
    const aadhaarMasked = aadhaarNumber ? `xxxx-xxxx-${String(aadhaarNumber).slice(-4)}` : null;
    const aadhaarFrontUrl = userData?.personalDetails?.aadhaarFrontUrl;
    const aadhaarBackUrl = userData?.personalDetails?.aadhaarBackUrl;

    const getDetails = (tab) => {
    if (tab === 'Personal') return editMode.Personal ? localPersonalDetails : userData.personalDetails;
    if (tab === 'Bank') return editMode.Bank ? localBankDetails : userData.bankDetails;
    if (tab === 'Employment') return editMode.Employment ? localEmploymentDetails : userData.employmentDetails; // ✅ Fixed
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
                        {/* Profile Photo Upload */}
                        <div className="mb-6">
                            <label className={labelClasses}>Profile Photo</label>
                            <div className="flex items-center gap-4 mt-2">
                                <img
                                    src={userData?.photoUrl || 'https://placehold.co/100x100/5eead4/115e59?text=G'}
                                    alt="Profile"
                                    className="h-20 w-20 rounded-full object-cover border-2 border-gray-300"
                                />
                                <div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleProfilePhotoChange}
                                        disabled={!canEditPersonal || uploadingFiles.profilePhoto}
                                        className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                                    />
                                    {uploadingFiles.profilePhoto && (
                                        <p className="text-xs text-blue-500 mt-1">Uploading...</p>
                                    )}
                                    {!canEditPersonal && (
                                        <p className="text-xs text-red-500 mt-1">Cannot change after verification</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className={commonClasses}>
                            <div><label className={labelClasses}>Full Name</label><input type="text" value={userData.personalDetails?.fullName || ''} disabled={!editMode.Personal || !canEditPersonal} onChange={e => handleLocalChange('Personal', 'fullName', e.target.value)} className={inputClasses} /></div>
                            <div><label className={labelClasses}>Date of Birth</label><input type="date" value={userData.personalDetails?.dateOfBirth ? userData.personalDetails.dateOfBirth.split('T')[0] : ''} disabled={!editMode.Personal || !canEditPersonal} onChange={e => handleLocalChange('Personal', 'dateOfBirth', e.target.value)} className={inputClasses} /></div>
                            <div><label className={labelClasses}>Sex</label><input type="text" value={userData.personalDetails?.sex || ''} disabled={!editMode.Personal || !canEditPersonal} onChange={e => handleLocalChange('Personal', 'sex', e.target.value)} className={inputClasses} /></div>
                            <div><label className={labelClasses}>Aadhaar Number</label><input type="text" value={userData.personalDetails?.aadhaarNumber || ''} disabled={!editMode.Personal || !canEditPersonal} onChange={e => handleLocalChange('Personal', 'aadhaarNumber', e.target.value)} className={inputClasses} /></div>

                            <div><label className={labelClasses}>Phone</label><input type="text" value={personalDetails.phone || ''} disabled={!editMode.Personal || !canEditPersonal} onChange={e => handleLocalChange('Personal', 'phone', e.target.value)} className={inputClasses} /></div>
                            <div><label className={labelClasses}>Email</label><input type="email" value={personalDetails.email || ''} disabled={!editMode.Personal || !canEditPersonal} onChange={e => handleLocalChange('Personal', 'email', e.target.value)} className={inputClasses} /></div>
                        </div>

                        {/* Aadhaar Document Upload */}
                        <div className="mt-6">
                            <label className={labelClasses}>Aadhaar Documents</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Front Side</label>
                                    {aadhaarFrontUrl ? (
                                        <img src={aadhaarFrontUrl} alt="Aadhaar Front" className="h-32 w-48 object-cover rounded border" />
                                    ) : (
                                        <div className="h-32 w-48 bg-gray-200 rounded flex items-center justify-center text-gray-500">No Aadhaar Front</div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAadhaarFrontChange}
                                        disabled={!canEditPersonal || uploadingFiles.aadhaarFront}
                                        className="mt-2 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                                    />
                                    {uploadingFiles.aadhaarFront && (
                                        <p className="text-xs text-blue-500 mt-1">Uploading...</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Back Side</label>
                                    {aadhaarBackUrl ? (
                                        <img src={aadhaarBackUrl} alt="Aadhaar Back" className="h-32 w-48 object-cover rounded border" />
                                    ) : (
                                        <div className="h-32 w-48 bg-gray-200 rounded flex items-center justify-center text-gray-500">No Aadhaar Back</div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAadhaarBackChange}
                                        disabled={!canEditPersonal || uploadingFiles.aadhaarBack}
                                        className="mt-2 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                                    />
                                    {uploadingFiles.aadhaarBack && (
                                        <p className="text-xs text-blue-500 mt-1">Uploading...</p>
                                    )}
                                </div>
                            </div>
                            {!canEditPersonal && (
                                <p className="text-xs text-red-500 mt-2">Aadhaar documents cannot be changed after verification</p>
                            )}
                        </div>

                        <div className="mt-6">
                            <button 
                                onClick={() => editMode.Personal ? handleUpdate('Personal') : setEditMode({ ...editMode, Personal: true })} 
                                disabled={!canEditPersonal}
                                className={`px-4 py-2 text-white rounded-lg transition-colors ${
                                    !canEditPersonal 
                                        ? 'bg-gray-400 cursor-not-allowed' 
                                        : editMode.Personal 
                                            ? 'bg-green-600 hover:bg-green-700' 
                                            : 'bg-teal-600 hover:bg-teal-700'
                                }`}
                            >
                                {!canEditPersonal ? 'Edit Disabled (Verified)' : editMode.Personal ? 'Save Changes' : 'Edit Personal Info'}
                            </button>
                            {!canEditPersonal && (
                                <p className="text-xs text-red-500 mt-2">Personal details cannot be edited after verification</p>
                            )}
                        </div>
                    </div>
                );

            case 'Employment':
    return (
        <div>
            <div className={commonClasses}>
                <div>
                    <label className={labelClasses}>State</label>
                    <input 
                        type="text" 
                        value={employmentDetails.state || ''} 
                        disabled={!canEditEmployment || !editMode.Employment} // ✅ This is correct
                        onChange={e => handleLocalChange('Employment', 'state', e.target.value)} 
                        className={inputClasses} 
                    />
                </div>
                <div>
                    <label className={labelClasses}>District</label>
                    <input 
                        type="text" 
                        value={employmentDetails.district || ''} 
                        disabled={!canEditEmployment || !editMode.Employment} 
                        onChange={e => handleLocalChange('Employment', 'district', e.target.value)} 
                        className={inputClasses} 
                    />
                </div>
                <div>
                    <label className={labelClasses}>Department</label>
                    <input 
                        type="text" 
                        value={employmentDetails.department || ''} 
                        disabled={!canEditEmployment || !editMode.Employment} 
                        onChange={e => handleLocalChange('Employment', 'department', e.target.value)} 
                        className={inputClasses} 
                    />
                </div>
                <div>
                    <label className={labelClasses}>Designation</label>
                    <input 
                        type="text" 
                        value={employmentDetails.designation || ''} 
                        disabled={!canEditEmployment || !editMode.Employment} 
                        onChange={e => handleLocalChange('Employment', 'designation', e.target.value)} 
                        className={inputClasses} 
                    />
                </div>
                <div>
                    <label className={labelClasses}>Date of Joining</label>
                    <input 
                        type="date" 
                        value={employmentDetails.dateOfJoining ? employmentDetails.dateOfJoining.split('T')[0] : ''}
                        disabled={!canEditEmployment || !editMode.Employment} 
                        onChange={e => handleLocalChange('Employment', 'dateOfJoining', e.target.value)} 
                        className={inputClasses} 
                    />
                </div>
            </div>
            <div className="mt-6">
                <button 
                    disabled={!canEditEmployment}
                    onClick={() => editMode.Employment ? handleUpdate('Employment') : setEditMode({ ...editMode, Employment: true })}
                    className={`px-4 py-2 text-white rounded-lg ${
                        !canEditEmployment 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : editMode.Employment 
                                ? 'bg-green-600 hover:bg-green-700' 
                                : 'bg-teal-600 hover:bg-teal-700'
                    }`}
                >
                    {!canEditEmployment 
                        ? 'Edit Disabled (Verified)' 
                        : editMode.Employment 
                            ? 'Save Changes' 
                            : 'Edit Employment Info'
                    }
                </button>
                {!canEditEmployment && (
                    <p className="text-xs text-red-500 mt-2">Employment details cannot be edited after verification</p>
                )}
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
                                            {/* Nominee Aadhaar Document Uploads for Editing */}
                                            <div className="mb-4">
                                                <label className={labelClasses}>Aadhaar Documents (Optional)</label>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-teal-400 transition-colors">
                                                        <input
                                                            type="file"
                                                            id={`editNomineeAadhaarFront_${n._id}`}
                                                            className="hidden"
                                                            accept="image/jpeg,image/png"
                                                            onChange={(e) => handleEditingNomineeFileChange('aadhaarFront', e.target.files)}
                                                        />
                                                        <label htmlFor={`editNomineeAadhaarFront_${n._id}`} className="cursor-pointer">
                                                            <div className="h-8 w-8 text-gray-400 mx-auto mb-2">📷</div>
                                                            <p className="text-sm font-medium text-gray-700">
                                                                {editingNomineeLocal.aadhaarFront ? editingNomineeLocal.aadhaarFront[0].name : 'Update Aadhaar Front'}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-1">JPEG or PNG (Optional)</p>
                                                        </label>
                                                    </div>
                                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-teal-400 transition-colors">
                                                        <input
                                                            type="file"
                                                            id={`editNomineeAadhaarBack_${n._id}`}
                                                            className="hidden"
                                                            accept="image/jpeg,image/png"
                                                            onChange={(e) => handleEditingNomineeFileChange('aadhaarBack', e.target.files)}
                                                        />
                                                        <label htmlFor={`editNomineeAadhaarBack_${n._id}`} className="cursor-pointer">
                                                            <div className="h-8 w-8 text-gray-400 mx-auto mb-2">📷</div>
                                                            <p className="text-sm font-medium text-gray-700">
                                                                {editingNomineeLocal.aadhaarBack ? editingNomineeLocal.aadhaarBack[0].name : 'Update Aadhaar Back'}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-1">JPEG or PNG (Optional)</p>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div><label className={labelClasses}>Name</label><input className={inputClasses} value={editingNomineeLocal.name || ''} onChange={e => handleEditingNomineeChange('name', e.target.value)} /></div>
                                                <div><label className={labelClasses}>Relation</label><select className={inputClasses} value={editingNomineeLocal.relation || ''} onChange={e => handleEditingNomineeChange('relation', e.target.value)}><option value="">Select relation</option>{RELATION_OPTIONS.map(opt => (<option key={opt} value={opt}>{opt}</option>))}</select></div>
                                                <div><label className={labelClasses}>Date of Birth</label><input type="date" className={inputClasses} value={editingNomineeLocal.dateOfBirth ? editingNomineeLocal.dateOfBirth.split('T')[0] : ''} onChange={e => handleEditingNomineeChange('dateOfBirth', e.target.value)} /></div>
                                                <div><label className={labelClasses}>Aadhaar</label><input className={inputClasses} value={editingNomineeLocal.aadhaarNumber || ''} onChange={e => handleEditingNomineeChange('aadhaarNumber', e.target.value)} /></div>
                                            </div>

                                            <div className="mt-4">
                                                <h5 className="font-medium mb-2">Bank Details</h5>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div><label className={labelClasses}>Bank Name</label><input className={inputClasses} value={editingNomineeLocal.bankDetails?.bankName || ''} onChange={e => handleEditingNomineeChange('bankName', e.target.value, true)} /></div>
                                                    <div><label className={labelClasses}>Account Number</label><input className={inputClasses} value={editingNomineeLocal.bankDetails?.accountNumber || ''} onChange={e => handleEditingNomineeChange('accountNumber', e.target.value, true)} /></div>
                                                    <div><label className={labelClasses}>Confirm A/C Number</label><input className={inputClasses} value={editingNomineeLocal.bankDetails?.confirmAccountNumber || ''} onChange={e => handleEditingNomineeChange('confirmAccountNumber', e.target.value, true)} /></div>
                                                    <div><label className={labelClasses}>IFSC Code</label><input className={inputClasses} value={editingNomineeLocal.bankDetails?.ifscCode || ''} onChange={e => handleEditingNomineeChange('ifscCode', e.target.value, true)} /></div>
                                                    <div><label className={labelClasses}>Branch Name</label><input className={inputClasses} value={editingNomineeLocal.bankDetails?.branchName || ''} onChange={e => handleEditingNomineeChange('branchName', e.target.value, true)} /></div>
                                                </div>
                                            </div>

                                            <div className="mt-4 flex gap-3">
                                                <button 
                                                    onClick={saveEditedNominee} 
                                                    disabled={uploadingFiles.editingNominee}
                                                    className={`px-4 py-2 text-white rounded-lg ${uploadingFiles.editingNominee ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
                                                >
                                                    {uploadingFiles.editingNominee ? 'Saving...' : 'Save'}
                                                </button>
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
                                            
                                            {/* Display existing nominee Aadhaar documents */}
                                            {(n.aadhaarFrontUrl || n.aadhaarBackUrl) && (
                                                <div className="mt-3 pt-3 border-t border-gray-200">
                                                    <p className="text-xs font-medium text-gray-700 mb-2">Aadhaar Documents:</p>
                                                    <div className="flex gap-3">
                                                        {n.aadhaarFrontUrl && (
                                                            <div className="text-center">
                                                                <img src={n.aadhaarFrontUrl} alt="Aadhaar Front" className="h-16 w-24 object-cover rounded border mx-auto" />
                                                                <p className="text-xs text-gray-500 mt-1">Front</p>
                                                            </div>
                                                        )}
                                                        {n.aadhaarBackUrl && (
                                                            <div className="text-center">
                                                                <img src={n.aadhaarBackUrl} alt="Aadhaar Back" className="h-16 w-24 object-cover rounded border mx-auto" />
                                                                <p className="text-xs text-gray-500 mt-1">Back</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                            
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
                                    {/* New Nominee Aadhaar Document Uploads */}
                                    <div className="mb-6">
                                        <h5 className="font-medium mb-2 text-gray-700">Aadhaar Documents (Optional)</h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-teal-400 transition-colors">
                                                <input
                                                    type="file"
                                                    id="newNomineeAadhaarFront"
                                                    className="hidden"
                                                    accept="image/jpeg,image/png"
                                                    onChange={(e) => handleNewNomineeFileChange('aadhaarFront', e.target.files)}
                                                />
                                                <label htmlFor="newNomineeAadhaarFront" className="cursor-pointer">
                                                    <div className="h-8 w-8 text-gray-400 mx-auto mb-2">📷</div>
                                                    <p className="text-sm font-medium text-gray-700">
                                                        {newNominee.aadhaarFront ? newNominee.aadhaarFront[0].name : 'Upload Aadhaar Front'}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">JPEG or PNG (Optional)</p>
                                                </label>
                                            </div>
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-teal-400 transition-colors">
                                                <input
                                                    type="file"
                                                    id="newNomineeAadhaarBack"
                                                    className="hidden"
                                                    accept="image/jpeg,image/png"
                                                    onChange={(e) => handleNewNomineeFileChange('aadhaarBack', e.target.files)}
                                                />
                                                <label htmlFor="newNomineeAadhaarBack" className="cursor-pointer">
                                                    <div className="h-8 w-8 text-gray-400 mx-auto mb-2">📷</div>
                                                    <p className="text-sm font-medium text-gray-700">
                                                        {newNominee.aadhaarBack ? newNominee.aadhaarBack[0].name : 'Upload Aadhaar Back'}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">JPEG or PNG (Optional)</p>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <h5 className="font-medium mb-2 text-gray-700">Nominee Details</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div><label className={labelClasses}>Name*</label><input type="text" value={newNominee.name} onChange={e => handleNewNomineeChange('name', e.target.value)} required className={inputClasses} /></div>
                                        <div><label className={labelClasses}>Relation*</label><select required className={inputClasses} value={newNominee.relation} onChange={e => handleNewNomineeChange('relation', e.target.value)}><option value="">Select relation</option>{RELATION_OPTIONS.map(opt => (<option key={opt} value={opt}>{opt}</option>))}</select></div>
                                        <div><label className={labelClasses}>Date of Birth</label><input type="date" value={newNominee.dateOfBirth} onChange={e => handleNewNomineeChange('dateOfBirth', e.target.value)} className={inputClasses} /></div>
                                        <div><label className={labelClasses}>Aadhaar</label><input type="text" value={newNominee.aadhaarNumber} onChange={e => handleNewNomineeChange('aadhaarNumber', e.target.value)} className={inputClasses} /></div>
                                    </div>
                                    
                                    <h5 className="font-medium mb-2 mt-4 text-gray-700">Bank Details (Nominee's Account)</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div><label className={labelClasses}>Bank Name</label><input type="text" value={newNominee.bankDetails.bankName} onChange={e => handleNewNomineeChange('bankName', e.target.value, true)} className={inputClasses} /></div>
                                        <div><label className={labelClasses}>A/C Number</label><input type="text" value={newNominee.bankDetails.accountNumber} onChange={e => handleNewNomineeChange('accountNumber', e.target.value, true)} className={inputClasses} /></div>
                                        <div><label className={labelClasses}>Confirm A/C Number</label><input type="text" value={newNominee.bankDetails.confirmAccountNumber || ''} onChange={e => handleNewNomineeChange('confirmAccountNumber', e.target.value, true)} className={inputClasses} /></div>
                                        <div><label className={labelClasses}>IFSC Code</label><input type="text" value={newNominee.bankDetails.ifscCode} onChange={e => handleNewNomineeChange('ifscCode', e.target.value, true)} className={inputClasses} /></div>
                                        <div><label className={labelClasses}>Branch Name</label><input type="text" value={newNominee.bankDetails.branchName} onChange={e => handleNewNomineeChange('branchName', e.target.value, true)} className={inputClasses} /></div>
                                    </div>

                                    <div className="flex items-center mt-6 mb-4">
                                        <input type="checkbox" checked={newNominee.isPrimary} onChange={e => handleNewNomineeChange('isPrimary', e.target.checked)} className="rounded text-teal-600 focus:ring-teal-500" />
                                        <span className="ml-2 text-sm text-gray-700">Set as Primary</span>
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={uploadingFiles.newNominee}
                                        className={`w-full px-4 py-2 text-white rounded-lg ${uploadingFiles.newNominee ? 'bg-gray-400' : 'bg-teal-600 hover:bg-teal-700'}`}
                                    >
                                        {uploadingFiles.newNominee ? 'Adding Nominee...' : 'Add Nominee'}
                                    </button>
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
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <img
                            src={userData?.photoUrl || 'https://placehold.co/100x100/5eead4/115e59?text=G'}
                            alt={userData?.personalDetails?.fullName || 'Profile'}
                            className="h-20 w-20 rounded-full object-cover border-4 border-white/40 shadow-lg"
                        />
                        <div className="text-left">
                            <h1 className="text-3xl font-extrabold text-teal-700">My Profile</h1>
                            <p className="text-sm text-gray-600 mt-1">{userData?.personalDetails?.fullName}</p>
                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                                userData.isVerified 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                            }`}>
                                {userData.isVerified ? 'Verified' : 'Pending Verification'}
                            </div>
                        </div>
                    </div>

                    {/* Aadhaar display */}
                    <div className="items-center gap-3 lg:flex hidden">
                        {aadhaarFrontUrl || aadhaarBackUrl ? (
                            <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg border">
                                <div className="flex gap-2">
                                    {aadhaarFrontUrl && <img src={aadhaarFrontUrl} alt="Aadhaar Front" className="h-24 w-36 object-cover rounded-md border" />}
                                    {aadhaarBackUrl && <img src={aadhaarBackUrl} alt="Aadhaar Back" className="h-24 w-36 object-cover rounded-md border" />}
                                </div>
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