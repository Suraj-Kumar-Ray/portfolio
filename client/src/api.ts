import type { ApiResult, Content, ContactPayload, InquiryPayload } from './types'

const BASE = '/api'

async function request<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  })
  const body = (await res.json().catch(() => ({ ok: false, error: 'Unexpected server response.' }))) as ApiResult<T>
  if (!res.ok && body.ok === undefined) body.ok = false
  return body
}

declare global {
  interface Window {
    // Server-injected in index.html so the first paint needs no API round-trip.
    __CONTENT__?: Content
  }
}

// Prefer the content the server already inlined into the page (zero network
// latency, instant first paint). Fall back to the API on the dev server or any
// page that was not server-rendered.
export const getContent = async (): Promise<ApiResult<Content>> => {
  if (window.__CONTENT__) return { ok: true, data: window.__CONTENT__ }
  return request<Content>('/content')
}

// Asks the server where the private dashboard lives. Only used by the tiny
// footer icon, so the URL never appears in the public page or bundle.
export const getPanelPath = () => request<{ path: string }>('/admin/entry')

export const sendContact = (payload: ContactPayload) =>
  request<{ id: string }>('/contact', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

// "Work with me" project enquiry — lands in the same dashboard inbox, tagged as
// a client enquiry so it is easy to spot next to normal contact messages.
export const sendInquiry = (payload: InquiryPayload) =>
  request<{ id: string }>('/inquiry', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
