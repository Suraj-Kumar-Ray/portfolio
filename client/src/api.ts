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

export const getContent = () => request<Content>('/content')

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
