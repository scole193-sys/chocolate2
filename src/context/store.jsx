import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { load, save } from '../lib/format'

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [cart, setCart] = useState(() => load('vc-cart', []))
  const [wishlist, setWishlist] = useState(() => load('vc-wishlist', []))
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'dark')
  const [cartOpen, setCartOpen] = useState(false)
  const [toasts, setToasts] = useState([])
  const toastId = useRef(0)

  useEffect(() => save('vc-cart', cart), [cart])
  useEffect(() => save('vc-wishlist', wishlist), [wishlist])
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#1A0F0A' : '#F6EEE3')
    try {
      localStorage.setItem('vc-theme', theme)
    } catch {
      /* non-essential */
    }
  }, [theme])

  const toast = useCallback((message, { tone = 'success', action } = {}) => {
    const id = ++toastId.current
    setToasts((t) => [...t.slice(-2), { id, message, tone, action }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600)
  }, [])
  const dismissToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  // Items with the same key merge; custom boxes get a unique key so each stays separate.
  const addToCart = useCallback((item, qty = 1) => {
    setCart((c) => {
      const existing = c.find((x) => x.key === item.key)
      if (existing) return c.map((x) => (x.key === item.key ? { ...x, qty: Math.min(x.qty + qty, 20) } : x))
      return [...c, { ...item, qty }]
    })
  }, [])
  const setQty = useCallback((key, qty) => {
    setCart((c) => (qty <= 0 ? c.filter((x) => x.key !== key) : c.map((x) => (x.key === key ? { ...x, qty: Math.min(qty, 20) } : x))))
  }, [])
  const removeFromCart = useCallback((key) => setCart((c) => c.filter((x) => x.key !== key)), [])
  const clearCart = useCallback(() => setCart([]), [])

  const toggleWish = useCallback(
    (id, name) => {
      const has = wishlist.includes(id)
      setWishlist((w) => (has ? w.filter((x) => x !== id) : [...w, id]))
      toast(has ? `Removed ${name} from your wishlist` : `Saved ${name} to your wishlist`, { tone: has ? 'neutral' : 'love' })
    },
    [wishlist, toast],
  )

  const value = useMemo(() => {
    const count = cart.reduce((n, x) => n + x.qty, 0)
    const subtotal = cart.reduce((n, x) => n + x.qty * x.price, 0)
    return {
      cart, count, subtotal, addToCart, setQty, removeFromCart, clearCart,
      cartOpen, setCartOpen,
      wishlist, toggleWish,
      theme, toggleTheme: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
      toasts, toast, dismissToast,
    }
  }, [cart, addToCart, setQty, removeFromCart, clearCart, cartOpen, wishlist, toggleWish, theme, toasts, toast, dismissToast])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useStore = () => useContext(StoreContext)
