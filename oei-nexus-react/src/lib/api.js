/**
 * OEI Nexus — centralized API client
 *
 * Base URL is read from VITE_API_URL (default empty → same origin).
 * In development Vite proxies /api/v1 → http://localhost:8000/api/v1
 * so we never hard-code the backend host in production bundles.
 */

const BASE = `${import.meta.env.VITE_API_URL ?? ''}/api/v1`

// ── Token helpers ──────────────────────────────────────────────────────────
const TOKEN_KEY = 'oei_access_token'

export const tokenStore = {
  get: ()          => localStorage.getItem(TOKEN_KEY),
  set: (t)         => localStorage.setItem(TOKEN_KEY, t),
  clear: ()        => localStorage.removeItem(TOKEN_KEY),
}

// ── Core fetch wrapper ────────────────────────────────────────────────────
async function request(path, options = {}) {
  const token = tokenStore.get()

  const headers = {
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  // Don't set Content-Type for FormData (browser sets it with boundary)
  if (!(options.body instanceof URLSearchParams)) {
    headers['Content-Type'] = headers['Content-Type'] ?? 'application/json'
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers })

  if (res.status === 204) return null

  const payload = await res.json().catch(() => null)

  if (!res.ok) {
    const message =
      payload?.error?.message ??
      payload?.detail ??
      `Request failed: ${res.status}`
    const err = new Error(message)
    err.status = res.status
    err.payload = payload
    throw err
  }

  return payload
}

// ── HTTP verbs ────────────────────────────────────────────────────────────
const get  = (path)        => request(path)
const post = (path, body)  => request(path, { method: 'POST',  body: JSON.stringify(body) })
const patch = (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) })
const del  = (path)        => request(path, { method: 'DELETE' })

// ── Auth ──────────────────────────────────────────────────────────────────
export const authApi = {
  /** OAuth2 password flow — backend expects x-www-form-urlencoded */
  login(email, password) {
    const form = new URLSearchParams({ username: email, password })
    return request('/auth/login', {
      method: 'POST',
      body: form,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
  },
  register: (data)  => post('/auth/register', data),
  me:       ()      => get('/auth/me'),
  refresh:  (token) => post('/auth/refresh', { refresh_token: token }),
}

// ── Projects ──────────────────────────────────────────────────────────────
export const projectsApi = {
  list(params = {}) {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))
    )
    return get(`/projects${qs.toString() ? `?${qs}` : ''}`)
  },
  get:    (id)   => get(`/projects/${id}`),
  create: (data) => post('/projects', data),
  update: (id, data) => patch(`/projects/${id}`, data),
  delete: (id)   => del(`/projects/${id}`),
}

// ── Explorer ──────────────────────────────────────────────────────────────
export const explorerApi = {
  map: () => get('/explorer/map'),
}

// ── Assessments ───────────────────────────────────────────────────────────
export const assessmentsApi = {
  create:         (data) => post('/assessments', data),
  listForProject: (id)   => get(`/assessments/project/${id}`),
  get:            (id)   => get(`/assessments/${id}`),
}

// ── Metrics ───────────────────────────────────────────────────────────────
export const metricsApi = {
  aggregate:          ()   => get('/metrics/aggregate'),
  listForProject: (id) => get(`/metrics/project/${id}`),
  add:            (data)   => post('/metrics', data),
}

// ── Dimension key mapping ─────────────────────────────────────────────────
// Frontend uses short keys; backend uses full names.
export const DIM_KEY_MAP = {
  digital:    'digitalization',
  sdg7:       'sdg7',
  finance:    'finance',
  inclusion:  'inclusion',
  governance: 'governance',
  impact:     'impact',
}

export const DIM_KEY_REVERSE = Object.fromEntries(
  Object.entries(DIM_KEY_MAP).map(([k, v]) => [v, k])
)
