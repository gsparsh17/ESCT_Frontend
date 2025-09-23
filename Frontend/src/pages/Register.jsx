import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  // ----- Account / user identity -----
  const [userType, setUserType] = useState('EMPLOYEE') // EMPLOYEE | PENSIONER
  const [ehrmsCode, setEhrmsCode] = useState('')
  const [pensionerNumber, setPensionerNumber] = useState('')
  const [password, setPassword] = useState('')

  // ----- Personal details -----
  const [fullName, setFullName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('') // YYYY-MM-DD
  const [sex, setSex] = useState('MALE')             // MALE | FEMALE | OTHER
  const [aadhaarNumber, setAadhaarNumber] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  // ----- Bank details -----
  const [accountNumber, setAccountNumber] = useState('')
  const [ifscCode, setIfscCode] = useState('')
  const [bankName, setBankName] = useState('')

  // ----- Employment details (required by backend) -----
  const [empState, setEmpState] = useState('')
  const [empDistrict, setEmpDistrict] = useState('')
  const [empDepartment, setEmpDepartment] = useState('')
  const [empDesignation, setEmpDesignation] = useState('')
  const [empDoj, setEmpDoj] = useState('') // YYYY-MM-DD

  const [error, setError] = useState([]) // ALWAYS an array
  const [loading, setLoading] = useState(false)

  function calcAgeFromDob(isoDate) {
    const dob = new Date(isoDate)
    if (Number.isNaN(dob.getTime())) return undefined
    const today = new Date()
    let age = today.getFullYear() - dob.getFullYear()
    const m = today.getMonth() - dob.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--
    return age
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError([])
    setLoading(true)

    try {
      // --------- Client-side validations mirroring backend ---------
      const errs = []

      if (!fullName.trim()) errs.push('Full name is required.')
      if (!dateOfBirth) errs.push('Date of Birth is required.')

      // Aadhaar: 12 digits
      if (!/^\d{12}$/.test(aadhaarNumber)) {
        errs.push('Aadhaar Number must be exactly 12 digits.')
      }

      // Phone: 10 digits starting with 6–9
      if (!/^[6-9]\d{9}$/.test(phone)) {
        errs.push('Phone must be 10 digits and start with 6–9.')
      }

      // IFSC: 11 chars, 4 letters + 0 + 6 alphanumerics
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode)) {
        errs.push('IFSC must be 11 chars like ABCD0EFGHIJ.')
      }

      if (!accountNumber.trim()) errs.push('Account number is required.')
      if (!bankName.trim()) errs.push('Bank name is required.')
      if (!password || password.length < 6) errs.push('Password must be at least 6 characters.')

      if (userType === 'EMPLOYEE' && !ehrmsCode.trim()) {
        errs.push('EHRMS code is required for Employee.')
      }
      if (userType !== 'EMPLOYEE' && !pensionerNumber.trim()) {
        errs.push('Pensioner number is required for Pensioner.')
      }

      // Employment fields (all required by backend)
      if (!empState.trim()) errs.push('Employment State is required.')
      if (!empDistrict.trim()) errs.push('Employment District is required.')
      if (!empDepartment.trim()) errs.push('Employment Department is required.')
      if (!empDesignation.trim()) errs.push('Employment Designation is required.')
      if (!empDoj) errs.push('Employment Date of Joining is required.')

      // Age derived from DOB (send both DOB and age)
      const age = calcAgeFromDob(dateOfBirth)
      if (age === undefined) errs.push('Date of Birth is invalid.')
      if (age !== undefined && (age < 18 || age > 120)) {
        errs.push('Age must be between 18 and 120.')
      }

      if (errs.length) {
        setError(errs)
        setLoading(false)
        return
      }

      // --------- Build payload exactly as backend expects ---------
      const personalDetails = {
        fullName,
        dateOfBirth,  // required
        age,          // derived
        sex,          // MALE/FEMALE/OTHER
        aadhaarNumber,
        phone,
        email
      }

      const bankDetails = {
        accountNumber,
        confirmAccountNumber: accountNumber, // safe no-op; remove if backend rejects
        ifscCode,
        bankName
      }

      const employmentDetails = {
        state: empState,
        district: empDistrict,
        department: empDepartment,
        designation: empDesignation,
        dateOfJoining: empDoj
      }
      // NOTE: Do NOT send isEmployed — backend rejects it.

      const payload = {
        userType,
        password,
        personalDetails,
        bankDetails,
        employmentDetails
      }

      if (userType === 'EMPLOYEE') payload.ehrmsCode = ehrmsCode
      else payload.pensionerNumber = pensionerNumber

      // DO NOT send nominee (backend: "nominee is not allowed")

      await register(payload)
      navigate('/')
    } catch (e) {
      setError([e?.response?.data?.message || e.message || 'Registration failed'])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h2 className="text-xl sm:text-2xl font-semibold text-teal-900">Register</h2>

      <form onSubmit={onSubmit} className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* User type and account identifiers */}
        <div>
          <label className="block text-sm text-teal-700">User Type</label>
          <select
            className="mt-1 w-full rounded border border-teal-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
          >
            <option value="EMPLOYEE">Employee</option>
            <option value="PENSIONER">Pensioner</option>
          </select>
        </div>

        {userType === 'EMPLOYEE' ? (
          <div>
            <label className="block text-sm text-teal-700">EHRMS Code</label>
            <input
              className="mt-1 w-full rounded border border-teal-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
              value={ehrmsCode}
              onChange={(e) => setEhrmsCode(e.target.value)}
              placeholder="Enter EHRMS code"
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm text-teal-700">Pensioner Number</label>
            <input
              className="mt-1 w-full rounded border border-teal-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
              value={pensionerNumber}
              onChange={(e) => setPensionerNumber(e.target.value)}
              placeholder="Enter Pensioner number"
            />
          </div>
        )}

        <div>
          <label className="block text-sm text-teal-700">Password</label>
          <input
            type="password"
            className="mt-1 w-full rounded border border-teal-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min 6 characters"
          />
        </div>

        {/* Personal details */}
        <div>
          <label className="block text-sm text-teal-700">Full Name</label>
          <input
            className="mt-1 w-full rounded border border-teal-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label className="block text-sm text-teal-700">Date of Birth</label>
          <input
            type="date"
            className="mt-1 w-full rounded border border-teal-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm text-teal-700">Sex</label>
          <select
            className="mt-1 w-full rounded border border-teal-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
            value={sex}
            onChange={(e) => setSex(e.target.value)}
          >
            <option value="MALE">MALE</option>
            <option value="FEMALE">FEMALE</option>
            <option value="OTHER">OTHER</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-teal-700">Aadhaar Number</label>
          <input
            className="mt-1 w-full rounded border border-teal-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
            value={aadhaarNumber}
            onChange={(e) => setAadhaarNumber(e.target.value)}
            placeholder="12 digits"
            inputMode="numeric"
          />
        </div>

        <div>
          <label className="block text-sm text-teal-700">Phone</label>
          <input
            className="mt-1 w-full rounded border border-teal-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="10 digits starting 6–9"
            inputMode="numeric"
          />
        </div>

        <div>
          <label className="block text-sm text-teal-700">Email</label>
          <input
            type="email"
            className="mt-1 w-full rounded border border-teal-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        {/* Bank details */}
        <div>
          <label className="block text-sm text-teal-700">Account Number</label>
          <input
            className="mt-1 w-full rounded border border-teal-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            inputMode="numeric"
          />
        </div>

        <div>
          <label className="block text-sm text-teal-700">IFSC Code</label>
          <input
            className="mt-1 w-full uppercase rounded border border-teal-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
            value={ifscCode}
            onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
            placeholder="ABCD0EFGHIJ"
          />
        </div>

        <div>
          <label className="block text-sm text-teal-700">Bank Name</label>
          <input
            className="mt-1 w-full rounded border border-teal-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
          />
        </div>

        {/* Employment details */}
        <h3 className="sm:col-span-2 text-teal-800 font-medium mt-2">
          Employment Details
        </h3>

        <div>
          <label className="block text-sm text-teal-700">State</label>
          <input
            className="mt-1 w-full rounded border border-teal-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
            value={empState}
            onChange={(e) => setEmpState(e.target.value)}
            placeholder="Enter state"
          />
        </div>

        <div>
          <label className="block text-sm text-teal-700">District</label>
          <input
            className="mt-1 w-full rounded border border-teal-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
            value={empDistrict}
            onChange={(e) => setEmpDistrict(e.target.value)}
            placeholder="Enter district"
          />
        </div>

        <div>
          <label className="block text-sm text-teal-700">Department</label>
          <input
            className="mt-1 w-full rounded border border-teal-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
            value={empDepartment}
            onChange={(e) => setEmpDepartment(e.target.value)}
            placeholder="Enter department"
          />
        </div>

        <div>
          <label className="block text-sm text-teal-700">Designation</label>
          <input
            className="mt-1 w-full rounded border border-teal-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
            value={empDesignation}
            onChange={(e) => setEmpDesignation(e.target.value)}
            placeholder="Enter designation"
          />
        </div>

        <div>
          <label className="block text-sm text-teal-700">Date of Joining</label>
          <input
            type="date"
            className="mt-1 w-full rounded border border-teal-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
            value={empDoj}
            onChange={(e) => setEmpDoj(e.target.value)}
          />
        </div>

        {/* Errors */}
        {Array.isArray(error) && error.length > 0 && (
          <ul className="sm:col-span-2 text-red-600 text-sm list-disc pl-5">
            {error.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        )}

        {/* Submit */}
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-teal-600 text-white py-2.5 font-medium hover:bg-teal-700 disabled:opacity-60"
          >
            {loading ? 'Registering…' : 'Register'}
          </button>
        </div>
      </form>
    </div>
  )
}
