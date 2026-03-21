const API_URL = process.env.NEXT_PUBLIC_API_URL

export const USE_MOCK = !API_URL

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

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
  return res.json()
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
    return request<T>('GET', `${path}${buildQuery(params)}`)
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
