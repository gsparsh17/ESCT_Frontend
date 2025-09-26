import { api } from './client'; // Assuming api client is available

/**
 * Fetches the user's calendar event summary, which includes monthly donation completion data.
 * @returns {Promise<Array>} List of CalendarEvent documents.
 */
export async function getDonationCalendar() {
    const res = await api.get('/users/calendar'); 
    return res.data?.data ?? [];
}
