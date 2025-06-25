import { matchIngredients } from './match_ingredients.js';
import { injectVegTagBadge } from './ui_injector.js';

function scrapeIngredients() {
  const selectors = [
    'div#productOverview_feature_div',
    'div#detailBullets_feature_div',
    'div:contains("Ingredients")',
    'td:contains("Ingredients")',
    '[data-testid="product-ingredients"]',
    '.product-info'
  ];

  for (let selector of selectors) {
    const el = document.querySelector(selector);
    if (el && el.innerText.toLowerCase().includes('ingredient')) {
      return el.innerText;
    }
  }

  return '';
}

window.addEventListener('load', async () => {
  const ingredientsText = scrapeIngredients();
  if (ingredientsText) {
    const tags = await matchIngredients(ingredientsText);
    injectVegTagBadge(tags);
  }
});