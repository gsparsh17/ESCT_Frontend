// lib/api/auth.js
import api from './client'; // Import the configured api instance

export async function login(ehrmsCode, password) {
	const res = await api.post('/auth/login', { ehrmsCode, password })
	console.log(res)
	const token = res.data?.data?.token
	if (!token) throw new Error('Token missing in response')
	return token
}

export async function getMe() {
	const res = await api.get('/auth/me')
	return res.data?.data
}

export async function registerUser(payload) {
	// payload should mirror Flutter register flow combining user + nominee
	const res = await api.post('/auth/register', payload, {
    headers: {
        'Content-Type': 'multipart/form-data'
    }
	})
	const token = res.data?.data?.token
	if (!token) throw new Error('Token missing after registration')
	return token
}

export async function forgotPassword(ehrmsCode) {
    const res = await api.post('/auth/forgot-password', { ehrmsCode });
    return res.data;
}

export async function resetPassword(token, newPassword) {
    const res = await api.put('/auth/reset-password', { token, newPassword });
    return res.data;
}