import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Compass } from 'lucide-react'
import CartDrawer from './components/CartDrawer'
import { BottomNav, Footer, Navbar, Toasts } from './components/Chrome'
import ErrorBoundary from './components/ErrorBoundary'
import { EmptyState } from './components/ui'
import BuildBox from './pages/BuildBox'
import Checkout from './pages/Checkout'
import Home from './pages/Home'
import Product from './pages/Product'
import Shop from './pages/Shop'
import Story from './pages/Story'
import Subscribe from './pages/Subscribe'
import Wishlist from './pages/Wishlist'
import { useCatalog } from './context/catalog'
import { href, useRoute } from './lib/router'

const TITLES = {
  home: 'Velvet Cacao · Bean-to-Bar Artisan Chocolate',
  shop: 'Shop · Velvet Cacao',
  build: 'Build Your Own Box · Velvet Cacao',
  checkout: 'Checkout · Velvet Cacao',
  story: 'Our Story · Velvet Cacao',
  gifting: 'Subscriptions & Gifting · Velvet Cacao',
  wishlist: 'Wishlist · Velvet Cacao',
}

function NotFound() {
  return (
    <div className="pt-32">
      <EmptyState icon={Compass} title="This page wandered off" text="We couldn’t find what you were looking for. Perhaps something sweet instead?" action={<a href={href('')} className="btn-gold">Back to Velvet Cacao</a>} />
    </div>
  )
}

function Page({ name, param }) {
  switch (name) {
    case 'home': return <Home />
    case 'shop': return <Shop />
    case 'product': return <Product id={param} />
    case 'build': return <BuildBox />
    case 'checkout': return <Checkout />
    case 'story': return <Story />
    case 'gifting': return <Subscribe />
    case 'wishlist': return <Wishlist />
    default: return <NotFound />
  }
}

export default function App() {
  const { name, param, hash } = useRoute()
  const pageKey = `${name}/${param ?? ''}`
  const { getProduct } = useCatalog()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    document.title = name === 'product' && getProduct(param) ? `${getProduct(param).name} · Velvet Cacao` : TITLES[name] || 'Velvet Cacao'
  }, [name, param, getProduct])

  return (
    <>
      <a href="#main" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus() }} className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[80] focus:rounded-full focus:bg-gold focus:px-4 focus:py-2 focus:text-cocoa">
        Skip to content
      </a>
      <Navbar />
      <main id="main" tabIndex={-1} className="min-h-screen outline-none">
        <ErrorBoundary key={hash}>
          <AnimatePresence mode="wait">
            <motion.div key={pageKey} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
              <Page name={name} param={param} />
            </motion.div>
          </AnimatePresence>
        </ErrorBoundary>
      </main>
      <Footer />
      <CartDrawer />
      <Toasts />
      <BottomNav />
    </>
  )
}
