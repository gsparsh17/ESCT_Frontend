import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Select from "react-select";
import { FaUser, FaBuilding, FaWallet, FaUsers, FaArrowRight, FaArrowLeft, FaPlus, FaTrash, FaCheckCircle, FaSpinner, FaUpload, FaChevronDown } from 'react-icons/fa';
import organisations from '../constants/organisations';
import departments from '../constants/departments';

// Updated Step Titles for clarity and UX (Step 2 is conditional)
const STEP_TITLES = [
  'Account Details',
  'Personal Details',
  'Employment / Bank Details', // Combined title
  'Nominee Details',
];

const CSC_API_KEY = import.meta.env.VITE_CSC_API_KEY;
const BASE_URL = import.meta.env.VITE_BASE_URL;
const COUNTRY_CODE = import.meta.env.VITE_COUNTRY_CODE;

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  // Step state
  const [currentStep, setCurrentStep] = useState(0);

  // Form data state
  const [userType, setUserType] = useState('EMPLOYEE');
  const [ehrmsCode, setEhrmsCode] = useState('');
  const [pensionerNumber, setPensionerNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [sex, setSex] = useState('MALE');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);
  // Updated: Separate files for front and back Aadhaar
  const [aadhaarFront, setAadhaarFront] = useState(null);
  const [aadhaarBack, setAadhaarBack] = useState(null);
  
  // Main User Bank Details
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [bankName, setBankName] = useState('');

  // Employment Details
  const [empState, setEmpState] = useState('');
  const [empDistrict, setEmpDistrict] = useState('');
  const [empOrganisation, setEmpOrganisation] = useState('');
  const [empDepartment, setEmpDepartment] = useState('');
  const [empDesignation, setEmpDesignation] = useState('');
  const [empDoj, setEmpDoj] = useState(null);

  const [apiStates, setApiStates] = useState([]);
  const [apiCities, setApiCities] = useState([]);
  const [selectedStateCode, setSelectedStateCode] = useState('');
  const [isApiLoading, setIsApiLoading] = useState(false);

  // Nominee Details
  const [nominees, setNominees] = useState([]);

  // UI state
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const orgOptions = organisations.map((org) => ({ label: org, value: org }));
  const deptOptions = departments.map((dept) => ({ label: dept, value: dept }));

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

  const calcAgeFromDob = (isoDate) => {
    const dob = new Date(isoDate);
    if (Number.isNaN(dob.getTime())) return undefined;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age;
  };

  useEffect(() => {
    if (!CSC_API_KEY) {
        console.warn("API Key missing. Cannot fetch geographical data.");
        return;
    }
    
    const fetchStates = async () => {
        setIsApiLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/countries/${COUNTRY_CODE}/states`, {
                headers: { 'X-CSCAPI-KEY': CSC_API_KEY }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch states from API.');
            }

            const states = await response.json();
            setApiStates(states);
        } catch (error) {
            console.error('Error fetching states:', error);
            setErrors(prev => ({ ...prev, api: 'Could not load states.' }));
        } finally {
            setIsApiLoading(false);
        }
    };
    fetchStates();
  }, []);

  useEffect(() => {
    if (!selectedStateCode || !CSC_API_KEY ) {
        setApiCities([]);
        setEmpDistrict('');
        return;
    }

    const fetchCities = async () => {
        setIsApiLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/countries/${COUNTRY_CODE}/states/${selectedStateCode}/cities`, {
                headers: { 'X-CSCAPI-KEY': CSC_API_KEY }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch cities.');
            }

            const cities = await response.json();
            cities.sort((a, b) => a.name.localeCompare(b.name));
            setApiCities(cities);
        } catch (error) {
            console.error('Error fetching cities:', error);
            setErrors(prev => ({ ...prev, api: 'Could not load cities.' }));
        } finally {
            setIsApiLoading(false);
        }
    };
    fetchCities();
  }, [selectedStateCode]);

  const handleStateChange = (e) => {
    setSelectedStateCode(e.target.value); 
    const selectedState = apiStates.find(s => s.iso2 === e.target.value);
    setEmpState(selectedState ? selectedState.name : '');
    setEmpDistrict('');
    setApiCities([]);
  };

  // Adjust step flow dynamically for Pensioners
  const finalSteps = useMemo(() => {
    if (userType === 'PENSIONER') {
        return STEP_TITLES.filter((_, index) => index !== 2); 
    }
    return STEP_TITLES;
  }, [userType]);

  const handleUserTypeChange = (newType) => {
    setUserType(newType);
    if (currentStep > 0) {
      setCurrentStep(0);
    }
    if (newType === 'PENSIONER') {
        setEhrmsCode('');
        setEmpState('');
        setEmpDistrict('');
        setEmpOrganisation('');
        setEmpDepartment('');
        setEmpDesignation('');
        setEmpDoj(null);
    } else {
        setPensionerNumber('');
    }
  };
          const commonClasses = "mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4";
        const labelClasses = "block text-sm font-medium text-gray-700";
        const inputClasses = "mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm disabled:bg-gray-100 disabled:cursor-not-allowed";

  const validateStep = () => {
    const newErrors = {};
    let isValid = true;

    if (currentStep === 0) { 
      if (!empState.trim()) {
        newErrors.empState = 'Employment State is required.';
        isValid = false;
      }
      if (userType === 'EMPLOYEE' && !ehrmsCode.trim()) {
        newErrors.ehrmsCode = 'EHRMS code is required.';
        isValid = false;
      }
      if (userType === 'PENSIONER' && !pensionerNumber.trim()) {
        newErrors.pensionerNumber = 'Pensioner number is required.';
        isValid = false;
      }
      if (!password.trim()) {
        newErrors.password = 'Password is required.';
        isValid = false;
      }
      if (!confirmPassword.trim()) {
        newErrors.confirmPassword = 'Please confirm your password.';
        isValid = false;
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match.';
        isValid = false;
      }
    } else if (currentStep === 1) { 
      if (fullName.trim() && fullName.trim().length < 2) {
        newErrors.fullName = 'Full name must be at least 2 characters.';
        isValid = false;
      }
      if (dateOfBirth) {
        const age = calcAgeFromDob(dateOfBirth);
        if (age === undefined || age < 18 || age > 120) {
          newErrors.dateOfBirth = 'Invalid DOB. Must be 18-120 years old.';
          isValid = false;
        }
      }
      if (aadhaarNumber && !/^\d{12}$/.test(aadhaarNumber)) {
        newErrors.aadhaarNumber = 'Aadhaar must be 12 digits.';
        isValid = false;
      }
      if (phone && !/^[6-9]\d{9}$/.test(phone)) {
        newErrors.phone = 'Phone must be 10 digits starting with 6–9.';
        isValid = false;
      }
      if (email && !/\S+@\S+\.\S+/.test(email)) {
        newErrors.email = 'Invalid email format.';
        isValid = false;
      }
    } else if (currentStep === 2 && userType === 'EMPLOYEE') {
      if (empDistrict.trim() && empDistrict.trim().length < 2) {
        newErrors.empDistrict = 'Employment District must be valid.';
        isValid = false;
      }
      if (empOrganisation.trim() && empOrganisation.trim().length < 2) {
        newErrors.empOrganisation = 'Employment Organisation must be valid.';
        isValid = false;
      }
      if (empDepartment.trim() && empDepartment.trim().length < 2) {
        newErrors.empDepartment = 'Employment Department must be valid.';
        isValid = false;
      }
      if (empDesignation.trim() && empDesignation.trim().length < 2) {
        newErrors.empDesignation = 'Employment Designation must be valid.';
        isValid = false;
      }
      
      if (accountNumber.trim() && accountNumber.trim().length < 8) {
        newErrors.accountNumber = 'Account number must be at least 8 digits.';
        isValid = false;
      }
      if (accountNumber.trim() && confirmAccountNumber.trim() && accountNumber.trim() !== confirmAccountNumber.trim()) { 
        newErrors.confirmAccountNumber = 'Account numbers do not match.';
        isValid = false;
      }
      if (bankName.trim() && bankName.trim().length < 2) {
        newErrors.bankName = 'Bank name must be valid.';
        isValid = false;
      }
      if (ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode.toUpperCase())) {
        newErrors.ifscCode = 'Invalid IFSC code (e.g., ABCD0EFGHIJ).';
        isValid = false;
      }

    } else if (currentStep === 2 && userType === 'PENSIONER') {
        if (accountNumber.trim() && accountNumber.trim().length < 8) {
          newErrors.accountNumber = 'Account number must be at least 8 digits.';
          isValid = false;
        }
        if (accountNumber.trim() && confirmAccountNumber.trim() && accountNumber.trim() !== confirmAccountNumber.trim()) {
            newErrors.confirmAccountNumber = 'Account numbers do not match.';
            isValid = false;
        }
        if (bankName.trim() && bankName.trim().length < 2) {
          newErrors.bankName = 'Bank name must be valid.';
          isValid = false;
        }
        if (ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode.toUpperCase())) {
          newErrors.ifscCode = 'Invalid IFSC code (e.g., ABCD0EFGHIJ).';
          isValid = false;
        }
        
    } else if (currentStep === finalSteps.length - 1) {
      if (nominees.length > 0) {
        nominees.forEach((nominee, index) => {
          const hasNomineeData = nominee.name?.trim() || nominee.relation?.trim() || nominee.dateOfBirth || nominee.aadhaarNumber;
          
          if (hasNomineeData) {
            if (!nominee.name?.trim()) {
              newErrors[`nomineeName${index}`] = 'Nominee name is required if adding nominee.';
              isValid = false;
            }
            if (!nominee.relation?.trim()) {
              newErrors[`nomineeRelation${index}`] = 'Nominee relation is required if adding nominee.';
              isValid = false;
            }
            if (!nominee.dateOfBirth) {
              newErrors[`nomineeDob${index}`] = 'Nominee Date of Birth is required if adding nominee.';
              isValid = false;
            }
            if (!nominee.aadhaarNumber || !/^\d{12}$/.test(nominee.aadhaarNumber)) {
              newErrors[`nomineeAadhaar${index}`] = 'Nominee Aadhaar must be 12 digits.';
              isValid = false;
            }
            
            if (!nominee.accountNumber?.trim()) {
              newErrors[`nomineeAccount${index}`] = 'Account number is required for nominee.';
              isValid = false;
            }
            if (nominee.accountNumber.trim() && nominee.confirmAccountNumber.trim() && nominee.accountNumber.trim() !== nominee.confirmAccountNumber.trim()) {
              newErrors[`nomineeConfirmAccount${index}`] = 'Account numbers do not match.';
              isValid = false;
            }
            if (!nominee.bankName?.trim()) {
              newErrors[`nomineeBankName${index}`] = 'Bank name is required for nominee.';
              isValid = false;
            }
            if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(nominee.ifscCode?.toUpperCase())) {
              newErrors[`nomineeIfsc${index}`] = 'Invalid IFSC code.';
              isValid = false;
            }
          }
        });
      }
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleStepClick = (stepIndex) => {
    if (stepIndex >= 0 && stepIndex < finalSteps.length) {
      setCurrentStep(stepIndex);
    }
  };

  const handleAddNominee = () => {
    if (nominees.length < 2) {
      setNominees([...nominees, { 
        name: '', 
        relation: '', 
        dateOfBirth: '', 
        aadhaarNumber: '',
        accountNumber: '',
        confirmAccountNumber: '',
        ifscCode: '',      
        bankName: '',      
        branchName: '',    
        isPrimary: nominees.length === 0,
        // Add file states for nominee Aadhaar documents
        aadhaarFront: null,
        aadhaarBack: null
      }]);
    }
  };

  const handleRemoveNominee = (index) => {
    const newNominees = nominees.filter((_, i) => i !== index);
    if (newNominees.length > 0 && newNominees.every(n => !n.isPrimary)) {
      newNominees[0].isPrimary = true;
    }
    setNominees(newNominees);
  };
  
  const handleNomineeChange = (index, field, value) => {
    const newNominees = [...nominees];
    if (field === 'isPrimary') {
      newNominees.forEach((n, i) => n.isPrimary = (i === index));
    } else {
      newNominees[index][field] = value;
    }
    setNominees(newNominees);
  };

  // Handle nominee file uploads
  const handleNomineeFileChange = (index, fileType, files) => {
    const newNominees = [...nominees];
    newNominees[index][fileType] = files;
    setNominees(newNominees);
  };

  async function onSubmit() {
    if (!validateStep()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const age = dateOfBirth ? calcAgeFromDob(dateOfBirth) : undefined;
      const personalDetails = { fullName, dateOfBirth, age, sex, aadhaarNumber, phone, email };
      const bankDetails = { accountNumber, confirmAccountNumber, ifscCode, bankName }; 
      const employmentDetails = userType === 'EMPLOYEE' ? 
        { state: empState, district: empDistrict, organisation: empOrganisation, department: empDepartment, designation: empDesignation, dateOfJoining: empDoj } : 
        {}; 

      const formData = new FormData();

      formData.append('userType', userType);
      formData.append('password', password);
      if (userType === 'EMPLOYEE') formData.append('ehrmsCode', ehrmsCode);
      else formData.append('pensionerNumber', pensionerNumber);

      formData.append('personalDetails', JSON.stringify(personalDetails));
      formData.append('bankDetails', JSON.stringify(bankDetails));
      formData.append('employmentDetails', JSON.stringify(employmentDetails));
      
      // User files
      if (profilePhoto && profilePhoto[0]) formData.append('profilePhoto', profilePhoto[0]);
      if (aadhaarFront && aadhaarFront[0]) formData.append('aadhaarFront', aadhaarFront[0]);
      if (aadhaarBack && aadhaarBack[0]) formData.append('aadhaarBack', aadhaarBack[0]);

      // Handle nominees with their Aadhaar documents
      const formattedNominees = nominees.map((nominee, index) => ({
        name: nominee.name,
        relation: nominee.relation,
        dateOfBirth: nominee.dateOfBirth,
        aadhaarNumber: nominee.aadhaarNumber,
        isPrimary: nominee.isPrimary,
        bankDetails: {
            accountNumber: nominee.accountNumber,
            ifscCode: nominee.ifscCode,
            bankName: nominee.bankName,
            branchName: nominee.branchName, 
        }
      }));

      formData.append('nominees', JSON.stringify(formattedNominees));

      // Append nominee Aadhaar files with indexed names
      nominees.forEach((nominee, index) => {
        if (nominee.aadhaarFront && nominee.aadhaarFront[0]) {
          formData.append(`nomineeAadhaarFront_${index}`, nominee.aadhaarFront[0]);
        }
        if (nominee.aadhaarBack && nominee.aadhaarBack[0]) {
          formData.append(`nomineeAadhaarBack_${index}`, nominee.aadhaarBack[0]);
        }
      });

      const user = await register(formData);
      
      if (user.isAdmin) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/home', { replace: true });
      }
    } catch (e) {
      setErrors({ form: e.message || 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  }

  const currentStepTitle = finalSteps[currentStep];

  const renderCurrentStep = () => {
    if (currentStep === 0) {
      return (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">State</label>
            <div className="relative">
              <select
                className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm appearance-none pr-10 bg-white"
                value={selectedStateCode}
                onChange={handleStateChange}
                disabled={isApiLoading || apiStates.length === 0}
              >
                <option value="">
                  {isApiLoading ? 'Loading States...' : apiStates.length === 0 ? 'No States Found (Check API Key)' : 'Select State'}
                </option>
                {apiStates.map((state) => (
                  <option key={state.iso2} value={state.iso2}>
                    {state.name}
                  </option>
                ))}
              </select>
              <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            {errors.empState && <p className="mt-1 text-xs text-red-600">{errors.empState}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">User Type</label>
            <div className="relative">
              <select
                className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm appearance-none pr-10 bg-white"
                value={userType}
                onChange={(e) => handleUserTypeChange(e.target.value)}
              >
                <option value="EMPLOYEE">Employee</option>
                <option value="PENSIONER">Pensioner</option>
              </select>
              <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{userType === 'EMPLOYEE' ? 'EHRMS Code' : 'Pensioner Number'}</label>
            <input
              className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
              value={userType === 'EMPLOYEE' ? ehrmsCode : pensionerNumber}
              onChange={(e) => userType === 'EMPLOYEE' ? setEhrmsCode(e.target.value) : setPensionerNumber(e.target.value)}
              placeholder={`Enter ${userType === 'EMPLOYEE' ? 'EHRMS code' : 'Pensioner number'}`}
            />
            {errors.ehrmsCode && <p className="mt-1 text-xs text-red-600">{errors.ehrmsCode}</p>}
            {errors.pensionerNumber && <p className="mt-1 text-xs text-red-600">{errors.pensionerNumber}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 characters"
            />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
          </div>
        </div>
      );
    }
    
    if (currentStep === 1) {
      return (
        <div className="space-y-6">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-teal-400 transition-colors">
            <input
              type="file"
              id="profilePhoto"
              className="hidden"
              accept="image/jpeg,image/png"
              onChange={(e) => setProfilePhoto(e.target.files)}
            />
            <label htmlFor="profilePhoto" className="cursor-pointer">
              <FaUpload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-700">
                {profilePhoto ? profilePhoto[0].name : 'Upload Profile Photo'}
              </p>
              <p className="text-xs text-gray-500 mt-1">JPEG or PNG, max 2MB (Optional)</p>
            </label>
          </div>

          {/* Updated: Separate Aadhaar Front and Back Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-teal-400 transition-colors">
              <input
                type="file"
                id="aadhaarFront"
                className="hidden"
                accept="image/jpeg,image/png"
                onChange={(e) => setAadhaarFront(e.target.files)}
              />
              <label htmlFor="aadhaarFront" className="cursor-pointer">
                <FaUpload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-700">
                  {aadhaarFront ? aadhaarFront[0].name : 'Upload Aadhaar Front'}
                </p>
                <p className="text-xs text-gray-500 mt-1">JPEG or PNG, max 2MB (Optional)</p>
              </label>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-teal-400 transition-colors">
              <input
                type="file"
                id="aadhaarBack"
                className="hidden"
                accept="image/jpeg,image/png"
                onChange={(e) => setAadhaarBack(e.target.files)}
              />
              <label htmlFor="aadhaarBack" className="cursor-pointer">
                <FaUpload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-700">
                  {aadhaarBack ? aadhaarBack[0].name : 'Upload Aadhaar Back'}
                </p>
                <p className="text-xs text-gray-500 mt-1">JPEG or PNG, max 2MB (Optional)</p>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
            />
            {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <input
                type="date"
                className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
              {errors.dateOfBirth && <p className="mt-1 text-xs text-red-600">{errors.dateOfBirth}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Sex</label>
              <div className="relative">
                <select
                  className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm appearance-none pr-10 bg-white"
                  value={sex}
                  onChange={(e) => setSex(e.target.value)}
                >
                  <option value="MALE">MALE</option>
                  <option value="FEMALE">FEMALE</option>
                  <option value="OTHER">OTHER</option>
                </select>
                <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Aadhaar Number</label>
            <input
              className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
              value={aadhaarNumber}
              onChange={(e) => setAadhaarNumber(e.target.value)}
              placeholder="12 digits"
              inputMode="numeric"
            />
            {errors.aadhaarNumber && <p className="mt-1 text-xs text-red-600">{errors.aadhaarNumber}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10 digits starting 6–9"
                inputMode="tel"
              />
              {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>
          </div>
        </div>
      );
    }

    if (currentStep === 2) {
      return (
        <div className="space-y-6">
          {userType === 'EMPLOYEE' && (
            <>
              <h3 className="text-lg font-medium text-teal-800">Employment Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">District (City)</label>
                  <div className="relative">
                    <select
                      className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm appearance-none pr-10 bg-white"
                      value={empDistrict}
                      onChange={(e) => setEmpDistrict(e.target.value)}
                      disabled={isApiLoading || apiCities.length === 0 || !selectedStateCode}
                    >
                      <option value="">
                        {isApiLoading ? 'Loading Cities...' : apiCities.length === 0 && selectedStateCode ? 'No Cities Found' : 'Select District/City'}
                      </option>
                      {apiCities.map((city) => (
                        <option key={city.id} value={city.name}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                    <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.empDistrict && <p className="mt-1 text-xs text-red-600">{errors.empDistrict}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Organisation</label>
                  <Select
                    options={orgOptions}
                    value={orgOptions.find((o) => o.value === empOrganisation)}
                    onChange={(selected) => setEmpOrganisation(selected.value)}
                    placeholder="-- Select Organisation --"
                    isSearchable
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <Select
                    options={deptOptions}
                    value={deptOptions.find((d) => d.value === empDepartment)}
                    onChange={(selected) => setEmpDepartment(selected.value)}
                    placeholder="-- Select Department --"
                    isSearchable
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Designation</label>
                  <input
                    className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
                    value={empDesignation}
                    onChange={(e) => setEmpDesignation(e.target.value)}
                    placeholder="Enter designation"
                  />
                  {errors.empDesignation && <p className="mt-1 text-xs text-red-600">{errors.empDesignation}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date of Joining</label>
                <input
                  type="date"
                  className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
                  value={empDoj}
                  onChange={(e) => setEmpDoj(e.target.value)}
                />
                {errors.empDoj && <p className="mt-1 text-xs text-red-600">{errors.empDoj}</p>}
              </div>
              <hr className="border-gray-200 mt-6" />
            </>
          )}

          <h3 className="text-lg font-medium text-teal-800 pt-4">Bank Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Account Number</label>
              <input
                className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                inputMode="numeric"
              />
              {errors.accountNumber && <p className="mt-1 text-xs text-red-600">{errors.accountNumber}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Account Number</label>
              <input
                className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
                value={confirmAccountNumber}
                onChange={(e) => setConfirmAccountNumber(e.target.value)}
                inputMode="numeric"
              />
              {errors.confirmAccountNumber && <p className="mt-1 text-xs text-red-600">{errors.confirmAccountNumber}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">IFSC Code</label>
              <input
                className="mt-1 w-full uppercase rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                placeholder="ABCD0EFGHIJ"
              />
              {errors.ifscCode && <p className="mt-1 text-xs text-red-600">{errors.ifscCode}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bank Name</label>
              <input
                className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
              />
              {errors.bankName && <p className="mt-1 text-xs text-red-600">{errors.bankName}</p>}
            </div>
          </div>
        </div>
      );
    }

    if (currentStep === finalSteps.length - 1) {
      return (
        <div className="space-y-6">
          {nominees.length === 0 && (
            <p className="text-sm text-gray-500 italic">You can add nominees (optional).</p>
          )}
          {nominees.map((nominee, index) => (
            <div key={index} className="relative p-6 border border-teal-200 rounded-lg shadow-xl bg-gray-50/50">
              <h4 className="text-base font-bold text-teal-800 border-b border-teal-100 pb-2 mb-4">Nominee {index + 1}</h4>
              
              {/* Nominee Aadhaar Document Uploads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-teal-400 transition-colors">
                  <input
                    type="file"
                    id={`nomineeAadhaarFront_${index}`}
                    className="hidden"
                    accept="image/jpeg,image/png"
                    onChange={(e) => handleNomineeFileChange(index, 'aadhaarFront', e.target.files)}
                  />
                  <label htmlFor={`nomineeAadhaarFront_${index}`} className="cursor-pointer">
                    <FaUpload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-700">
                      {nominee.aadhaarFront ? nominee.aadhaarFront[0].name : 'Nominee Aadhaar Front'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">JPEG or PNG (Optional)</p>
                  </label>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-teal-400 transition-colors">
                  <input
                    type="file"
                    id={`nomineeAadhaarBack_${index}`}
                    className="hidden"
                    accept="image/jpeg,image/png"
                    onChange={(e) => handleNomineeFileChange(index, 'aadhaarBack', e.target.files)}
                  />
                  <label htmlFor={`nomineeAadhaarBack_${index}`} className="cursor-pointer">
                    <FaUpload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-700">
                      {nominee.aadhaarBack ? nominee.aadhaarBack[0].name : 'Nominee Aadhaar Back'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">JPEG or PNG (Optional)</p>
                  </label>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Personal Details */}
                <div className='md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input
                            className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
                            value={nominee.name}
                            onChange={(e) => handleNomineeChange(index, 'name', e.target.value)}
                            placeholder="Nominee's full name"
                        />
                        {errors[`nomineeName${index}`] && <p className="mt-1 text-xs text-red-600">{errors[`nomineeName${index}`]}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Relation</label>
                        <Select
                            className="mt-1"
                            options={RELATION_OPTIONS.map(opt => ({ value: opt, label: opt }))}
                            value={{ value: nominee.relation, label: nominee.relation }}
                            onChange={(selected) => handleNomineeChange(index, 'relation', selected.value)}
                            placeholder="Select relation"
                        />
                        {errors[`nomineeRelation${index}`] && <p className="mt-1 text-xs text-red-600">{errors[`nomineeRelation${index}`]}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                        <input
                            type="date"
                            className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
                            value={nominee.dateOfBirth}
                            onChange={(e) => handleNomineeChange(index, 'dateOfBirth', e.target.value)}
                        />
                        {errors[`nomineeDob${index}`] && <p className="mt-1 text-xs text-red-600">{errors[`nomineeDob${index}`]}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Aadhaar Number</label>
                        <input
                            className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
                            value={nominee.aadhaarNumber}
                            onChange={(e) => handleNomineeChange(index, 'aadhaarNumber', e.target.value)}
                            inputMode="numeric"
                            placeholder="12 digits"
                        />
                        {errors[`nomineeAadhaar${index}`] && <p className="mt-1 text-xs text-red-600">{errors[`nomineeAadhaar${index}`]}</p>}
                    </div>
                </div>

                {/* Bank Details */}
                <h4 className="text-sm font-semibold text-teal-800 md:col-span-2 mt-4 pt-2 border-t border-teal-100">Nominee Bank Details</h4>
                
                <div className='md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Account Number</label>
                        <input
                            className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
                            value={nominee.accountNumber}
                            onChange={(e) => handleNomineeChange(index, 'accountNumber', e.target.value)}
                            inputMode="numeric"
                            placeholder="Nominee's account number"
                        />
                        {errors[`nomineeAccount${index}`] && <p className="mt-1 text-xs text-red-600">{errors[`nomineeAccount${index}`]}</p>}
                    </div>
                    <div><label className={labelClasses}>Confirm A/C Number</label><input type="text" value={nominee.confirmAccountNumber || ''} onChange={e => handleNomineeChange(index, 'confirmAccountNumber', e.target.value)} className={inputClasses} /></div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">IFSC Code</label>
                        <input
                            className="mt-1 w-full uppercase rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
                            value={nominee.ifscCode}
                            onChange={(e) => handleNomineeChange(index, 'ifscCode', e.target.value.toUpperCase())}
                            placeholder="ABCD0EFGHIJ"
                        />
                        {errors[`nomineeIfsc${index}`] && <p className="mt-1 text-xs text-red-600">{errors[`nomineeIfsc${index}`]}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                        <input
                            className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
                            value={nominee.bankName}
                            onChange={(e) => handleNomineeChange(index, 'bankName', e.target.value)}
                            placeholder="Nominee's bank name"
                        />
                        {errors[`nomineeBankName${index}`] && <p className="mt-1 text-xs text-red-600">{errors[`nomineeBankName${index}`]}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Branch Name (Optional)</label>
                        <input
                            className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
                            value={nominee.branchName}
                            onChange={(e) => handleNomineeChange(index, 'branchName', e.target.value)}
                            placeholder="Branch name"
                        />
                    </div>
                </div>

                <div className="flex items-center md:col-span-2 mt-2">
                    <input
                        type="checkbox"
                        id={`isPrimary-${index}`}
                        className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        checked={nominee.isPrimary}
                        onChange={(e) => handleNomineeChange(index, 'isPrimary', e.target.checked)}
                    />
                    <label htmlFor={`isPrimary-${index}`} className="ml-2 block text-sm font-medium text-gray-700">
                        Primary Nominee
                    </label>
                </div>
              </div>

              {nominees.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveNominee(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 transition-colors bg-white rounded-full p-2 shadow-md"
                  aria-label="Remove nominee"
                >
                  <FaTrash className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          {nominees.length < 2 && (
            <div className="text-center mt-6">
              <button
                type="button"
                onClick={handleAddNominee}
                className="flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-teal-700 border border-teal-300 hover:bg-teal-50 transition-colors shadow-sm"
              >
                <FaPlus className="h-4 w-4" /> Add Nominee
              </button>
            </div>
          )}
        </div>
      );
    }
  }

  const renderForm = () => (
    <div className="w-full max-w-2xl rounded-xl bg-white p-6 sm:p-8 shadow-2xl border border-teal-100">
      <h2 className="text-2xl font-bold text-center text-teal-800">
        New User Registration
      </h2>
      <p className="text-center text-sm text-gray-500 mt-1">
        Step {currentStep + 1} of {finalSteps.length}: {currentStepTitle}
      </p>
      
      {/* Step Progress Bar - Now clickable */}
      <div className="mt-8 flex justify-between items-center relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 rounded-full"></div>
        <div 
          className="absolute top-1/2 left-0 h-1 bg-teal-600 -z-10 rounded-full transition-all duration-300 ease-in-out" 
          style={{ width: `${(currentStep / (finalSteps.length - 1)) * 100}%` }}
        ></div>
        {finalSteps.map((title, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleStepClick(index)}
            className="flex flex-col items-center focus:outline-none"
          >
            <div 
              className={`w-10 h-10 flex items-center justify-center rounded-full border-2 transition-all duration-300 ${
                currentStep >= index ? 'bg-teal-600 border-teal-600 text-white shadow-lg' : 'bg-white border-gray-300 text-gray-500'
              } ${currentStep === index ? 'ring-2 ring-teal-300 ring-offset-2' : ''}`}
            >
              {currentStep > index ? <FaCheckCircle className="h-5 w-5" /> : (index === 0 ? <FaUser className="h-5 w-5" /> : index === 1 ? <FaBuilding className="h-5 w-5" /> : index === 2 ? <FaWallet className="h-5 w-5" /> : <FaUsers className="h-5 w-5" />)}
            </div>
            <span className={`text-xs mt-2 font-medium hidden sm:block text-center max-w-[80px] ${currentStep >= index ? 'text-teal-700' : 'text-gray-500'}`}>
              {title}
            </span>
          </button>
        ))}
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="mt-8">
        {/* Render current step's content */}
        {renderCurrentStep()}

        {/* Navigation buttons */}
        <div className={`mt-8 flex ${currentStep > 0 ? 'justify-between' : 'justify-end'}`}>
          {currentStep > 0 && (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-2 px-6 py-2 rounded-full border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors shadow-sm"
            >
              <FaArrowLeft className="h-4 w-4" /> Back
            </button>
          )}

          {currentStep < finalSteps.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className={`${currentStep === 0 ? 'ml-auto' : ''} flex items-center gap-2 px-6 py-2 rounded-full bg-teal-600 text-white font-semibold shadow-md hover:bg-teal-700 transition-colors`}
            >
              Next <FaArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onSubmit}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-teal-600 text-white font-semibold shadow-md disabled:opacity-60 disabled:cursor-not-allowed hover:bg-teal-700 transition-colors"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" /> Registering...
                </>
              ) : 'Complete Registration'}
            </button>
          )}
        </div>
        {errors.form && <p className="text-center text-sm text-red-600 mt-4">{errors.form}</p>}
      </form>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-10">
      {renderForm()}
    </div>
  );
};

export default Register;