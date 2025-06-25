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