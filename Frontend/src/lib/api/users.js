import api from './client'
import { fetchAllClaims } from './claims'

// Toggle using the real /users endpoint via env var.
// Set VITE_USE_USERS_ENDPOINT=true in .env to enable.
const USE_USERS_ENDPOINT = import.meta.env.VITE_USE_USERS_ENDPOINT === 'true'

let warnedMissingUsersEndpoint = false

export async function getAllUsers() {
  // If endpoint is disabled by env, use claims fallback directly to avoid a network 404
  if (!USE_USERS_ENDPOINT) {
    const claims = await fetchAllClaims()
    const ids = new Set()
    claims.forEach(claim => {
      const b = claim?.beneficiary || {}
      const id = b._id || b.userId || b.ehrmsCode || claim?.owner || claim?.createdBy || null
      if (id) ids.add(id)
    })
    return Array.from(ids).map(id => ({ id }))
  }

  // If enabled, attempt to call /users and fallback to deducing from claims on 404
  try {
    const res = await api.get('/users')
    return res.data?.data ?? res.data ?? []
  } catch (err) {
    const status = err?.response?.status
    if (status === 404) {
      if (!warnedMissingUsersEndpoint) {
        console.warn('GET /users not found (404). Falling back to deducing total users from claims.');
        warnedMissingUsersEndpoint = true
      }
      try {
        const claims = await fetchAllClaims()
        const ids = new Set()
        claims.forEach(claim => {
          const b = claim?.beneficiary || {}
          const id = b._id || b.userId || b.ehrmsCode || claim?.owner || claim?.createdBy || null
          if (id) ids.add(id)
        })
        return Array.from(ids).map(id => ({ id }))
      } catch (e) {
        if (!warnedMissingUsersEndpoint) {
          console.warn('Failed to deduce users from claims fallback', e)
          warnedMissingUsersEndpoint = true
        }
        return []
      }
    }
    throw err
  }
}
