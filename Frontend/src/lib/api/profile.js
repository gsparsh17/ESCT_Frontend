import { api } from './client' // Import the configured API instance

// Note: getMyNominees is retained from your provided snippet for consistency
export async function getMyNominees() {
    const res = await api.get('/nominees')
    console.log(res)
    return res.data?.data ?? []
}

/**
 * Fetches the user's complete profile data.
 * Assumes the main profile data is available at /auth/me or a similar comprehensive endpoint.
 * @returns {Promise<object>} The user data including personal, employment, and bank details.
 */
export async function fetchUserData() {
    // Assuming /auth/me returns the comprehensive user profile
    const res = await api.get('/auth/me') 
    console.log(res)
    return res.data?.data
}

/**
 * Updates a specific section of the user's profile.
 * @param {string} section - The profile section to update (e.g., 'personal', 'bank').
 * @param {object} data - The updated data for that section.
 * @returns {Promise<object>} The server response (e.g., success message).
 */
export async function updateProfile(section, data) {
    // Endpoint adjusted to match the pattern /users/<section>
    const res = await api.put(`/users/${section}`, data) 
    console.log(res)
    return res.data
}

/**
 * Adds a new nominee.
 * @param {object} nominee - The new nominee details.
 * @returns {Promise<object>} The newly added nominee object from the server.
 */
export async function addNominee(nominee) {
    const res = await api.post('/nominees', nominee)
    console.log(res)
    return res.data?.data
}

/**
 * Deletes a nominee by ID.
 * @param {string} id - The ID of the nominee to delete.
 * @returns {Promise<object>} The server response (e.g., success message).
 */
export async function deleteNominee(id) {
    const res = await api.delete(`/nominees/${id}`)
    console.log(res)
    return res.data
}