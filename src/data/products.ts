export type Product = {
  id: string
  name: string
  category: string
  material: string
  note: string
  description: string
  image: string
  images: string[]
  price: number
  burn: string
  scent: string
  tag?: string
}

// Prices are demo storefront values and can be replaced with the brand's real pricing.
export const products: Product[] = [
  {
    id: 'structured-bark',
    name: 'Зріз зі структурною корою',
    category: 'Зрізи',
    material: 'натуральне дерево · кора',
    note: 'кожен зріз має власну геометрію',
    description: 'Свічка у натуральному зрізі дерева зі збереженою структурою кори. Форма не повторюється — її задає саме дерево.',
    image: '/assets/products/esther-13.webp',
    images: ['/assets/products/esther-13.webp', '/assets/products/esther-10.webp', '/assets/products/esther-01.webp'],
    price: 980,
    burn: '20–28 год',
    scent: 'деревний / теплий',
    tag: 'one of one',
  },
  {
    id: 'small-set',
    name: 'Сет маленьких зрізів',
    category: 'Сети',
    material: 'дерево · віск · деревʼяний гніт',
    note: 'композиція з кількох природних форм',
    description: 'Набір невеликих свічок зі зрізів дерева. Їх можна ставити разом як композицію або розділяти у просторі.',
    image: '/assets/products/esther-07.webp',
    images: ['/assets/products/esther-07.webp', '/assets/products/esther-02.webp', '/assets/products/esther-01.webp'],
    price: 1290,
    burn: '4 × 8–10 год',
    scent: 'чистий віск / дерево',
    tag: 'set',
  },
  {
    id: 'burned-wood',
    name: 'Обпалена деревина',
    category: 'Оброблені',
    material: 'ручне обпалення · масив дерева',
    note: 'глибокий чорний тон підкреслює рельєф',
    description: 'Свічка в обпаленій деревині. Спеціальна обробка затемнює поверхню та підкреслює природний рисунок волокон.',
    image: '/assets/products/esther-09.webp',
    images: ['/assets/products/esther-09.webp', '/assets/products/esther-12.webp', '/assets/products/esther-04.webp'],
    price: 1190,
    burn: '24–32 год',
    scent: 'димний / смолистий',
    tag: 'exclusive',
  },
  {
    id: 'clean-wood',
    name: 'Оброблена деревина без кори',
    category: 'Оброблені',
    material: 'шліфоване дерево · ручна обробка',
    note: 'чиста форма, жива текстура',
    description: 'Свічка в обробленій деревині без кори. Поверхня очищена та відшліфована, але природний контур дерева залишається видимим.',
    image: '/assets/products/esther-11.webp',
    images: ['/assets/products/esther-11.webp', '/assets/products/esther-06.webp', '/assets/products/esther-03.webp'],
    price: 890,
    burn: '18–25 год',
    scent: 'мʼякий деревний',
  },
  {
    id: 'finished-edge',
    name: 'Зріз з обробленим краєм',
    category: 'Зрізи',
    material: 'масив дерева · точна обробка краю',
    note: 'природна форма + графічний контур',
    description: 'Свічка у зрізі, де природну форму дерева підкреслює акуратно оброблений край. Мінімум втручання, максимум фактури.',
    image: '/assets/products/esther-06.webp',
    images: ['/assets/products/esther-06.webp', '/assets/products/esther-03.webp', '/assets/products/esther-05.webp'],
    price: 940,
    burn: '20–26 год',
    scent: 'нейтральний / деревний',
  },
  {
    id: 'oak-walnut',
    name: 'Горіх / дуб',
    category: 'Колекційні',
    material: 'горіх або дуб · природний край',
    note: 'масив із характерною структурою',
    description: 'Колекційний формат у фактурній деревині горіха або дуба. Кожна заготовка формується природою до того, як потрапляє в майстерню.',
    image: '/assets/products/esther-08.webp',
    images: ['/assets/products/esther-08.webp', '/assets/products/esther-13.webp', '/assets/products/esther-10.webp'],
    price: 1390,
    burn: '28–36 год',
    scent: 'горіх / сухе дерево',
    tag: 'unique grain',
  },
]

export const categories = ['Усі', 'Зрізи', 'Сети', 'Оброблені', 'Колекційні']
