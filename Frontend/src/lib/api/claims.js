import { api } from './client'; // Assuming client is imported correctly

export async function fetchAllClaims() {
    const res = await api.get('/claims');
    // Adjusting to match the backend structure: res.data?.data?.claims
    return res.data?.data?.claims ?? []; 
}

export async function createClaim(body) {
    // The body should look like: { type, title, description, beneficiary: beneficiaryId, supportingDocuments: [...] }
    const res = await api.post('/claims', body);
    return res.data?.message || 'Claim created successfully and sent for verification.';
}

export async function fetchClaimById(id) {
    const res = await api.get(`/claims/${id}`);
    return res.data?.data;
}

export async function fetchMyClaims() {
    const res = await api.get('/claims/my-claims');
    return res.data?.data ?? [];
}

export async function getRandomClaims() {
    const res = await api.get('/claims/random');
    return res.data?.data ?? [];
}

export async function getClaimsByType(type, filter = {}, page = 1, limit = 10) {
    const res = await api.get(`/claims/${type}`, {
        params: { ...filter, page, limit }
    });
    return res.data?.data?.claims ?? [];
}