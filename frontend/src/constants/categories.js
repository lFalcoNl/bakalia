import { toUrlSafeSlug } from '../utils/slug'

const rawCategories = [
  // 🛒 Продукти
  { name: 'Фасовані крупи', image: '/images/categories/krupy.png' },
  { name: 'Макаронні вироби', image: '/images/categories/makarony.png' },
  { name: 'Ваговий товар', image: '/images/categories/vahoviy.png' },
  { name: 'Олія', image: '/images/categories/oil.png' },
  { name: 'Консерви', image: '/images/categories/canned.png' },
  { name: 'Молочні продукти', image: '/images/categories/dairy.png' },
  { name: 'Майонез, кетчуп, соуси', image: '/images/categories/sauces.png' },
  { name: 'Приправи і спеції', image: '/images/categories/spices.png' },
  { name: 'Чай, кава, напої', image: '/images/categories/drinks.png' },
  { name: 'Вода і соки', image: '/images/categories/water.png' },
  { name: 'Солодощі, печиво', image: '/images/categories/sweets.png' },

  // 👶 Дитяче
  { name: 'Дитячі товари', image: '/images/categories/children.png' },

  // 🧼 Побут і гігієна
  { name: 'Засоби гігієни', image: '/images/categories/hygiene.png' },
  { name: 'Папір, серветки', image: '/images/categories/paper.png' },
  { name: 'Губки, ганчірки', image: '/images/categories/sponges.png' },
  { name: 'Кухня, ванна', image: '/images/categories/kitchenbath.png' },
  { name: 'Побутова хімія', image: '/images/categories/chemicals.png' },

  // 🧰 Господарство
  { name: 'Господарські товари', image: '/images/categories/household.png' },
  { name: 'Корми, комбікорми', image: '/images/categories/feed.png' },
  { name: 'Мінеральні добрива', image: '/images/categories/fertilizers.png' },

  // 🖊️ Канцелярія
  { name: 'Канцтовари', image: '/images/categories/stationery.png' },

  // 🔋 Електро / інше
  { name: 'Батарейки', image: '/images/categories/batteries.png' },
  { name: 'Інші товари', image: '/images/categories/others.png' },
]


export const categories = rawCategories.map(cat => ({
  ...cat,
  slug: toUrlSafeSlug(cat.name),
}))
