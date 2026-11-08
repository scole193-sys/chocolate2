import { useSyncExternalStore } from 'react'

// Tiny hash router: "#/product/esmeraldas-72" -> { name: 'product', param: 'esmeraldas-72' }
const subscribe = (cb) => {
  window.addEventListener('hashchange', cb)
  return () => window.removeEventListener('hashchange', cb)
}
const getHash = () => window.location.hash || '#/'

export function useRoute() {
  const hash = useSyncExternalStore(subscribe, getHash)
  const [path, query = ''] = hash.replace(/^#\/?/, '').split('?')
  const [name = '', param] = path.split('/')
  return { name: name || 'home', param, query: new URLSearchParams(query), hash }
}

export const href = (path) => `#/${path.replace(/^\//, '')}`
export const navigate = (path) => {
  window.location.hash = href(path)
}
