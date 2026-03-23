const rawApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim()
const normalizedApiUrl = rawApiUrl && rawApiUrl !== 'undefined' && rawApiUrl !== 'null'
  ? rawApiUrl
  : undefined

const API_URL = normalizedApiUrl ?? 'http://localhost:8080'

export const USE_MOCK = !normalizedApiUrl

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface WrappedResponse<T> {
  data: T
  message?: string
  success: boolean
}

function isWrappedResponse<T>(value: unknown): value is WrappedResponse<T> {
  return typeof value === 'object'
    && value !== null
    && 'success' in value
    && 'data' in value
}

function normalizeParams(params?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!params) return undefined
  const next = { ...params }
  if ('sortKey' in next && !('sortBy' in next)) {
    next.sortBy = next.sortKey === 'stockStatus' ? 'quantityInStock' : next.sortKey
  }
  delete next.sortKey
  return next
}

async function request<T>(method: HttpMethod, path: string, data?: unknown): Promise<T> {
  const url = `${API_URL}${path}`
  const options: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: data ? JSON.stringify(data) : undefined,
  }

  const res = await fetch(url, options)
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message ?? `HTTP ${res.status}`)
  }

  if (res.status === 204) return undefined as T
  const json = await res.json()
  return (isWrappedResponse<T>(json) ? json.data : json) as T
}

function buildQuery(params?: Record<string, unknown>): string {
  if (!params) return ''
  const q = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      q.set(key, String(value))
    }
  }
  const s = q.toString()
  return s ? `?${s}` : ''
}

export const apiClient = {
  get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
    return request<T>('GET', `${path}${buildQuery(normalizeParams(params))}`)
  },
  post<T>(path: string, data?: unknown): Promise<T> {
    return request<T>('POST', path, data)
  },
  put<T>(path: string, data?: unknown): Promise<T> {
    return request<T>('PUT', path, data)
  },
  patch<T>(path: string, data?: unknown): Promise<T> {
    return request<T>('PATCH', path, data)
  },
  delete<T = void>(path: string): Promise<T> {
    return request<T>('DELETE', path)
  },
}
