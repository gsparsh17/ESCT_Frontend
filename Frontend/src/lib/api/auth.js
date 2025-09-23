export { }

export async function login(ehrmsCode, password, api) {
	const res = await api.post('/auth/login', { ehrmsCode, password })
	const token = res.data?.data?.token
	if (!token) throw new Error('Token missing in response')
	return token
}

export async function getMe(api) {
	const res = await api.get('/auth/me')
	return res.data?.data
}

export async function registerUser(payload, api) {
	// payload should mirror Flutter register flow combining user + nominee
	const res = await api.post('/auth/register', payload)
	const token = res.data?.data?.token
	if (!token) throw new Error('Token missing after registration')
	return token
}
