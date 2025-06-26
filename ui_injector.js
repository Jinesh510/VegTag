// export function injectVegTagBadge(tags) {
//   const badgeText = tags.map(tag => {
//     switch (tag) {
//       case 'vegan': return '🟣 Vegan';
//       case 'vegetarian': return '🟢 Vegetarian';
//       case 'no-onion-garlic': return '🟠 No Onion-Garlic';
//       case 'jain': return '🔵 Jain';
//       case 'non-veg': return '🔴 Non-Vegetarian';
//       default: return '';
//     }
//   }).join(' ');

//   if (!badgeText) return;

//   const titleEl = document.querySelector('#productTitle') || document.querySelector('h1');
//   if (titleEl && !document.querySelector('.vegtag-badge')) {
//     const badge = document.createElement('div');
//     badge.className = 'vegtag-badge';
//     badge.innerText = badgeText;
//     badge.style.fontSize = '14px';
//     badge.style.marginTop = '8px';
//     badge.style.padding = '4px 8px';
//     badge.style.borderRadius = '6px';
//     badge.style.backgroundColor = '#eef6ef';
//     badge.style.display = 'inline-block';
//     badge.style.fontWeight = 'bold';
//     badge.style.color = '#2e7d32';
//     badge.style.border = '1px solid #c8e6c9';

//     titleEl.parentNode.insertBefore(badge, titleEl.nextSibling);
//   }
// }