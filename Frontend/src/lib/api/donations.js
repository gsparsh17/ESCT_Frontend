// File: lib/api/donations.js

import { api } from './client'; 

export async function getDonationQueue() {
    const res = await api.get('/donations/queue'); 
    return res.data?.data ?? [];
}

export async function getMe() {
    const res = await api.get('/auth/me');
    return res.data?.data;
}

// --- UPDATED FUNCTION ---
// Now takes a donationId and sends it to the new endpoint
export async function createDonationOrder(donationId) {
    const res = await api.post('/donations/create-order', { donationId });
    return res.data?.data;
}

// --- NEW/RENAMED FUNCTION ---
// This is the new 'add to queue' function that creates the pending donation
export async function initiateDonation(claimId) {
    const res = await api.post('/donations/queue', { claimId });
    return res.data?.data;
}

// --- UPDATED FUNCTION ---
// Now removes by donationId
export async function removeDonationFromQueue(donationId) {
    const res = await api.delete(`/donations/queue/${donationId}`);
    return res.data?.data;
}