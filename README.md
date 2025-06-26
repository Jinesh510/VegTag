# VegTag Extension

A Chrome extension that automatically detects and displays vegetarian, vegan, Jain, and allergen tags on grocery product pages across multiple popular US grocery websites.

## Features

- **Multi-Site Support**: Works on 14+ popular grocery websites
- **Diet Tags**: Shows vegetarian, vegan, Jain, and no-onion-garlic badges
- **Allergen Detection**: Highlights products containing user-specified allergens
- **Customizable Preferences**: Set your dietary preferences and allergens to avoid
- **Smart Detection**: Only shows badges on food product pages, not on non-food items

## Supported Websites

### US Grocery Sites
- **Walmart** (walmart.com)
- **Whole Foods Market** (wholefoodsmarket.com)
- **Kroger** (kroger.com)
- **Instacart** (instacart.com)
- **Target** (target.com)
- **Safeway** (safeway.com)
- **Albertsons** (albertsons.com)
- **Harris Teeter** (harristeeter.com)
- **Food Lion** (foodlion.com)
- **Publix** (publix.com)
- **Sprouts** (sprouts.com)
- **Trader Joe's** (traderjoes.com)

### International Sites
- **Amazon Singapore** (amazon.sg)
- **FairPrice Singapore** (fairprice.com.sg)

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The extension icon should appear in your toolbar

## Usage

1. **Set Preferences**: Click the extension icon to open the popup and select your dietary preferences and allergens to avoid
2. **Browse Products**: Visit any supported grocery website and navigate to a product page
3. **View Tags**: Diet and allergen badges will automatically appear below the product title

## How It Works

### Product Page Detection
Each website has specific URL patterns that indicate product pages:
- Amazon: URLs containing `/dp/`
- Walmart: URLs containing `/ip/`
- Kroger: URLs containing `/p/`
- And so on...

### Ingredient Scraping
The extension uses site-specific DOM selectors to find ingredient information:
- Looks for common selectors like `.product-ingredients`, `[data-testid='ingredients']`
- Falls back to searching for text containing "ingredient" keywords
- Only processes pages where ingredients are found (ensuring it's a food item)

### Tag Classification
Currently uses rule-based classification:
- **Vegetarian**: No meat, fish, or eggs
- **Vegan**: No animal products (milk, cheese, butter, etc.)
- **Jain**: No onion, garlic, meat, or eggs
- **No Onion-Garlic**: No onion or garlic ingredients

### Badge Injection
- Inserts badges below the product title using site-specific selectors
- Falls back to generic selectors if site-specific ones aren't found
- Ensures badges are visible and properly styled

## Configuration

### Adding New Sites
To add support for a new grocery website:

1. **Update `manifest.json`**: Add the domain to `host_permissions` and `content_scripts.matches`
2. **Add Site Config**: In `content.js`, add a new configuration object to the `configs` object in `getSiteConfig()`
3. **Define Selectors**: Specify the site's URL pattern, ingredient selectors, and title selectors

Example:
```javascript
'www.newsite.com': {
  name: 'New Site',
  isProductPage: () => /\/product\//.test(pathname),
  selectors: {
    ingredients: [
      ".product-ingredients",
      "[data-testid='ingredients']"
    ],
    title: ["h1.product-title", "h1"],
    badgeContainer: "h1.product-title"
  }
}
```

## Technical Details

### Files Structure
- `manifest.json`: Extension configuration and permissions
- `content.js`: Main logic for site detection, ingredient scraping, and badge injection
- `background.js`: Handles LLM API calls for ingredient classification
- `popup/`: User interface for setting preferences
- `styles.css`: Badge styling

### API Integration
The extension can integrate with OpenAI's API for more accurate ingredient classification:
1. Set your OpenAI API key in the extension storage
2. The background script will use GPT-3.5-turbo to classify ingredients
3. Falls back to rule-based classification if API is unavailable

## Future Enhancements

- [ ] Machine learning-based ingredient classification
- [ ] Support for more dietary restrictions
- [ ] Nutritional information display
- [ ] Price comparison across sites
- [ ] Shopping list integration
- [ ] Mobile app version

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on multiple sites
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter issues or have suggestions for new sites, please open an issue on GitHub.