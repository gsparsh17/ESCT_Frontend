import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Register() {
	const { register } = useAuth()
	const navigate = useNavigate()
	const [userType, setUserType] = useState('EMPLOYEE')
	const [ehrmsCode, setEhrmsCode] = useState('')
	const [pensionerNumber, setPensionerNumber] = useState('')
	const [password, setPassword] = useState('')
	const [fullName, setFullName] = useState('')
	const [dateOfBirth, setDateOfBirth] = useState('')
	const [aadhaarNumber, setAadhaarNumber] = useState('')
	const [phone, setPhone] = useState('')
	const [email, setEmail] = useState('')
	const [accountNumber, setAccountNumber] = useState('')
	const [ifscCode, setIfscCode] = useState('')
	const [bankName, setBankName] = useState('')
	const [nomineeName, setNomineeName] = useState('')
	const [nomineeRelation, setNomineeRelation] = useState('Spouse')
	const [nomineeDob, setNomineeDob] = useState('')
	const [nomineeAadhaar, setNomineeAadhaar] = useState('')
	const [nomineeAccount, setNomineeAccount] = useState('')
	const [nomineeIfsc, setNomineeIfsc] = useState('')
	const [nomineeBank, setNomineeBank] = useState('')
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)

	async function onSubmit(e) {
		e.preventDefault()
		setError('')
		setLoading(true)
		try {
			const personalDetails = { fullName, dateOfBirth, sex: 'NA', aadhaarNumber, phone, email }
			const bankDetails = { accountNumber, confirmAccountNumber: accountNumber, ifscCode, bankName }
			const nominee = {
				name: nomineeName,
				relation: nomineeRelation,
				dateOfBirth: nomineeDob,
				aadhaarNumber: nomineeAadhaar,
				bankDetails: { accountNumber: nomineeAccount, ifscCode: nomineeIfsc, bankName: nomineeBank },
				isPrimary: true,
			}
			const payload = { userType, password, personalDetails, bankDetails }
			if (userType === 'EMPLOYEE') payload.ehrmsCode = ehrmsCode
			else payload.pensionerNumber = pensionerNumber
			payload.nominee = nominee
			await register(payload)
			navigate('/')
		} catch (e) {
			setError(e.message || 'Registration failed')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div>
			<h2 className="text-lg sm:text-xl font-semibold">Register</h2>
			<form onSubmit={onSubmit} className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
				<div>
					<label className="block text-sm text-teal-700">User Type</label>
					<select className="mt-1 w-full rounded-lg border border-teal-300 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500" value={userType} onChange={(e) => setUserType(e.target.value)}>
						<option>EMPLOYEE</option>
						<option>PENSIONER</option>
					</select>
				</div>
				{userType === 'EMPLOYEE' ? (
					<div>
						<label className="block text-sm text-teal-700">EHRMS Code</label>
						<input className="mt-1 w-full rounded-lg border border-teal-300 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500" value={ehrmsCode} onChange={(e) => setEhrmsCode(e.target.value)} required />
					</div>
				) : (
					<div>
						<label className="block text-sm text-teal-700">Pensioner Number</label>
						<input className="mt-1 w-full rounded-lg border border-teal-300 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500" value={pensionerNumber} onChange={(e) => setPensionerNumber(e.target.value)} required />
					</div>
				)}
				<div>
					<label className="block text-sm text-teal-700">Password</label>
					<input type="password" className="mt-1 w-full rounded-lg border border-teal-300 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500" value={password} onChange={(e) => setPassword(e.target.value)} required />
				</div>

				<div className="sm:col-span-2 mt-4 sm:mt-6 font-medium text-teal-900">Personal Details</div>
				<div>
					<label className="block text-sm text-teal-700">Full Name</label>
					<input className="mt-1 w-full rounded border border-teal-300 px-3 py-2" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
				</div>
				<div>
					<label className="block text-sm text-teal-700">Date of Birth</label>
					<input type="date" className="mt-1 w-full rounded border border-teal-300 px-3 py-2" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} required />
				</div>
				<div>
					<label className="block text-sm text-teal-700">Aadhaar Number</label>
					<input className="mt-1 w-full rounded border border-teal-300 px-3 py-2" value={aadhaarNumber} onChange={(e) => setAadhaarNumber(e.target.value)} required />
				</div>
				<div>
					<label className="block text-sm text-teal-700">Phone</label>
					<input className="mt-1 w-full rounded border border-teal-300 px-3 py-2" value={phone} onChange={(e) => setPhone(e.target.value)} />
				</div>
				<div>
					<label className="block text-sm text-teal-700">Email</label>
					<input type="email" className="mt-1 w-full rounded border border-teal-300 px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} />
				</div>

				<div className="md:col-span-2 mt-6 font-medium">Bank Details</div>
				<div>
					<label className="block text-sm text-teal-700">Account Number</label>
					<input className="mt-1 w-full rounded border border-teal-300 px-3 py-2" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} required />
				</div>
				<div>
					<label className="block text-sm text-teal-700">IFSC Code</label>
					<input className="mt-1 w-full rounded border border-teal-300 px-3 py-2" value={ifscCode} onChange={(e) => setIfscCode(e.target.value)} required />
				</div>
				<div>
					<label className="block text-sm text-teal-700">Bank Name</label>
					<input className="mt-1 w-full rounded border border-teal-300 px-3 py-2" value={bankName} onChange={(e) => setBankName(e.target.value)} required />
				</div>

				<div className="md:col-span-2 mt-6 font-medium">Nominee</div>
				<div>
					<label className="block text-sm text-teal-700">Name</label>
					<input className="mt-1 w-full rounded border border-teal-300 px-3 py-2" value={nomineeName} onChange={(e) => setNomineeName(e.target.value)} required />
				</div>
				<div>
					<label className="block text-sm text-teal-700">Relation</label>
					<input className="mt-1 w-full rounded border border-teal-300 px-3 py-2" value={nomineeRelation} onChange={(e) => setNomineeRelation(e.target.value)} required />
				</div>
				<div>
					<label className="block text-sm text-teal-700">Date of Birth</label>
					<input type="date" className="mt-1 w-full rounded border border-teal-300 px-3 py-2" value={nomineeDob} onChange={(e) => setNomineeDob(e.target.value)} required />
				</div>
				<div>
					<label className="block text-sm text-teal-700">Aadhaar Number</label>
					<input className="mt-1 w-full rounded border border-teal-300 px-3 py-2" value={nomineeAadhaar} onChange={(e) => setNomineeAadhaar(e.target.value)} required />
				</div>
				<div>
					<label className="block text-sm text-teal-700">Account Number</label>
					<input className="mt-1 w-full rounded border border-teal-300 px-3 py-2" value={nomineeAccount} onChange={(e) => setNomineeAccount(e.target.value)} required />
				</div>
				<div>
					<label className="block text-sm text-teal-700">IFSC Code</label>
					<input className="mt-1 w-full rounded border border-teal-300 px-3 py-2" value={nomineeIfsc} onChange={(e) => setNomineeIfsc(e.target.value)} required />
				</div>
				<div>
					<label className="block text-sm text-teal-700">Bank Name</label>
					<input className="mt-1 w-full rounded border border-teal-300 px-3 py-2" value={nomineeBank} onChange={(e) => setNomineeBank(e.target.value)} required />
				</div>

				{error && <p className="sm:col-span-2 text-red-600 text-sm">{error}</p>}
				<button disabled={loading} className="sm:col-span-2 rounded-lg bg-teal-600 px-4 py-2 text-sm text-white disabled:opacity-60 hover:bg-teal-700">{loading ? 'Registering...' : 'Register'}</button>
			</form>
		</div>
	)
}
