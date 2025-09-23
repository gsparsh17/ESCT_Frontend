export { }

export async function getMyNominees(api) {
	const res = await api.get('/users/nominees')
	return res.data?.data ?? []
}
