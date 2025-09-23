export { }

export async function fetchAllClaims(api) {
	const res = await api.get('/claims')
	return res.data?.data?.claims ?? []
}

export async function createClaim(body, api) {
	const res = await api.post('/claims', body)
	return res.data?.message || 'Claim submitted successfully!'
}

export async function fetchClaimById(id, api) {
  try {
    const res = await api.get(`/claims/${id}`)
    return res.data?.data
  } catch {
    // Fallback: load all and find locally if endpoint not available
    const all = await fetchAllClaims(api)
    return all.find((c) => c._id === id || c.id === id)
  }
}
