chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'LLM_MATCH_REQUEST') {
    const ingredientsText = request.payload;

    chrome.storage.local.get('OPENAI_API_KEY', ({ OPENAI_API_KEY }) => {
      if (!OPENAI_API_KEY) {
        console.error("API key not found.");
        sendResponse({ tags: [] });
        return;
      }

      const prompt = `
You are a food ingredient classifier. Based on the ingredient list, classify the product:
- Is it Vegetarian? (Yes/No)
- Is it Vegan? (Yes/No)
- Does it contain Onion or Garlic? (Yes/No)
- Is it Jain Compliant? (Yes/No)

Vegan edge cases:
- Honey, gelatin, casein, whey, shellac, carmine, animal rennet, albumin, beeswax, isinglass, confectioner's glaze, and cochineal are not vegan.
- Cheese is only vegan if made with plant-based or microbial rennet.
- Plant-based butters such as almond butter, peanut butter, cashew butter, cocoa butter, sunflower butter, etc., are vegan. Only dairy butter is not vegan.
- If an ingredient is ambiguous (e.g., 'natural flavors', 'enzymes'), assume non-vegan for strictness.

Vegetarian edge cases:
- Gelatin, animal rennet, isinglass, lard, suet, broths/stocks (chicken, beef, fish), fish sauce, oyster sauce, and meat/fish/egg ingredients are not vegetarian.
- Cheese is only vegetarian if made with microbial or vegetarian rennet.
- If an ingredient is ambiguous (e.g., 'natural flavors', 'enzymes'), assume non-vegetarian for strictness.

Jain edge cases:
- Root vegetables (potato, carrot, beet, radish, onion, garlic, shallot, leek, chive, scallion, turnip, etc.), mushrooms, fermented foods (yeast, vinegar), honey, and asafoetida (hing) are not Jain.
- Leek, shallot, chive, scallion, and powders/extracts of these are considered similar to onion/garlic for Jain diets.
- If an ingredient is ambiguous, assume non-Jain for strictness.

No-onion-garlic edge cases:
- Onion, garlic, leek, shallot, chive, scallion, and powders/extracts of these are not allowed in no-onion-garlic diets.
- If an ingredient is ambiguous, assume not compliant for strictness.

Ingredients:
${ingredientsText}

Respond as JSON:
{
  "vegetarian": true/false,
  "vegan": true/false,
  "no_onion_garlic": true/false,
  "jain": true/false
}
`;

      fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2
        })
      })
        .then(res => res.json())
        .then(data => {
          const content = data.choices?.[0]?.message?.content;
          try {
            const parsed = JSON.parse(content);
            const tags = [];

            if (parsed.vegetarian) tags.push('vegetarian');
            if (parsed.vegan) tags.push('vegan');
            if (parsed.no_onion_garlic) tags.push('no-onion-garlic');
            if (parsed.jain) tags.push('jain');
            if (!parsed.vegetarian) tags.push('non-veg');

            sendResponse({ tags });
          } catch (err) {
            console.error('Error parsing LLM output', content);
            sendResponse({ tags: [] });
          }
        })
        .catch(err => {
          console.error('LLM API failed', err);
          sendResponse({ tags: [] });
        });
    });

    return true;
  }
});