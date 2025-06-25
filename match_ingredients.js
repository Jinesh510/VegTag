import rules from './ruleset.json';

function ruleBasedMatch(ingredients) {
  const tags = new Set();
  const lowerText = ingredients.toLowerCase();
  let matched = false;

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

export async function matchIngredients(ingredientsText) {
  const { tags, matched } = ruleBasedMatch(ingredientsText);

  if (matched || tags.includes('non-veg')) {
    return tags;
  }

  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      {
        type: 'LLM_MATCH_REQUEST',
        payload: ingredientsText
      },
      response => {
        resolve(response?.tags || tags);
      }
    );
  });
}