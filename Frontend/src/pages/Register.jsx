import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaBuilding, FaWallet, FaUsers, FaArrowRight, FaArrowLeft, FaPlus, FaTrash, FaCheckCircle, FaSpinner } from 'react-icons/fa';

const STEP_TITLES = [
  'Account Details',
  'Personal Details',
  'Employment & Bank Details',
  'Nominee Details',
];

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

  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [sex, setSex] = useState('MALE');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [bankName, setBankName] = useState('');
  const [empState, setEmpState] = useState('');
  const [empDistrict, setEmpDistrict] = useState('');
  const [empDepartment, setEmpDepartment] = useState('');
  const [empDesignation, setEmpDesignation] = useState('');
  const [empDoj, setEmpDoj] = useState('');

  const [nominees, setNominees] = useState([]);

  // UI state
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const calcAgeFromDob = (isoDate) => {
    const dob = new Date(isoDate);
    if (Number.isNaN(dob.getTime())) return undefined;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age;
  };

  const validateStep = () => {
    const newErrors = {};
    let isValid = true;

    if (currentStep === 0) { // Account Details
      if (userType === 'EMPLOYEE' && !ehrmsCode.trim()) {
        newErrors.ehrmsCode = 'EHRMS code is required.';
        isValid = false;
      }
      if (userType === 'PENSIONER' && !pensionerNumber.trim()) {
        newErrors.pensionerNumber = 'Pensioner number is required.';
        isValid = false;
      }
      if (!password || password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters.';
        isValid = false;
      }
    } else if (currentStep === 1) { // Personal Details
      if (!fullName.trim()) {
        newErrors.fullName = 'Full name is required.';
        isValid = false;
      }
      if (!dateOfBirth) {
        newErrors.dateOfBirth = 'Date of Birth is required.';
        isValid = false;
      } else {
        const age = calcAgeFromDob(dateOfBirth);
        if (age === undefined || age < 18 || age > 120) {
          newErrors.dateOfBirth = 'Invalid DOB. Must be 18-120 years old.';
          isValid = false;
        }
      }
      if (!/^\d{12}$/.test(aadhaarNumber)) {
        newErrors.aadhaarNumber = 'Aadhaar must be 12 digits.';
        isValid = false;
      }
      if (!/^[6-9]\d{9}$/.test(phone)) {
        newErrors.phone = 'Phone must be 10 digits starting with 6–9.';
        isValid = false;
      }
      if (email && !/\S+@\S+\.\S+/.test(email)) {
        newErrors.email = 'Invalid email format.';
        isValid = false;
      }
    } else if (currentStep === 2) { // Employment & Bank Details
      if (!empState.trim()) {
        newErrors.empState = 'Employment State is required.';
        isValid = false;
      }
      if (!empDistrict.trim()) {
        newErrors.empDistrict = 'Employment District is required.';
        isValid = false;
      }
      if (!empDepartment.trim()) {
        newErrors.empDepartment = 'Employment Department is required.';
        isValid = false;
      }
      if (!empDesignation.trim()) {
        newErrors.empDesignation = 'Employment Designation is required.';
        isValid = false;
      }
      if (!empDoj) {
        newErrors.empDoj = 'Date of Joining is required.';
        isValid = false;
      }
      if (!accountNumber.trim()) {
        newErrors.accountNumber = 'Account number is required.';
        isValid = false;
      }
      if (!bankName.trim()) {
        newErrors.bankName = 'Bank name is required.';
        isValid = false;
      }
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode.toUpperCase())) {
        newErrors.ifscCode = 'Invalid IFSC code (e.g., ABCD0EFGHIJ).';
        isValid = false;
      }
    } else if (currentStep === 3) { // Nominee Details
      if (nominees.length < 1) {
        newErrors.nominees = 'At least one nominee is required.';
        isValid = false;
      } else {
        // Validate each nominee
        nominees.forEach((nominee, index) => {
          if (!nominee.name?.trim()) {
            newErrors[`nomineeName${index}`] = 'Nominee name is required.';
            isValid = false;
          }
          if (!nominee.relation?.trim()) {
            newErrors[`nomineeRelation${index}`] = 'Nominee relation is required.';
            isValid = false;
          }
          if (!nominee.dateOfBirth) {
            newErrors[`nomineeDob${index}`] = 'Nominee Date of Birth is required.';
            isValid = false;
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

  const handleAddNominee = () => {
    if (nominees.length < 2) {
      setNominees([...nominees, { name: '', relation: '', dateOfBirth: '', isPrimary: nominees.length === 0 }]);
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

  async function onSubmit() {
    if (!validateStep()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const age = calcAgeFromDob(dateOfBirth);
      const personalDetails = { fullName, dateOfBirth, age, sex, aadhaarNumber, phone, email };
      const bankDetails = { accountNumber, ifscCode, bankName };
      const employmentDetails = { state: empState, district: empDistrict, department: empDepartment, designation: empDesignation, dateOfJoining: empDoj };

      const payload = {
        userType,
        password,
        personalDetails,
        bankDetails,
        employmentDetails,
        nominees
      };

      if (userType === 'EMPLOYEE') payload.ehrmsCode = ehrmsCode;
      else payload.pensionerNumber = pensionerNumber;

      await register(payload);
      navigate('/');
    } catch (e) {
      setErrors({ form: e?.response?.data?.message || e.message || 'Registration failed.' });
    } finally {
      setLoading(false);
    }
  }

  // Define step components to make render logic cleaner
  const steps = [
    // Step 1: Account Details
    (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">User Type</label>
          <select
            className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
          >
            <option value="EMPLOYEE">Employee</option>
            <option value="PENSIONER">Pensioner</option>
          </select>
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
            placeholder="Min 6 characters"
          />
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
        </div>
      </div>
    ),
    // Step 2: Personal Details
    (
      <div className="space-y-6">
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
          <select
            className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
            value={sex}
            onChange={(e) => setSex(e.target.value)}
          >
            <option value="MALE">MALE</option>
            <option value="FEMALE">FEMALE</option>
            <option value="OTHER">OTHER</option>
          </select>
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
    ),
    // Step 3: Employment & Bank Details
    (
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-teal-800">Employment Details</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700">State</label>
          <input
            className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
            value={empState}
            onChange={(e) => setEmpState(e.target.value)}
            placeholder="Enter state"
          />
          {errors.empState && <p className="mt-1 text-xs text-red-600">{errors.empState}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">District</label>
          <input
            className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
            value={empDistrict}
            onChange={(e) => setEmpDistrict(e.target.value)}
            placeholder="Enter district"
          />
          {errors.empDistrict && <p className="mt-1 text-xs text-red-600">{errors.empDistrict}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Department</label>
          <input
            className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
            value={empDepartment}
            onChange={(e) => setEmpDepartment(e.target.value)}
            placeholder="Enter department"
          />
          {errors.empDepartment && <p className="mt-1 text-xs text-red-600">{errors.empDepartment}</p>}
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
        <h3 className="text-lg font-medium text-teal-800 pt-4">Bank Details</h3>
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
    ),
    // Step 4: Nominee Details
    (
      <div className="space-y-6">
        {nominees.length === 0 && (
          <p className="text-sm text-gray-500 italic">You must add at least one nominee.</p>
        )}
        {nominees.map((nominee, index) => (
          <div key={index} className="relative p-6 border border-teal-200 rounded-lg shadow-sm bg-white">
            <h4 className="text-base font-semibold text-teal-800">Nominee {index + 1}</h4>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <input
                  className="mt-1 w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
                  value={nominee.relation}
                  onChange={(e) => handleNomineeChange(index, 'relation', e.target.value)}
                  placeholder="e.g., Son, Wife, Father"
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
              </div>
              <div className="flex items-center mt-6">
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
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 transition-colors"
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
              className="flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-teal-700 border border-teal-300 hover:bg-teal-50 transition-colors"
            >
              <FaPlus className="h-4 w-4" /> Add Nominee
            </button>
          </div>
        )}
      </div>
    ),
  ];

  const renderForm = () => (
    <div className="w-full max-w-2xl rounded-xl bg-white p-6 sm:p-8 shadow-xl border border-teal-100">
      <h2 className="text-2xl font-bold text-center text-teal-800">
        Register
      </h2>
      <p className="text-center text-sm text-gray-500 mt-1">
        Complete the steps below to create your account.
      </p>
      
      {/* Step Progress Bar */}
      <div className="mt-8 flex justify-between items-center relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 rounded-full"></div>
        <div 
          className="absolute top-1/2 left-0 h-1 bg-teal-500 -z-10 rounded-full transition-all duration-300 ease-in-out" 
          style={{ width: `${(currentStep / (STEP_TITLES.length - 1)) * 100}%` }}
        ></div>
        {STEP_TITLES.map((title, index) => (
          <div key={index} className="flex flex-col items-center">
            <div 
              className={`w-10 h-10 flex items-center justify-center rounded-full border-2 transition-all duration-300 ${
                currentStep >= index ? 'bg-teal-600 border-teal-600 text-white' : 'bg-white border-gray-300 text-gray-500'
              }`}
            >
              {currentStep > index ? <FaCheckCircle className="h-5 w-5" /> : (index === 0 ? <FaUser className="h-5 w-5" /> : index === 1 ? <FaBuilding className="h-5 w-5" /> : index === 2 ? <FaWallet className="h-5 w-5" /> : <FaUsers className="h-5 w-5" />)}
            </div>
            <span className={`text-xs mt-2 font-medium hidden sm:block ${currentStep >= index ? 'text-teal-700' : 'text-gray-500'}`}>
              {title}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="mt-8">
        {/* Render current step's content */}
        {steps[currentStep]}

        {/* Navigation buttons */}
        <div className="mt-8 flex justify-between">
          {currentStep > 0 && (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-2 px-6 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <FaArrowLeft className="h-4 w-4" /> Back
            </button>
          )}

          {currentStep < STEP_TITLES.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="ml-auto flex items-center gap-2 px-6 py-2 rounded-full bg-teal-600 text-white font-semibold shadow-md hover:bg-teal-700 transition-colors"
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
              ) : 'Register'}
            </button>
          )}
        </div>
        {errors.form && <p className="text-center text-sm text-red-600 mt-4">{errors.form}</p>}
      </form>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
      {renderForm()}
    </div>
  );
};

export default Register;
