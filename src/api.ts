import type { Candidate, Metrics, NewCandidate, Status } from './types'

const BASE = import.meta.env.VITE_API_URL ?? ''
const KEY = 'ww_token'

// Token em sessionStorage: some ao fechar a aba. (Cookie httpOnly seria mais robusto contra XSS, mas exige tratar CSRF.)
let token: string | null = null
try { token = sessionStorage.getItem(KEY) } catch { /* storage indisponível */ }

let onUnauthorized: () => void = () => {}
export const setUnauthorizedHandler = (fn: () => void) => { onUnauthorized = fn }
export const hasToken = () => token !== null

export function setToken(t: string | null) {
  token = t
  try { t ? sessionStorage.setItem(KEY, t) : sessionStorage.removeItem(KEY) } catch { /* ignora */ }
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  if (typeof init.body === 'string') headers.set('Content-Type', 'application/json') // FormData define o próprio
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(`${BASE}/api${path}`, { ...init, headers })
  if (res.status === 401 && path !== '/auth/login') onUnauthorized()
  if (!res.ok) throw new ApiError(res.status, res.statusText)
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export const login = (email: string, password: string) =>
  request<{ token: string; expiresIn: number }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })

export const getCandidates = () => request<Candidate[]>('/candidates')
export const getMetrics = () => request<Metrics>('/metrics')

export const createCandidate = (data: NewCandidate) =>
  request<Candidate>('/candidates', { method: 'POST', body: JSON.stringify(data) })

export const uploadCandidate = (data: FormData) =>
  request<Candidate>('/candidates/upload', { method: 'POST', body: data })

export const updateStatus = (id: string, status: Status) =>
  request<Candidate>(`/candidates/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })

export const deleteCandidate = (id: string) => request<void>(`/candidates/${id}`, { method: 'DELETE' })

export const runAnalysis = () => request<{ processed: number }>('/jobs/analysis', { method: 'POST' })

export const askAssistant = (message: string, candidateId?: string) =>
  request<{ reply: string }>('/assistant', {
    method: 'POST',
    body: JSON.stringify({ message, candidateId: candidateId ? Number(candidateId) : null }),
  })
