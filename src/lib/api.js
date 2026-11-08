// Thin fetch wrapper for the local API. Throws an Error with a customer-friendly message.
export async function api(path, { body, ...opts } = {}) {
  let res
  try {
    res = await fetch(`/api${path}`, {
      ...opts,
      method: opts.method ?? (body ? 'POST' : 'GET'),
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error('We couldn’t reach our kitchen just now. Please check your connection and try again.')
  }
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.error ?? 'Something went wrong. Please try again in a moment.')
  return data
}
