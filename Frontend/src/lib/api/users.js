import api from './client'
import { fetchAllClaims } from './claims'

const USE_USERS_ENDPOINT = true

let warnedMissingUsersEndpoint = false

export async function getAllUsers() {
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

  try {
    const res = await api.get('/admin/users') 
    console.log(res)
    return res.data?.data ?? res.data ?? []
  } catch (err) {
    const status = err?.response?.status
    
    if (!warnedMissingUsersEndpoint) {
      console.error('Failed to fetch users from /admin/users endpoint. Falling back is disabled.', err);
      warnedMissingUsersEndpoint = true
    }
    
    throw err
  }
}
