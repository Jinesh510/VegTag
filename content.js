// content.js - Multi-site grocery extension

(async function () {
  const siteConfig = getSiteConfig();
  
  // Only run on product pages for the detected site
  if (!siteConfig.isProductPage()) {
    return;
  }

  const prefs = await getUserPreferences();
  const scrapedIngredients = scrapeIngredientsText(siteConfig);
  
  if (!scrapedIngredients) {
    // No ingredients found, likely not a food item
    return;
  }
  
  console.log("🧪 Scraped Ingredients:", scrapedIngredients);

  const tags = await getTagsFromIngredients(scrapedIngredients);
  const allergens = getMatchedAllergens(scrapedIngredients, prefs.allergens);

  const finalTags = [];

  if (tags.includes("non-veg")) {
    finalTags.push("non-veg");
  } else {
    for (const tag of tags) {
      if (prefs.diet.includes(tag)) {
        finalTags.push(tag);
      }
    }
  }

  console.log("📋 User Preferences:", prefs);
  console.log("🏷️  Raw Tags:", tags);
  console.log("⚠️  Allergens Found:", allergens);

  const filteredTags = getUserPreferenceBadges(tags, prefs.diet);

  injectVegTagBadge(filteredTags, allergens, prefs.allergens, siteConfig);

})();

function getSiteConfig() {
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;
  
  const configs = {
    'www.amazon.sg': {
      name: 'Amazon SG',
      isProductPage: () => /\/dp\//.test(pathname),
      selectors: {
        ingredients: [
          "#importantInformation_feature_div",
          "#productOverview_feature_div", 
          "#detailBullets_feature_div",
          ".a-expander-content"
        ],
        title: ["#title", "h1"],
        badgeContainer: "#title"
      },
      allowGenericFallback: false
    },
    'www.fairprice.com.sg': {
      name: 'FairPrice SG',
      isProductPage: () => /\/product\//.test(pathname),
      selectors: {
        ingredients: [
          ".product-details-ingredients",
          ".product-info-ingredients",
          "[data-testid='ingredients']"
        ],
        title: ["h1.product-title", "h1"],
        badgeContainer: "h1.product-title"
      },
      allowGenericFallback: false
    },
    'www.walmart.com': {
      name: 'Walmart',
      isProductPage: () => /\/ip\//.test(pathname),
      selectors: {
        ingredients: [
          ".about-desc",
          "[data-testid='ingredients']",
          ".product-description",
          ".product-details-content"
        ],
        title: ["h1.prod-ProductTitle", "h1"],
        badgeContainer: "h1.prod-ProductTitle"
      },
      allowGenericFallback: false
    },
    'www.wholefoodsmarket.com': {
      name: 'Whole Foods',
      isProductPage: () => /\/products\//.test(pathname),
      selectors: {
        ingredients: [
          ".product-ingredients",
          ".ingredients-list",
          "[data-testid='ingredients']"
        ],
        title: ["h1.product-title", "h1"],
        badgeContainer: "h1.product-title"
      },
      allowGenericFallback: false
    },
    'www.kroger.com': {
      name: 'Kroger',
      isProductPage: () => /\/p\//.test(pathname),
      selectors: {
        ingredients: [
          ".product-details-ingredients",
          ".ingredients-content",
          "[data-testid='ingredients']"
        ],
        title: ["h1.product-title", "h1"],
        badgeContainer: "h1.product-title"
      },
      allowGenericFallback: false
    },
    'www.instacart.com': {
      name: 'Instacart',
      isProductPage: () => /\/products\//.test(pathname),
      selectors: {
        ingredients: [
          'div[id*="Ingredients"] p',
          'div[id*="Ingredients"] div',
          '.product-ingredients',
          '.ingredients-section',
          '[data-testid="ingredients"]'
        ],
        title: ["h1.product-name", "h1"],
        badgeContainer: "h1.product-name"
      },
      allowGenericFallback: true
    },
    'www.target.com': {
      name: 'Target',
      isProductPage: () => /\/p\//.test(pathname),
      selectors: {
        ingredients: [
          ".product-details-ingredients",
          ".ingredients-info",
          "[data-testid='ingredients']"
        ],
        title: ["h1.product-title", "h1"],
        badgeContainer: "h1.product-title"
      },
      allowGenericFallback: false
    },
    'www.safeway.com': {
      name: 'Safeway',
      isProductPage: () => /\/shop\/product-details\//.test(pathname),
      selectors: {
        ingredients: [
          ".product-ingredients",
          ".ingredients-list",
          "[data-testid='ingredients']"
        ],
        title: ["h1.product-title", "h1"],
        badgeContainer: "h1.product-title"
      },
      allowGenericFallback: false
    },
    'www.albertsons.com': {
      name: 'Albertsons',
      isProductPage: () => /\/shop\/product-details\//.test(pathname),
      selectors: {
        ingredients: [
          ".product-ingredients",
          ".ingredients-content",
          "[data-testid='ingredients']"
        ],
        title: ["h1.product-title", "h1"],
        badgeContainer: "h1.product-title"
      },
      allowGenericFallback: false
    },
    'www.harristeeter.com': {
      name: 'Harris Teeter',
      isProductPage: () => /\/shop\/product-details\//.test(pathname),
      selectors: {
        ingredients: [
          ".product-ingredients",
          ".ingredients-section",
          "[data-testid='ingredients']"
        ],
        title: ["h1.product-title", "h1"],
        badgeContainer: "h1.product-title"
      },
      allowGenericFallback: false
    },
    'www.foodlion.com': {
      name: 'Food Lion',
      isProductPage: () => /\/shop\/product-details\//.test(pathname),
      selectors: {
        ingredients: [
          ".product-ingredients",
          ".ingredients-info",
          "[data-testid='ingredients']"
        ],
        title: ["h1.product-title", "h1"],
        badgeContainer: "h1.product-title"
      },
      allowGenericFallback: false
    },
    'www.publix.com': {
      name: 'Publix',
      isProductPage: () => /\/shop\/product-details\//.test(pathname),
      selectors: {
        ingredients: [
          ".product-ingredients",
          ".ingredients-list",
          "[data-testid='ingredients']"
        ],
        title: ["h1.product-title", "h1"],
        badgeContainer: "h1.product-title"
      },
      allowGenericFallback: false
    },
    'www.sprouts.com': {
      name: 'Sprouts',
      isProductPage: () => /\/shop\/product-details\//.test(pathname),
      selectors: {
        ingredients: [
          ".product-ingredients",
          ".ingredients-content",
          "[data-testid='ingredients']"
        ],
        title: ["h1.product-title", "h1"],
        badgeContainer: "h1.product-title"
      },
      allowGenericFallback: false
    },
    'www.traderjoes.com': {
      name: 'Trader Joe\'s',
      isProductPage: () => /\/products\//.test(pathname),
      selectors: {
        ingredients: [
          ".product-ingredients",
          ".ingredients-section",
          "[data-testid='ingredients']"
        ],
        title: ["h1.product-title", "h1"],
        badgeContainer: "h1.product-title"
      },
      allowGenericFallback: false
    }
  };

  // Find matching config
  for (const [domain, config] of Object.entries(configs)) {
    if (hostname.includes(domain)) {
      return config;
    }
  }

  // Default fallback config
  return {
    name: 'Unknown Site',
    isProductPage: () => true,
    selectors: {
      ingredients: [
        "[data-testid='ingredients']",
        ".ingredients",
        ".product-ingredients",
        ".ingredients-list"
      ],
      title: ["h1"],
      badgeContainer: "h1"
    },
    allowGenericFallback: true
  };
}

function getUserPreferences() {
  return new Promise((resolve) => {
    chrome.storage.local.get("userPreferences", (result) => {
      const { diet = [], allergens = [] } = result.userPreferences || {};
      resolve({ diet, allergens });
    });
  });
}

function scrapeIngredientsTextWalmart() {
  // Find all <h3> elements with 'ingredient' in the text
  const headers = Array.from(document.querySelectorAll("h3"));
  let allIngredients = [];
  for (const header of headers) {
    if (/ingredient/i.test(header.textContent.trim())) {
      // Get the next <p> sibling
      let next = header.nextElementSibling;
      while (next && next.tagName !== 'P') {
        next = next.nextElementSibling;
      }
      if (next && next.textContent && next.textContent.length > 20) {
        allIngredients.push(next.textContent.trim());
      }
    }
  }
  if (allIngredients.length > 0) {
    return allIngredients.join("\n");
  }
  // Fallback to previous selectors
  const selectors = [
    ".about-desc",
    "[data-testid='ingredients']",
    ".product-description",
    ".product-details-content"
  ];
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el && el.innerText && el.innerText.length > 20) {
      return el.innerText.trim();
    }
  }
  return "";
}

function scrapeIngredientsText(siteConfig) {
  if (window.location.hostname.includes('walmart.com')) {
    return scrapeIngredientsTextWalmart();
  }
  // Default: use site-specific selectors first, then generic fallback if allowed
  const { selectors, allowGenericFallback } = siteConfig;
  let ingredientsText = "";
  for (const selector of selectors.ingredients) {
    const elements = document.querySelectorAll(selector);
    for (const el of elements) {
      const text = el.innerText || el.textContent || "";
      if (text.length > 20 && /[a-z]/i.test(text)) {
        ingredientsText = text.trim();
        break;
      }
    }
    if (ingredientsText) break;
  }

  if (allowGenericFallback) {
    // 2. Fallback: look for any section/div containing a header with 'ingredient'
    if (!ingredientsText) {
      const headerTags = ['h2', 'h3', 'strong', 'span'];
      let allIngredients = [];
      for (const tag of headerTags) {
        const headers = Array.from(document.querySelectorAll(tag));
        for (const header of headers) {
          const headerText = header.textContent.trim().toLowerCase();
          if (headerText.includes('ingredient')) {
            // Search within the parent/container for text blocks
            const container = header.closest('section, div, article') || header.parentElement;
            if (container) {
              const candidates = Array.from(container.querySelectorAll('p, div, span, li'));
              for (const el of candidates) {
                const text = el.innerText || el.textContent || "";
                if (
                  text.length > 20 &&
                  /[a-z]/i.test(text) &&
                  text.toLowerCase().includes('ingredient')
                ) {
                  allIngredients.push(text.trim());
                }
              }
            }
          }
        }
      }
      ingredientsText = allIngredients.join('\n');
    }

    // 3. Fallback: search for any element with 'ingredient' in its text
    if (!ingredientsText) {
      const candidates = Array.from(document.querySelectorAll('p, div, span, li'));
      for (const el of candidates) {
        const text = el.innerText || el.textContent || "";
        if (
          text.length > 20 &&
          /[a-z]/i.test(text) &&
          text.toLowerCase().includes('ingredient')
        ) {
          ingredientsText = text.trim();
          break;
        }
      }
    }
  }

  if (ingredientsText && ingredientsText.length > 20 && /[a-z]/i.test(ingredientsText)) {
    return ingredientsText;
  }
  return "";
}

// Placeholder for actual LLM + rule-based matching
async function getTagsFromIngredients(text) {
  const lower = text.toLowerCase();
  const tags = [];

  // Plant-based butters that are vegan
  const plantButters = [
    'almond butter', 'peanut butter', 'cashew butter', 'cocoa butter', 'sunflower butter',
    'soy butter', 'plant butter', 'nut butter', 'seed butter'
  ];

  // Non-vegan keywords
  const nonVeganKeywords = [
    'milk', 'cheese', 'whey', 'casein', 'cream', 'curd', 'lactose', 'ghee', 'paneer',
    'egg', 'albumin', 'egg white', 'egg yolk', 'ovalbumin',
    'honey', 'beeswax', 'confectioner\'s glaze', 'shellac',
    'gelatin', 'isinglass', 'carmine', 'cochineal',
    'rennet', // (assume non-vegan unless specified as microbial/vegetarian)
    'fish', 'meat', 'lard', 'suet', 'broth', 'stock', 'anchovy', 'oyster', 'shrimp', 'crab', 'lobster',
    'vitamin d3'
  ];

  // Ambiguous: treat as non-vegan for strictness
  const ambiguous = ['mono- and diglycerides', 'lactic acid'];
  const ambiguousVeg = [];

  // Vegetarian edge cases
  const nonVegetarianKeywords = [
    'chicken', 'beef', 'pork', 'lamb', 'turkey', 'duck', 'goat', 'bacon', 'ham', 'sausage',
    'shellfish', 'crab', 'lobster', 'shrimp', 'anchovy',
    'gelatin', 'animal rennet', 'isinglass', 'lard', 'suet',
    'chicken broth', 'beef broth', 'fish broth', 'chicken stock', 'beef stock', 'fish stock',
    'fish sauce', 'oyster sauce',
    'meat', 'fish', 'egg', 'albumin', 'egg white', 'egg yolk', 'ovalbumin'
  ];

  // Jain edge cases
  const nonJainKeywords = [
    'potato', 'carrot', 'beet', 'radish', 'onion', 'garlic', 'shallot', 'leek', 'chive', 'scallion', 'turnip',
    'mushroom', 'yeast', 'vinegar', 'honey', 'asafoetida', 'hing'
  ];
  // Consider powders/extracts of allium family as non-Jain
  const alliumPowders = ['onion powder', 'garlic powder', 'leek powder', 'shallot powder', 'chive powder', 'scallion powder'];
  const ambiguousJain = ['natural flavors', 'enzymes'];

  // No-onion-garlic edge cases
  const nonOnionGarlicKeywords = [
    'onion', 'garlic', 'leek', 'shallot', 'chive', 'scallion',
    'onion powder', 'garlic powder', 'leek powder', 'shallot powder', 'chive powder', 'scallion powder',
    'onion extract', 'garlic extract', 'leek extract', 'shallot extract', 'chive extract', 'scallion extract'
  ];
  const ambiguousNoOnionGarlic = ['natural flavors'];

  // Vegan check
  let isVegan = true;
  if (
    (lower.includes('butter') && !plantButters.some(pb => lower.includes(pb)))
  ) {
    isVegan = false;
  }
  for (const kw of nonVeganKeywords) {
    if (lower.includes(kw)) {
      isVegan = false;
      break;
    }
  }
  for (const amb of ambiguous) {
    if (lower.includes(amb)) {
      isVegan = false;
      break;
    }
  }

  // Vegetarian check
  let isVegetarian = true;
  for (const kw of nonVegetarianKeywords) {
    if (lower.includes(kw)) {
      isVegetarian = false;
      break;
    }
  }
  for (const amb of ambiguousVeg) {
    if (lower.includes(amb)) {
      isVegetarian = false;
      break;
    }
  }
  if (
    lower.includes('cheese') &&
    lower.includes('rennet') &&
    !(
      lower.includes('microbial') ||
      lower.includes('vegetarian') ||
      lower.includes('non-animal')
    )
  ) {
    isVegetarian = false;
  }

  // Jain check
  let isJain = true;
  for (const kw of nonJainKeywords) {
    if (lower.includes(kw)) {
      isJain = false;
      break;
    }
  }
  for (const kw of alliumPowders) {
    if (lower.includes(kw)) {
      isJain = false;
      break;
    }
  }
  for (const amb of ambiguousJain) {
    if (lower.includes(amb)) {
      isJain = false;
      break;
    }
  }

  // No-onion-garlic check
  let isNoOnionGarlic = true;
  for (const kw of nonOnionGarlicKeywords) {
    if (lower.includes(kw)) {
      isNoOnionGarlic = false;
      break;
    }
  }
  for (const amb of ambiguousNoOnionGarlic) {
    if (lower.includes(amb)) {
      isNoOnionGarlic = false;
      break;
    }
  }

  // Existing logic for other tags
  if (!isVegetarian) {
    tags.push("non-veg");
  } else {
    tags.push("vegetarian");
  }

  if (isNoOnionGarlic) {
    tags.push("no-onion-garlic");
  }

  if (isVegan) {
    tags.push("vegan");
  }

  if (isJain) {
    tags.push("jain");
  }

  return tags;
}

function getMatchedAllergens(text, allergenList) {
  const lower = text.toLowerCase();
  return allergenList.filter((allergen) => lower.includes(allergen.toLowerCase()));
}

function injectVegTagBadge(tags, allergens, allUserAllergens, siteConfig) {
  // Remove any existing badge
  const oldBadge = document.querySelector("#vegtag-badge");
  if (oldBadge) oldBadge.remove();

  const badgeContainer = document.createElement("div");
  badgeContainer.id = "vegtag-badge";
  badgeContainer.style.cssText = `
    margin-top: 10px;
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    z-index: 9999;
    position: relative;
  `;

  tags.forEach(tag => {
    const badge = document.createElement("span");
    badge.innerText = formatTagLabel(tag);
    badge.style.cssText = getBadgeStyle(tag);
    badgeContainer.appendChild(badge);
  });

  allergens.forEach(allergen => {
    const badge = document.createElement("span");
    badge.innerText = `⚠️ Contains ${allergen}`;
    badge.style.cssText = getBadgeStyle("allergen");
    badgeContainer.appendChild(badge);
  });

  // Instacart modal-specific logic
  if (window.location.hostname.includes('instacart.com')) {
    // Try to find the modal dialog
    const modal = document.querySelector('div[role="dialog"]');
    if (modal) {
      // Try to find the product title inside the modal
      let targetElement = modal.querySelector("h1, h2, h3");
      if (targetElement && targetElement.parentNode) {
        targetElement.parentNode.insertBefore(badgeContainer, targetElement.nextSibling);
        return;
      } else {
        // Fallback: prepend to modal
        modal.prepend(badgeContainer);
        return;
      }
    }
  }

  // Try to find the best place to insert the badge (existing logic)
  let targetElement = null;
  for (const selector of siteConfig.selectors.title) {
    targetElement = document.querySelector(selector);
    if (targetElement) break;
  }
  if (!targetElement) {
    targetElement = document.querySelector("h1") || document.querySelector(".product-title");
  }

  if (!document.querySelector("#vegtag-badge")) {
    if (targetElement && targetElement.parentNode) {
      targetElement.parentNode.insertBefore(badgeContainer, targetElement.nextSibling);
    } else {
      document.body.prepend(badgeContainer);
    }
  }
}

function formatTagLabel(tag) {
  switch (tag) {
    case "vegetarian": return "🥦 Vegetarian";
    case "vegan": return "🌱 Vegan";
    case "jain": return "🧘‍♂️ Jain";
    case "no-onion-garlic": return "🧄❌🧅 No Onion-Garlic";
    case "non-veg": return "🍖 Non-Vegetarian";
    default: return tag;
  }
}

function getBadgeStyle(tag) {
  const baseStyle = `
    font-size: 13px;
    background: #f3f3f3;
    color: black;
    padding: 3px 8px;
    border-radius: 4px;
    border: 1px solid #ccc;
    font-weight: 500;
  `;
  if (tag === "non-veg") return baseStyle + "background: #ffe6e6; color: red; border-color: red;";
  if (tag === "allergen") return baseStyle + "background: #fff4e6; color: #b76e00; border-color: orange;";
  return baseStyle;
}

// Badge filtering logic: show only badges matching user preferences, but avoid redundancy for Jain/no-onion-garlic
function getUserPreferenceBadges(tags, userPrefs) {
  // If product is non-veg and user wants any vegetarian-related diet, show only non-veg
  if (tags.includes("non-veg") && userPrefs.some(pref => ["vegetarian", "jain", "vegan", "no-onion-garlic"].includes(pref))) {
    return ["non-veg"];
  }
  // Show only the badges that match both user preferences and product tags
  let filtered = userPrefs.filter(pref => tags.includes(pref));
  // If both jain and no-onion-garlic are present, only show jain
  if (filtered.includes("jain") && filtered.includes("no-onion-garlic")) {
    filtered = filtered.filter(tag => tag !== "no-onion-garlic");
  }
  return filtered;
}

// 2. Add MutationObserver for Instacart
if (window.location.hostname.includes('instacart.com')) {
  function autoExpandIngredients() {
    // Find the Ingredients accordion/button in the modal
    const buttons = Array.from(document.querySelectorAll('button, div[role="button"], h2, h3'));
    for (const btn of buttons) {
      if (/ingredients/i.test(btn.textContent) && btn.getAttribute('aria-expanded') === 'false') {
        btn.click();
        break;
      }
    }
  }

  let debounceTimeout;
  const runBadgeLogic = () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      autoExpandIngredients();
      setTimeout(async () => {
        const siteConfig = getSiteConfig();
        if (!siteConfig.isProductPage()) return;
        const prefs = await getUserPreferences();
        const scrapedIngredients = scrapeIngredientsText(siteConfig);
        if (!scrapedIngredients) return;
        const tags = await getTagsFromIngredients(scrapedIngredients);
        const allergens = getMatchedAllergens(scrapedIngredients, prefs.allergens);
        const filteredTags = getUserPreferenceBadges(tags, prefs.diet);
        injectVegTagBadge(filteredTags, allergens, prefs.allergens, siteConfig);
      }, 400); // Wait for content to load after expanding
    }, 300);
  };
  const observer = new MutationObserver(runBadgeLogic);
  observer.observe(document.body, { childList: true, subtree: true });
  // Also run once on initial load
  runBadgeLogic();
}
