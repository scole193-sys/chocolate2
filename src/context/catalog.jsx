import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { REVIEWS } from '../data/content'
import { products as bundledProducts } from '../data/products'
import { api } from '../lib/api'

const CatalogContext = createContext(null)

// Renders instantly from the bundled catalogue, then swaps in the live rows from Neon.
export function CatalogProvider({ children }) {
  const [state, setState] = useState({ products: bundledProducts, reviews: REVIEWS, source: 'loading' })

  useEffect(() => {
    let cancelled = false
    Promise.all([api('/products'), api('/reviews')])
      .then(([products, reviews]) => !cancelled && setState({ products, reviews, source: 'database' }))
      .catch((err) => {
        console.info('Velvet Cacao: using bundled catalogue —', err.message)
        if (!cancelled) setState((s) => ({ ...s, source: 'bundled' }))
      })
    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo(() => {
    const byId = new Map(state.products.map((p) => [p.id, p]))
    return { ...state, getProduct: (id) => byId.get(id) }
  }, [state])

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCatalog = () => useContext(CatalogContext)
