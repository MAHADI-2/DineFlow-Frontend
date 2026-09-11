const CATEGORY_VALUES = ['APPETIZER', 'MAIN', 'SIDES', 'DESSERT', 'BEVERAGE'];

const legacyCategories = {
  APPETIZER: 'APPETIZER',
  SNACKS: 'APPETIZER',
  MAIN: 'MAIN',
  BURGER: 'MAIN',
  PIZZA: 'MAIN',
  RICE: 'MAIN',
  SIDES: 'SIDES',
  DESSERT: 'DESSERT',
  BEVERAGE: 'BEVERAGE',
  DRINKS: 'BEVERAGE',
};

export const CATEGORY_OPTIONS = [
  { value: 'appetizer', label: 'Appetizer (e.g. Soup, Rolls)' },
  { value: 'main', label: 'Main Course (e.g. Biryani, Burger, Platters)' },
  { value: 'sides', label: 'Sides (e.g. French Fries, Salad, Coleslaw)' },
  { value: 'dessert', label: 'Dessert (e.g. Ice Cream, Brownie)' },
  { value: 'beverage', label: 'Beverage (e.g. Coffee, Juice, Water)' },
];

const keywordCategory = (item) => {
  const text = `${item?.name || ''} ${item?.description || ''}`.toLowerCase();
  if (/water|cold drink|coffee|lemonade|juice/.test(text)) return 'BEVERAGE';
  if (/salad|coleslaw|fries/.test(text)) return 'SIDES';
  if (/burger|biryani/.test(text)) return 'MAIN';
  return null;
};

export const getMenuCategory = (item) => {
  const keywordMatch = keywordCategory(item);
  if (keywordMatch) return keywordMatch;

  const rawCategory = String(item?.category || '').trim().toUpperCase();
  return legacyCategories[rawCategory] || (CATEGORY_VALUES.includes(rawCategory) ? rawCategory : 'APPETIZER');
};

export const getStoredCategory = (category) => {
  const normalized = String(category || '').trim().toUpperCase();
  const canonical = legacyCategories[normalized] || (CATEGORY_VALUES.includes(normalized) ? normalized : 'APPETIZER');
  return canonical.toLowerCase();
};