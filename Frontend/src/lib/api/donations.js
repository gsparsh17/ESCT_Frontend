import { api } from './client'; 

export async function getDonationQueue() {
    const res = await api.get('/donations/queue'); 
    return res.data?.data ?? [];
}

export async function getMe() {
    const res = await api.get('/auth/me');
    return res.data?.data;
}

export async function createDonationOrder(claimId) {
    const res = await api.post('/donations/create-order', { claimId });
    return res.data?.data;
}

export async function addToDonationQueue(claimId) {
    const res = await api.post('/donations/add-to-queue', { claimId });
    return res.data?.data;
}

export async function removeDonationFromQueue(claimId) {
    const res = await api.delete(`/donations/queue/${claimId}`);
    return res.data?.data;
}