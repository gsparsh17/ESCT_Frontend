import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import LanguageSelector from '../components/LanguageSelector';
import Select from "react-select";
import { FaUser, FaBuilding, FaWallet, FaUsers, FaArrowRight, FaArrowLeft, FaPlus, FaTrash, FaCheckCircle, FaSpinner, FaUpload, FaChevronDown, FaFilePdf } from 'react-icons/fa';
// import organisations from '../constants/organisations';
// import departments from '../constants/departments';
import departmentOrgData from '../constants/top_level_subfolders.json';

const CSC_API_KEY = import.meta.env.VITE_CSC_API_KEY;
const BASE_URL = import.meta.env.VITE_BASE_URL;
const COUNTRY_CODE = import.meta.env.VITE_COUNTRY_CODE;

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

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

  // Pensioner Details
  const [dateOfRetirement, setDateOfRetirement] = useState(null);
  const [retirementDocument, setRetirementDocument] = useState(null);

  const [apiStates, setApiStates] = useState([]);
  const [apiCities, setApiCities] = useState([]);
  const [selectedStateCode, setSelectedStateCode] = useState('');
  const [isApiLoading, setIsApiLoading] = useState(false);

  // Nominee Details
  const [nominees, setNominees] = useState([]);

  // UI state
  // const [errors, setErrors] = useState({});
  // const [loading, setLoading] = useState(false);

  // const orgOptions = organisations.map((org) => ({ label: org, value: org }));
  // const deptOptions = departments.map((dept) => ({ label: dept, value: dept }));

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // NEW: State to hold the dynamic list of organisations
  const [availableOrgOptions, setAvailableOrgOptions] = useState([]);

  // NEW: Create department options from the JSON keys
  // We use useMemo so this list isn't recalculated on every render
  const deptOptions = useMemo(() => {
    return Object.keys(departmentOrgData).map(key => ({
      // 'Agriculture_Education' becomes 'Agriculture Education'
      label: key.replace(/_/g, ' '), 
      value: key
    }));
  }, []); // Empty dependency array means this runs only once

  // NEW: This effect links the two dropdowns
  useEffect(() => {
    // Check if a valid department is selected
    if (empDepartment && departmentOrgData[empDepartment]) {
      // Get the list of organisations for the selected department
      const orgs = departmentOrgData[empDepartment];
      
      // Format them for react-select
      const options = orgs.map(org => ({
        // 'AGRICULTURE_DIRECTORATE' becomes 'AGRICULTURE DIRECTORATE'
        label: org.replace(/_/g, ' '), 
        value: org
      }));
      
      // Set the new options for the organisation dropdown
      setAvailableOrgOptions(options);
    } else {
      // If no department is selected, clear the organisation options
      setAvailableOrgOptions([]);
    }
    
    // IMPORTANT: Always reset the selected organisation when the department changes
    setEmpOrganisation('');
    
  }, [empDepartment]); // This hook runs every time empDepartment changes


  // Step Titles with translation
  const STEP_TITLES = t('STEP_TITLES', [
    'Account Details',
    'Personal Details',
    'Employment / Bank Details',
    'Nominee Details',
  ]);

  // Relation options with translation
  const RELATION_OPTIONS = t('RELATION_OPTIONS', [
    'Spouse', 'Son', 'Daughter', 'Father', 'Mother', 'Brother', 'Sister', 'Other'
  ]);

  // Helper function to check if file is PDF
  const isPdfFile = (file) => {
    if (!file) return false;
    return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  };

  // Helper function to get file icon
  const getFileIcon = (file) => {
    if (file && isPdfFile(file)) {
      return <FaFilePdf className="h-6 w-6 text-red-500 mx-auto mb-2" />;
    }
    return <FaUpload className="h-6 w-6 text-gray-400 mx-auto mb-2" />;
  };

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
            states.sort((a, b) => a.name.localeCompare(b.name));
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
    return STEP_TITLES;
  }, [userType, STEP_TITLES]);

  const handleUserTypeChange = (newType) => {
    setUserType(newType);
    if (currentStep > 0) {
      setCurrentStep(0);
    }
    if (newType === 'PENSIONER') {
        setEhrmsCode('');
        setEmpOrganisation('');
        setEmpDepartment('');
        setEmpDesignation('');
        setEmpDoj(null);
    } else {
        setPensionerNumber('');
        setDateOfRetirement(null);
        setRetirementDocument(null);
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
        newErrors.empState = t('ERRORS.empStateRequired', 'Employment State is required.');
        isValid = false;
      }
      if (userType === 'EMPLOYEE' && !ehrmsCode.trim()) {
        newErrors.ehrmsCode = t('ERRORS.ehrmsCodeRequired', 'EHRMS code is required.');
        isValid = false;
      }
      if (userType === 'PENSIONER' && !pensionerNumber.trim()) {
        newErrors.pensionerNumber = t('ERRORS.pensionerNumberRequired', 'Pensioner number is required.');
        isValid = false;
      }
      if (!password.trim()) {
        newErrors.password = t('ERRORS.passwordRequired', 'Password is required.');
        isValid = false;
      }
      if (!confirmPassword.trim()) {
        newErrors.confirmPassword = t('ERRORS.confirmPasswordRequired', 'Please confirm your password.');
        isValid = false;
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = t('ERRORS.passwordsNotMatch', 'Passwords do not match.');
        isValid = false;
      }
    } else if (currentStep === 1) { 
      if (fullName.trim() && fullName.trim().length < 2) {
        newErrors.fullName = t('ERRORS.fullNameMinLength', 'Full name must be at least 2 characters.');
        isValid = false;
      }
      if (dateOfBirth) {
        const age = calcAgeFromDob(dateOfBirth);
        if (age === undefined || age < 18 || age > 120) {
          newErrors.dateOfBirth = t('ERRORS.invalidDob', 'Invalid DOB. Must be 18-120 years old.');
          isValid = false;
        }
      }
      if (aadhaarNumber && !/^\d{12}$/.test(aadhaarNumber)) {
        newErrors.aadhaarNumber = t('ERRORS.aadhaarInvalid', 'Aadhaar must be 12 digits.');
        isValid = false;
      }
      if (phone && !/^[6-9]\d{9}$/.test(phone)) {
        newErrors.phone = t('ERRORS.phoneInvalid', 'Phone must be 10 digits starting with 6–9.');
        isValid = false;
      }
      if (email && !/\S+@\S+\.\S+/.test(email)) {
        newErrors.email = t('ERRORS.emailInvalid', 'Invalid email format.');
        isValid = false;
      }
    } else if (currentStep === 2) {
      // Employment details validation for employees
      if (userType === 'EMPLOYEE') {
        if (empDistrict.trim() && empDistrict.trim().length < 2) {
          newErrors.empDistrict = t('ERRORS.empDistrictInvalid', 'Employment District must be valid.');
          isValid = false;
        }
        if (empOrganisation.trim() && empOrganisation.trim().length < 2) {
          newErrors.empOrganisation = t('ERRORS.empOrganisationInvalid', 'Employment Organisation must be valid.');
          isValid = false;
        }
        if (empDepartment.trim() && empDepartment.trim().length < 2) {
          newErrors.empDepartment = t('ERRORS.empDepartmentInvalid', 'Employment Department must be valid.');
          isValid = false;
        }
        if (empDesignation.trim() && empDesignation.trim().length < 2) {
          newErrors.empDesignation = t('ERRORS.empDesignationInvalid', 'Employment Designation must be valid.');
          isValid = false;
        }
      }
      
      // Pensioner details validation
      if (userType === 'PENSIONER') {
        if (!dateOfRetirement) {
          newErrors.dateOfRetirement = t('ERRORS.dateOfRetirementRequired', 'Date of retirement is required.');
          isValid = false;
        }
      }
      
      // Bank details validation for both user types
      if (accountNumber.trim() && accountNumber.trim().length < 8) {
        newErrors.accountNumber = t('ERRORS.accountNumberMinLength', 'Account number must be at least 8 digits.');
        isValid = false;
      }
      if (accountNumber.trim() && confirmAccountNumber.trim() && accountNumber.trim() !== confirmAccountNumber.trim()) { 
        newErrors.confirmAccountNumber = t('ERRORS.accountNumbersNotMatch', 'Account numbers do not match.');
        isValid = false;
      }
      if (bankName.trim() && bankName.trim().length < 2) {
        newErrors.bankName = t('ERRORS.bankNameInvalid', 'Bank name must be valid.');
        isValid = false;
      }
      if (ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode.toUpperCase())) {
        newErrors.ifscCode = t('ERRORS.ifscInvalid', 'Invalid IFSC code (e.g., ABCD0EFGHIJ).');
        isValid = false;
      }
    } else if (currentStep === finalSteps.length - 1) {
      if (nominees.length > 0) {
        nominees.forEach((nominee, index) => {
          const hasNomineeData = nominee.name?.trim() || nominee.relation?.trim() || nominee.dateOfBirth || nominee.aadhaarNumber;
          
          if (hasNomineeData) {
            if (!nominee.name?.trim()) {
              newErrors[`nomineeName${index}`] = t('ERRORS.nomineeNameRequired', 'Nominee name is required if adding nominee.');
              isValid = false;
            }
            if (!nominee.relation?.trim()) {
              newErrors[`nomineeRelation${index}`] = t('ERRORS.nomineeRelationRequired', 'Nominee relation is required if adding nominee.');
              isValid = false;
            }
            if (!nominee.dateOfBirth) {
              newErrors[`nomineeDob${index}`] = t('ERRORS.nomineeDobRequired', 'Nominee Date of Birth is required if adding nominee.');
              isValid = false;
            }
            if (!nominee.aadhaarNumber || !/^\d{12}$/.test(nominee.aadhaarNumber)) {
              newErrors[`nomineeAadhaar${index}`] = t('ERRORS.nomineeAadhaarInvalid', 'Nominee Aadhaar must be 12 digits.');
              isValid = false;
            }
            
            if (!nominee.accountNumber?.trim()) {
              newErrors[`nomineeAccount${index}`] = t('ERRORS.nomineeAccountRequired', 'Account number is required for nominee.');
              isValid = false;
            }
            if (nominee.accountNumber.trim() && nominee.confirmAccountNumber.trim() && nominee.accountNumber.trim() !== nominee.confirmAccountNumber.trim()) {
              newErrors[`nomineeConfirmAccount${index}`] = t('ERRORS.nomineeConfirmAccountNotMatch', 'Account numbers do not match.');
              isValid = false;
            }
            if (!nominee.bankName?.trim()) {
              newErrors[`nomineeBankName${index}`] = t('ERRORS.nomineeBankNameRequired', 'Bank name is required for nominee.');
              isValid = false;
            }
            if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(nominee.ifscCode?.toUpperCase())) {
              newErrors[`nomineeIfsc${index}`] = t('ERRORS.nomineeIfscInvalid', 'Invalid IFSC code.');
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
      
      // Employment details for employees, retirement details for pensioners
      const employmentDetails = userType === 'EMPLOYEE' ? 
        { 
          state: empState, 
          district: empDistrict, 
          organisation: empOrganisation, 
          department: empDepartment, 
          designation: empDesignation, 
          dateOfJoining: empDoj 
        } : 
        { 
          state: empState,
          dateOfRetirement: dateOfRetirement
        }; 

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
      
      // Retirement document for pensioners
      if (userType === 'PENSIONER' && retirementDocument && retirementDocument[0]) {
        formData.append('retirementDocument', retirementDocument[0]);
      }

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
        localStorage.setItem('profileIncompleteModalShown', 'false');
        navigate('/home', { replace: true });
      }
    } catch (e) {
      setErrors({ form: e.message || t('ERRORS.registrationFailed', 'Registration failed. Please try again.') });
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
            <label className="block text-sm font-medium text-gray-700">
              {t('LABELS.state', 'State')}
            </label>
            <div className="relative">
              <select
                className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm appearance-none pr-10 bg-white"
                value={selectedStateCode}
                onChange={handleStateChange}
                disabled={isApiLoading || apiStates.length === 0}
              >
                <option value="">
                  {isApiLoading 
                    ? t('LABELS.loadingStates', 'Loading States...') 
                    : apiStates.length === 0 
                      ? t('MESSAGES.noStatesFoundCheckApi', 'No States Found (Check API Key)') 
                      : t('LABELS.selectState', 'Select State')
                  }
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
            <label className="block text-sm font-medium text-gray-700">
              {t('LABELS.userType', 'User Type')}
            </label>
            <div className="relative">
              <select
                className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm appearance-none pr-10 bg-white"
                value={userType}
                onChange={(e) => handleUserTypeChange(e.target.value)}
              >
                <option value="EMPLOYEE">{t('LABELS.employee', 'Employee')}</option>
                <option value="PENSIONER">{t('LABELS.pensioner', 'Pensioner')}</option>
              </select>
              <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {userType === 'EMPLOYEE' 
                ? t('LABELS.ehrmsCode', 'EHRMS Code') 
                : t('LABELS.pensionerNumber', 'Pensioner Number')
              }
            </label>
            <input
              className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
              value={userType === 'EMPLOYEE' ? ehrmsCode : pensionerNumber}
              onChange={(e) => userType === 'EMPLOYEE' ? setEhrmsCode(e.target.value) : setPensionerNumber(e.target.value)}
              placeholder={userType === 'EMPLOYEE' 
                ? t('PLACEHOLDERS.enterEhrmsCode', 'Enter EHRMS code')
                : t('PLACEHOLDERS.enterPensionerNumber', 'Enter Pensioner number')
              }
            />
            {errors.ehrmsCode && <p className="mt-1 text-xs text-red-600">{errors.ehrmsCode}</p>}
            {errors.pensionerNumber && <p className="mt-1 text-xs text-red-600">{errors.pensionerNumber}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t('LABELS.password', 'Password')}
            </label>
            <input
              type="password"
              className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('PLACEHOLDERS.min8Characters', 'Min 8 characters')}
            />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t('LABELS.confirmPassword', 'Confirm Password')}
            </label>
            <input
              type="password"
              className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('PLACEHOLDERS.confirmYourPassword', 'Confirm your password')}
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
              accept="image/*"
              onChange={(e) => setProfilePhoto(e.target.files)}
            />
            <label htmlFor="profilePhoto" className="cursor-pointer">
              <FaUpload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-700">
                {profilePhoto ? profilePhoto[0].name : t('FILE_UPLOAD.uploadProfilePhoto', 'Upload Profile Photo')}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {t('FILE_UPLOAD.jpegPngMax5MB', 'JPEG or PNG, max 5MB')} ({t('LABELS.optional', 'Optional')})
              </p>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-teal-400 transition-colors">
              <input
                type="file"
                id="aadhaarFront"
                className="hidden"
                accept="image/*,.pdf"
                onChange={(e) => setAadhaarFront(e.target.files)}
              />
              <label htmlFor="aadhaarFront" className="cursor-pointer">
                {getFileIcon(aadhaarFront ? aadhaarFront[0] : null)}
                <p className="text-sm font-medium text-gray-700">
                  {aadhaarFront ? aadhaarFront[0].name : t('FILE_UPLOAD.uploadAadhaarFront', 'Upload Aadhaar Front')}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {t('FILE_UPLOAD.jpegPngPdfMax5MB', 'JPEG, PNG, or PDF, max 5MB')} ({t('LABELS.optional', 'Optional')})
                </p>
              </label>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-teal-400 transition-colors">
              <input
                type="file"
                id="aadhaarBack"
                className="hidden"
                accept="image/*,.pdf"
                onChange={(e) => setAadhaarBack(e.target.files)}
              />
              <label htmlFor="aadhaarBack" className="cursor-pointer">
                {getFileIcon(aadhaarBack ? aadhaarBack[0] : null)}
                <p className="text-sm font-medium text-gray-700">
                  {aadhaarBack ? aadhaarBack[0].name : t('FILE_UPLOAD.uploadAadhaarBack', 'Upload Aadhaar Back')}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {t('FILE_UPLOAD.jpegPngPdfMax5MB', 'JPEG, PNG, or PDF, max 5MB')} ({t('LABELS.optional', 'Optional')})
                </p>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t('LABELS.fullName', 'Full Name')}
            </label>
            <input
              className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t('PLACEHOLDERS.enterFullName', 'Enter your full name')}
            />
            {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('LABELS.dateOfBirth', 'Date of Birth')}
              </label>
              <input
                type="date"
                className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
              {errors.dateOfBirth && <p className="mt-1 text-xs text-red-600">{errors.dateOfBirth}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('LABELS.sex', 'Sex')}
              </label>
              <div className="relative">
                <select
                  className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm appearance-none pr-10 bg-white"
                  value={sex}
                  onChange={(e) => setSex(e.target.value)}
                >
                  <option value="MALE">{t('LABELS.male', 'MALE')}</option>
                  <option value="FEMALE">{t('LABELS.female', 'FEMALE')}</option>
                  <option value="OTHER">{t('LABELS.other', 'OTHER')}</option>
                </select>
                <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t('LABELS.aadhaarNumber', 'Aadhaar Number')}
            </label>
            <input
              className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
              value={aadhaarNumber}
              onChange={(e) => setAadhaarNumber(e.target.value)}
              placeholder={t('PLACEHOLDERS.twelveDigits', '12 digits')}
              inputMode="numeric"
            />
            {errors.aadhaarNumber && <p className="mt-1 text-xs text-red-600">{errors.aadhaarNumber}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('LABELS.phone', 'Phone')}
              </label>
              <input
                className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t('PLACEHOLDERS.tenDigits', '10 digits starting 6–9')}
                inputMode="tel"
              />
              {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('LABELS.email', 'Email')}
              </label>
              <input
                type="email"
                className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('PLACEHOLDERS.youExampleCom', 'you@example.com')}
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
          {userType === 'EMPLOYEE' ? (
            <>
              <h3 className="text-lg font-medium text-teal-800">
                {t('LABELS.employmentDetails', 'Employment Details')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('LABELS.district', 'District')} ({t('LABELS.city', 'City')})
                  </label>
                  <div className="relative">
                    <select
                      className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm appearance-none pr-10 bg-white"
                      value={empDistrict}
                      onChange={(e) => setEmpDistrict(e.target.value)}
                      disabled={isApiLoading || apiCities.length === 0 || !selectedStateCode}
                    >
                      <option value="">
                        {isApiLoading 
                          ? t('LABELS.loadingCities', 'Loading Cities...') 
                          : apiCities.length === 0 && selectedStateCode 
                            ? t('LABELS.noCitiesFound', 'No Cities Found') 
                            : t('MESSAGES.selectDistrictCity', 'Select District/City')
                        }
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
                <label className="block text-sm font-medium text-gray-700">
                  {t('LABELS.department', 'Department')}
                </label>
                <Select
                  options={deptOptions} // Uses new options from JSON keys
                  // Find the selected object from our new options
                  value={deptOptions.find((d) => d.value === empDepartment)}
                  // Handle clearable select (selected might be null)
                  onChange={(selected) => setEmpDepartment(selected ? selected.value : '')}
                  placeholder={t('MESSAGES.selectDepartment', '-- Select Department --')}
                  isSearchable
                  isClearable // Good to add so the user can reset
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('LABELS.organisation', 'Organisation')}
                </label>
                <Select
                  options={availableOrgOptions} // Uses new DYNAMIC state
                  // Find the selected object from the dynamic options
                  value={availableOrgOptions.find((o) => o.value === empOrganisation)}
                  // Handle clearable select
                  onChange={(selected) => setEmpOrganisation(selected ? selected.value : '')}
                  placeholder={
                    !empDepartment 
                      ? t('MESSAGES.selectDepartmentFirst', 'Select a department first')
                      : t('MESSAGES.selectOrganisation', '-- Select Organisation --')
                  }
                  isSearchable
                  isClearable
                  // Disable this dropdown until a department is selected
                  isDisabled={!empDepartment || availableOrgOptions.length === 0}
                />
              </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('LABELS.designation', 'Designation')}
                  </label>
                  <input
                    className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
                    value={empDesignation}
                    onChange={(e) => setEmpDesignation(e.target.value)}
                    placeholder={t('PLACEHOLDERS.enterDesignation', 'Enter designation')}
                  />
                  {errors.empDesignation && <p className="mt-1 text-xs text-red-600">{errors.empDesignation}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('LABELS.dateOfJoining', 'Date of Joining')}
                </label>
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
          ) : (
            <>
              <h3 className="text-lg font-medium text-teal-800">
                {t('LABELS.retirementDetails', 'Retirement Details')}
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('LABELS.dateOfRetirement', 'Date of Retirement')}
                  </label>
                  <input
                    type="date"
                    className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
                    value={dateOfRetirement}
                    onChange={(e) => setDateOfRetirement(e.target.value)}
                  />
                  {errors.dateOfRetirement && <p className="mt-1 text-xs text-red-600">{errors.dateOfRetirement}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('LABELS.retirementDocument', 'Retirement Document')}
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-teal-400 transition-colors">
                    <input
                      type="file"
                      id="retirementDocument"
                      className="hidden"
                      accept="image/*,.pdf"
                      onChange={(e) => setRetirementDocument(e.target.files)}
                    />
                    <label htmlFor="retirementDocument" className="cursor-pointer">
                      {getFileIcon(retirementDocument ? retirementDocument[0] : null)}
                      <p className="text-sm font-medium text-gray-700">
                        {retirementDocument ? retirementDocument[0].name : t('FILE_UPLOAD.uploadRetirementDocument', 'Upload Retirement Document')}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {t('FILE_UPLOAD.jpegPngPdfMax5MB', 'JPEG, PNG, or PDF, max 5MB')} ({t('LABELS.required', 'Required')})
                      </p>
                    </label>
                  </div>
                </div>
              </div>
              <hr className="border-gray-200 mt-6" />
            </>
          )}

          <h3 className="text-lg font-medium text-teal-800 pt-4">
            {t('LABELS.bankDetails', 'Bank Details')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('LABELS.accountNumber', 'Account Number')}
              </label>
              <input
                className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                inputMode="numeric"
              />
              {errors.accountNumber && <p className="mt-1 text-xs text-red-600">{errors.accountNumber}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('LABELS.confirmAccountNumber', 'Confirm Account Number')}
              </label>
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
              <label className="block text-sm font-medium text-gray-700">
                {t('LABELS.ifscCode', 'IFSC Code')}
              </label>
              <input
                className="mt-1 w-full uppercase rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                placeholder={t('PLACEHOLDERS.ifscPlaceholder', 'ABCD0EFGHIJ')}
              />
              {errors.ifscCode && <p className="mt-1 text-xs text-red-600">{errors.ifscCode}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('LABELS.bankName', 'Bank Name')}
              </label>
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
            <p className="text-sm text-gray-500 italic">
              {t('MESSAGES.youCanAddNominees', 'You can add nominees (optional).')}
            </p>
          )}
          {nominees.map((nominee, index) => (
            <div key={index} className="relative p-6 border border-teal-200 rounded-lg shadow-xl bg-gray-50/50">
              <h4 className="text-base font-bold text-teal-800 border-b border-teal-100 pb-2 mb-4">
                {t('LABELS.nominee', 'Nominee')} {index + 1}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-teal-400 transition-colors">
                  <input
                    type="file"
                    id={`nomineeAadhaarFront_${index}`}
                    className="hidden"
                    accept="image/*,.pdf"
                    onChange={(e) => handleNomineeFileChange(index, 'aadhaarFront', e.target.files)}
                  />
                  <label htmlFor={`nomineeAadhaarFront_${index}`} className="cursor-pointer">
                    {getFileIcon(nominee.aadhaarFront ? nominee.aadhaarFront[0] : null)}
                    <p className="text-sm font-medium text-gray-700">
                      {nominee.aadhaarFront ? nominee.aadhaarFront[0].name : t('FILE_UPLOAD.nomineeAadhaarFront', 'Nominee Aadhaar Front')}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {t('FILE_UPLOAD.jpegPngPdfMax5MB', 'JPEG, PNG, or PDF, max 5MB')} ({t('LABELS.optional', 'Optional')})
                    </p>
                  </label>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-teal-400 transition-colors">
                  <input
                    type="file"
                    id={`nomineeAadhaarBack_${index}`}
                    className="hidden"
                    accept="image/*,.pdf"
                    onChange={(e) => handleNomineeFileChange(index, 'aadhaarBack', e.target.files)}
                  />
                  <label htmlFor={`nomineeAadhaarBack_${index}`} className="cursor-pointer">
                    {getFileIcon(nominee.aadhaarBack ? nominee.aadhaarBack[0] : null)}
                    <p className="text-sm font-medium text-gray-700">
                      {nominee.aadhaarBack ? nominee.aadhaarBack[0].name : t('FILE_UPLOAD.nomineeAadhaarBack', 'Nominee Aadhaar Back')}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {t('FILE_UPLOAD.jpegPngPdfMax5MB', 'JPEG, PNG, or PDF, max 5MB')} ({t('LABELS.optional', 'Optional')})
                    </p>
                  </label>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className='md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {t('LABELS.nomineeName', 'Nominee Name')}
                        </label>
                        <input
                            className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
                            value={nominee.name}
                            onChange={(e) => handleNomineeChange(index, 'name', e.target.value)}
                            placeholder={t('PLACEHOLDERS.nomineeFullName', 'Nominee\'s full name')}
                        />
                        {errors[`nomineeName${index}`] && <p className="mt-1 text-xs text-red-600">{errors[`nomineeName${index}`]}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {t('LABELS.relation', 'Relation')}
                        </label>
                        <Select
                            className="mt-1"
                            options={RELATION_OPTIONS.map(opt => ({ value: opt, label: opt }))}
                            value={{ value: nominee.relation, label: nominee.relation }}
                            onChange={(selected) => handleNomineeChange(index, 'relation', selected.value)}
                            placeholder={t('LABELS.selectRelation', 'Select relation')}
                        />
                        {errors[`nomineeRelation${index}`] && <p className="mt-1 text-xs text-red-600">{errors[`nomineeRelation${index}`]}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {t('LABELS.dateOfBirth', 'Date of Birth')}
                        </label>
                        <input
                            type="date"
                            className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
                            value={nominee.dateOfBirth}
                            onChange={(e) => handleNomineeChange(index, 'dateOfBirth', e.target.value)}
                        />
                        {errors[`nomineeDob${index}`] && <p className="mt-1 text-xs text-red-600">{errors[`nomineeDob${index}`]}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {t('LABELS.aadhaarNumber', 'Aadhaar Number')}
                        </label>
                        <input
                            className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
                            value={nominee.aadhaarNumber}
                            onChange={(e) => handleNomineeChange(index, 'aadhaarNumber', e.target.value)}
                            inputMode="numeric"
                            placeholder={t('PLACEHOLDERS.twelveDigits', '12 digits')}
                        />
                        {errors[`nomineeAadhaar${index}`] && <p className="mt-1 text-xs text-red-600">{errors[`nomineeAadhaar${index}`]}</p>}
                    </div>
                </div>

                <h4 className="text-sm font-semibold text-teal-800 md:col-span-2 mt-4 pt-2 border-t border-teal-100">
                  {t('LABELS.nomineeBankDetails', 'Nominee Bank Details')}
                </h4>
                
                <div className='md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {t('LABELS.accountNumber', 'Account Number')}
                        </label>
                        <input
                            className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
                            value={nominee.accountNumber}
                            onChange={(e) => handleNomineeChange(index, 'accountNumber', e.target.value)}
                            inputMode="numeric"
                            placeholder={t('PLACEHOLDERS.nomineeFullName', 'Nominee\'s account number')}
                        />
                        {errors[`nomineeAccount${index}`] && <p className="mt-1 text-xs text-red-600">{errors[`nomineeAccount${index}`]}</p>}
                    </div>
                    <div>
                      <label className={labelClasses}>
                        {t('LABELS.confirmAccountNumber', 'Confirm Account Number')}
                      </label>
                      <input 
                        type="text" 
                        value={nominee.confirmAccountNumber || ''} 
                        onChange={e => handleNomineeChange(index, 'confirmAccountNumber', e.target.value)} 
                        className={inputClasses} 
                      />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {t('LABELS.ifscCode', 'IFSC Code')}
                        </label>
                        <input
                            className="mt-1 w-full uppercase rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
                            value={nominee.ifscCode}
                            onChange={(e) => handleNomineeChange(index, 'ifscCode', e.target.value.toUpperCase())}
                            placeholder={t('PLACEHOLDERS.ifscPlaceholder', 'ABCD0EFGHIJ')}
                        />
                        {errors[`nomineeIfsc${index}`] && <p className="mt-1 text-xs text-red-600">{errors[`nomineeIfsc${index}`]}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {t('LABELS.bankName', 'Bank Name')}
                        </label>
                        <input
                            className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
                            value={nominee.bankName}
                            onChange={(e) => handleNomineeChange(index, 'bankName', e.target.value)}
                            placeholder={t('PLACEHOLDERS.enterBankName', 'Enter bank name')}
                        />
                        {errors[`nomineeBankName${index}`] && <p className="mt-1 text-xs text-red-600">{errors[`nomineeBankName${index}`]}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {t('LABELS.branchName', 'Branch Name')} ({t('LABELS.optional', 'Optional')})
                        </label>
                        <input
                            className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
                            value={nominee.branchName}
                            onChange={(e) => handleNomineeChange(index, 'branchName', e.target.value)}
                            placeholder={t('PLACEHOLDERS.enterBranchName', 'Enter branch name')}
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
                        {t('LABELS.primaryNominee', 'Primary Nominee')}
                    </label>
                </div>
              </div>

              {nominees.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveNominee(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 transition-colors bg-white rounded-full p-2 shadow-md"
                  aria-label={t('LABELS.remove', 'Remove')}
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
                <FaPlus className="h-4 w-4" /> {t('LABELS.addNominee', 'Add Nominee')}
              </button>
            </div>
          )}
        </div>
      );
    }
  }

  const renderForm = () => (
    <div className="w-full max-w-2xl rounded-xl bg-white p-6 sm:p-8 shadow-2xl border border-teal-100">
      <LanguageSelector />
      <h2 className="text-2xl font-bold text-center text-teal-800">
        {t('LABELS.newUserRegistration', 'New User Registration')}
      </h2>
      <p className="text-center text-sm text-gray-500 mt-1">
        {t('LABELS.step', 'Step')} {currentStep + 1} {t('LABELS.of', 'of')} {finalSteps.length}: {currentStepTitle}
      </p>
      
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
        {renderCurrentStep()}

        <div className={`mt-8 flex ${currentStep > 0 ? 'justify-between' : 'justify-end'}`}>
          {currentStep > 0 && (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-2 px-6 py-2 rounded-full border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors shadow-sm"
            >
              <FaArrowLeft className="h-4 w-4" /> {t('LABELS.back', 'Back')}
            </button>
          )}

          {currentStep < finalSteps.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className={`${currentStep === 0 ? 'ml-auto' : ''} flex items-center gap-2 px-6 py-2 rounded-full bg-teal-600 text-white font-semibold shadow-md hover:bg-teal-700 transition-colors`}
            >
              {t('LABELS.next', 'Next')} <FaArrowRight className="h-4 w-4" />
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
                  <FaSpinner className="animate-spin" /> {t('LABELS.registering', 'Registering...')}
                </>
              ) : t('LABELS.completeRegistration', 'Complete Registration')}
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