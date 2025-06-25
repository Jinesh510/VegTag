// import { matchIngredients } from './match_ingredients.js';
// import { injectVegTagBadge } from './ui_injector.js';

// function scrapeIngredients() {
//   const selectors = [
//     'div#productOverview_feature_div',
//     'div#detailBullets_feature_div',
//     'div:contains("Ingredients")',
//     'td:contains("Ingredients")',
//     '[data-testid="product-ingredients"]',
//     '.product-info'
//   ];

//   for (let selector of selectors) {
//     const el = document.querySelector(selector);
//     if (el && el.innerText.toLowerCase().includes('ingredient')) {
//       return el.innerText;
//     }
//   }

//   return '';
// }

// --- Match Ingredients Logic ---
function ruleBasedMatch(ingredients) {
  const tags = new Set();
  const lowerText = ingredients.toLowerCase();
  let matched = false;

  const rules = {
    non_veg: ["chicken", "beef", "pork", "fish", "egg", "gelatin", "lard", "shellfish", "anchovy", "rennet", "meat"],
    non_vegan: ["milk", "butter", "cheese", "cream", "honey", "ghee", "casein", "whey", "yogurt", "egg", "gelatin"],
    onion_garlic: ["onion", "garlic"],
    jain_restricted: ["onion", "garlic", "potato", "carrot", "radish", "beetroot", "turnip"]
  };

  for (let item of rules.non_veg) {
    if (lowerText.includes(item)) {
      tags.add('non-veg');
      matched = true;
    }
  }

  let hasNonVegan = false;
  for (let item of rules.non_vegan) {
    if (lowerText.includes(item)) {
      hasNonVegan = true;
    }
  }

  if (!tags.has('non-veg')) {
    tags.add('vegetarian');
    if (!hasNonVegan) {
      tags.add('vegan');
    }
  }

  let hasOnionGarlic = false;
  for (let item of rules.onion_garlic) {
    if (lowerText.includes(item)) {
      hasOnionGarlic = true;
    }
  }
  if (!hasOnionGarlic) {
    tags.add('no-onion-garlic');
  }

  let hasJainRestricted = false;
  for (let item of rules.jain_restricted) {
    if (lowerText.includes(item)) {
      hasJainRestricted = true;
    }
  }
  if (!hasJainRestricted && !hasOnionGarlic) {
    tags.add('jain');
  }

  return { tags: Array.from(tags), matched };
}

function matchIngredients(ingredientsText) {
  const { tags, matched } = ruleBasedMatch(ingredientsText);
  return Promise.resolve(tags); // no LLM call here to keep it simple for now
}

// --- Badge Injection ---
function injectVegTagBadge(tags) {
  const badgeText = tags.map(tag => {
    switch (tag) {
      case 'vegan': return '🟣 Vegan';
      case 'vegetarian': return '🟢 Vegetarian';
      case 'no-onion-garlic': return '🟠 No Onion-Garlic';
      case 'jain': return '🔵 Jain';
      case 'non-veg': return '🔴 Non-Vegetarian';
      default: return '';
    }
  }).join(' ');

  if (!badgeText) return;

  const titleEl = document.querySelector('#productTitle') || document.querySelector('h1');
  if (titleEl && !document.querySelector('.vegtag-badge')) {
    const badge = document.createElement('div');
    badge.className = 'vegtag-badge';
    badge.innerText = badgeText;
    badge.style.fontSize = '14px';
    badge.style.marginTop = '8px';
    badge.style.padding = '4px 8px';
    badge.style.borderRadius = '6px';
    badge.style.backgroundColor = '#eef6ef';
    badge.style.display = 'inline-block';
    badge.style.fontWeight = 'bold';
    badge.style.color = '#2e7d32';
    badge.style.border = '1px solid #c8e6c9';

    titleEl.parentNode.insertBefore(badge, titleEl.nextSibling);
  }
}


function scrapeIngredients() {
  // Find the <h4> with "Ingredients"
  const ingredientHeader = Array.from(document.querySelectorAll('h4'))
    .find(el => el.innerText.trim().toLowerCase().includes('ingredients'));

  if (ingredientHeader) {
    let current = ingredientHeader.nextElementSibling;
    while (current) {
      if (current.tagName === 'P' && current.innerText.trim()) {
        return current.innerText.trim();
      }
      current = current.nextElementSibling;
    }
  }

  // Fallback: scan entire body for "ingredients:"
  const bodyText = document.body.innerText.toLowerCase();
  const match = bodyText.match(/ingredients?:?.{0,300}/i);
  if (match) return match[0];

  return '';
}



window.addEventListener('load', async () => {
  const ingredientsText = scrapeIngredients();
  console.log("🧪 Scraped Ingredients:", ingredientsText);

  if (ingredientsText) {
    const tags = await matchIngredients(ingredientsText);
    injectVegTagBadge(tags);
  }
});