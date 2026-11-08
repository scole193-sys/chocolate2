// Mock editorial content: stats, pairings, story, subscriptions, reviews and box builder.
const img = (name) => `/images/${name}.jpg`

export const STATS = [
  { value: 14, suffix: '', label: 'Single-origin farms' },
  { value: 128, suffix: 'k', label: 'Bars handcrafted' },
  { value: 4900, suffix: '+', label: 'Five-star reviews' },
]

export const FREE_SHIPPING_AT = 75

export const SHIPPING = [
  { id: 'standard', label: 'Standard', detail: '2–3 days · cool-packed', price: 8 },
  { id: 'express', label: 'Express', detail: 'Next day · insulated', price: 15 },
]

// Standard shipping is free over the threshold; express is always charged.
export const shippingCost = (methodId, subtotal) => {
  const m = SHIPPING.find((s) => s.id === methodId) ?? SHIPPING[0]
  return m.id === 'standard' && subtotal >= FREE_SHIPPING_AT ? 0 : m.price
}

export const PAIRINGS = [
  {
    productId: 'esmeraldas-72',
    pair: 'Espresso',
    title: '72% Ecuador + espresso',
    note: 'Let a square melt on your tongue, then sip. The coffee’s bitterness lifts the cherry notes and lengthens the finish.',
    image: img('espresso-pairing'),
    alt: 'A small cup of espresso on a white saucer against a dark background',
  },
  {
    productId: 'sambirano-85',
    pair: 'Earl Grey tea',
    title: '85% Madagascar + Earl Grey',
    note: 'Bergamot meets wild raspberry. Brew the tea strong and let it cool slightly before pairing.',
    image: img('dark-85-madagascar-bar'),
    alt: 'Stacked Sambirano 85% chocolate bars',
  },
  {
    productId: 'chuao-milk-45',
    pair: 'Aged rum',
    title: '45% Chuao milk + aged rum',
    note: 'Caramel on caramel. A ten-year Venezuelan rum brings out the malt and honey in the milk chocolate.',
    image: img('milk-45-venezuela-bar'),
    alt: 'Chuao dark milk chocolate squares',
  },
  {
    productId: 'sea-salt-almond',
    pair: 'Fino sherry',
    title: 'Sea salt almond + fino sherry',
    note: 'Bone-dry and saline, fino turns the roasted almonds into something close to marzipan.',
    image: img('salted-almond-bar'),
    alt: 'Dark chocolate with almonds and sea salt',
  },
  {
    productId: 'midnight-ganache',
    pair: 'Pinot Noir',
    title: 'Midnight ganache + Pinot Noir',
    note: 'A light, cherry-scented red frames the espresso ganache without overwhelming it.',
    image: img('midnight-ganache-truffles'),
    alt: 'Dark truffles in a ceramic bowl',
  },
  {
    productId: 'piedmont-hazelnut',
    pair: 'Oat flat white',
    title: 'Hazelnut praline + flat white',
    note: 'The classic Torino breakfast, reimagined. Toasty, creamy and dangerously moreish.',
    image: img('hazelnut-praline-bar'),
    alt: 'Hazelnut praline chocolate bars',
  },
  {
    productId: 'blood-orange-bonbons',
    pair: 'Champagne',
    title: 'Blood orange bonbon + Champagne',
    note: 'Fine bubbles cut through the caramel and make the citrus sing. Our New Year’s ritual.',
    image: img('blood-orange-bonbons'),
    alt: 'Dark bonbons beside fresh oranges',
  },
]

export function pairingOfTheDay(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0)
  const day = Math.floor((date - start) / 86400000)
  return PAIRINGS[day % PAIRINGS.length]
}

export const JOURNEY = [
  {
    step: 'Farm',
    title: 'Grown in the shade',
    days: 'Day 1–7',
    text: 'Pods are hand-harvested at peak ripeness by partner farmers we pay at least 2.5× Fairtrade. Beans ferment under banana leaves for six days.',
    image: img('cacao-pods-trunk'),
    alt: 'Crimson cacao pods growing straight from the trunk of a cacao tree',
  },
  {
    step: 'Roast',
    title: 'Low, slow and listened to',
    days: 'Day 30',
    text: 'In our small drum roaster we listen for the first crack, then pull each batch by smell. Roasting unlocks over 600 aroma compounds.',
    image: img('roasted-cacao-beans'),
    alt: 'Freshly roasted cacao beans piled together',
  },
  {
    step: 'Conch',
    title: '72 hours of stirring',
    days: 'Day 31–34',
    text: 'Granite rollers grind nibs, sugar and cocoa butter for three days, softening acidity until the chocolate pours like silk.',
    image: img('melted-chocolate-texture'),
    alt: 'Glossy liquid chocolate folding over itself',
  },
  {
    step: 'Temper',
    title: 'The snap and the shine',
    days: 'Day 35',
    text: 'We temper by hand on marble, cooling to 27°C and warming to 31°C so the cocoa butter sets into its glossy, snapping Form V crystal.',
    image: img('chocolate-drip-spatula'),
    alt: 'Melted chocolate dripping from a spatula into a glass bowl',
  },
  {
    step: 'Wrap',
    title: 'Foiled and sealed',
    days: 'Day 36',
    text: 'Every bar is wrapped in compostable gold foil and a letterpress sleeve printed with its batch, farm and roast date.',
    image: img('chocolate-bar-rows'),
    alt: 'Rows of finished chocolate bars lined up on a table',
  },
]

export const CHOCOLATIERS = [
  {
    name: 'Kenji Arata',
    role: 'Founder & Head Chocolatier',
    bio: 'Trained in Lyon and Tokyo. Kenji still tastes every batch before it leaves the kitchen.',
    image: img('chocolatier-kenji'),
    alt: 'Portrait of a chocolatier with arms crossed, wearing a grey apron',
  },
  {
    name: 'Mateo Ruiz',
    role: 'Roast Master',
    bio: 'Grew up on a cacao farm in Arauca. Mateo builds each roast profile by ear and by nose.',
    image: img('chocolatier-mateo'),
    alt: 'Smiling chocolatier in a navy apron',
  },
  {
    name: 'Elise Moreau',
    role: 'Bonbon Artist',
    bio: 'Former pastry chef who hand-paints every Jewel bonbon. Over 40 flavours to her name.',
    image: img('chocolatier-elise'),
    alt: 'Chocolatier piping filling with a pastry bag in a warm kitchen',
  },
]

export const PLANS = [
  {
    id: 'discovery',
    name: 'Discovery',
    price: 29,
    tagline: 'For the curious',
    features: ['3 single-origin bars', 'Illustrated tasting card', 'Free shipping', 'Skip or pause anytime'],
    image: img('dark-72-ecuador-bar'),
  },
  {
    id: 'connoisseur',
    name: 'Connoisseur',
    price: 49,
    tagline: 'Our most loved',
    featured: true,
    features: ['5 bars + 6 seasonal truffles', 'Guided video tasting', 'Members-only releases', 'Free shipping', '10% off the shop'],
    image: img('truffle-collection'),
  },
  {
    id: 'grand-cru',
    name: 'Grand Cru',
    price: 89,
    tagline: 'The full experience',
    features: ['Rare micro-lot bars', '12 hand-painted bonbons', 'Pairing notes from our sommelier', 'Annual farm-trip draw', '15% off the shop'],
    image: img('jewel-bonbon-box'),
  },
]

export const CYCLES = [
  { id: 'monthly', label: 'Monthly', months: 1, discount: 0 },
  { id: 'six', label: '6 months prepaid', months: 6, discount: 0.1 },
]

export const planPrice = (plan, cycle) => Math.round(plan.price * cycle.months * (1 - cycle.discount))

export const REVIEWS = [
  { name: 'Amara O.', place: 'London', rating: 5, product: 'Esmeraldas 72%', text: 'I have tried bars from all over the world and this is the one I keep coming back to. The cherry note is unreal.', date: '2026-10-28' },
  { name: 'Lucas M.', place: 'Melbourne', rating: 5, product: 'Connoisseur subscription', text: 'The tasting cards are gorgeous and genuinely teach you something. My partner and I make an evening of it every month.', date: '2026-10-19' },
  { name: 'Priya S.', place: 'Toronto', rating: 5, product: 'Build your own box', text: 'Built a 24-piece box for my mum’s 60th. The gold ribbon and handwritten note made her cry (the good kind).', date: '2026-10-11' },
  { name: 'Jonah R.', place: 'Brooklyn', rating: 4, product: 'Sambirano 85%', text: 'Bold and fruity — not for the faint-hearted. Pair it with black tea, trust me.', date: '2026-09-30' },
  { name: 'Sofia L.', place: 'Milan', rating: 5, product: 'Piedmont Hazelnut Praline', text: 'As an Italian I was sceptical. I was wrong. Better than anything I can buy at home.', date: '2026-09-22' },
  { name: 'Hana K.', place: 'Seoul', rating: 5, product: 'Jewel Bonbon Box', text: 'Every bonbon looks like a tiny gemstone. The passion fruit one is my favourite thing I ate this year.', date: '2026-09-14' },
]

export const TRUFFLES = [
  { id: 'cocoa', name: 'Classic Cocoa', note: '70% Belize ganache', image: img('cocoa-dusted-truffles'), pos: '45% 55%', zoom: 2.4 },
  { id: 'hazelnut', name: 'Hazelnut Crunch', note: 'Milk praline & brittle', image: img('hazelnut-crunch-truffles'), pos: '35% 45%', zoom: 2.6 },
  { id: 'midnight', name: 'Midnight Espresso', note: '80% & cold brew', image: img('midnight-ganache-truffles'), pos: '50% 48%', zoom: 3 },
  { id: 'grandcru', name: 'Grand Cru', note: 'Single-origin rotation', image: img('truffle-collection'), pos: '30% 30%', zoom: 3.2 },
  { id: 'orange', name: 'Blood Orange', note: 'Caramel & rosemary', image: img('blood-orange-bonbons'), pos: '50% 70%', zoom: 3 },
  { id: 'jewel', name: 'Passion Jewel', note: 'Passion fruit pâte', image: img('jewel-bonbon-box'), pos: '45% 50%', zoom: 3.4 },
  { id: 'praline', name: 'Gianduja Square', note: 'Hazelnut gianduja', image: img('square-praline-box'), pos: '50% 55%', zoom: 3.4 },
  { id: 'duo', name: 'Honeycomb', note: 'Wildflower honey', image: img('truffle-duo-box'), pos: '42% 62%', zoom: 2.6 },
]

export const BOX_SIZES = [
  { size: 6, price: 24, cols: 3, label: 'Petite' },
  { size: 12, price: 44, cols: 4, label: 'Classic' },
  { size: 24, price: 82, cols: 6, label: 'Grand' },
]

export const RIBBONS = [
  { id: 'gold', name: 'Gold', color: 'linear-gradient(135deg,#f3d9a4,#d4a256 50%,#b8733d)' },
  { id: 'burgundy', name: 'Burgundy', color: 'linear-gradient(135deg,#9b2c3c,#6d1a27)' },
  { id: 'ivory', name: 'Ivory', color: 'linear-gradient(135deg,#fffaf0,#e8dcc6)' },
  { id: 'noir', name: 'Noir', color: 'linear-gradient(135deg,#3a3a3a,#0d0d0d)' },
]
