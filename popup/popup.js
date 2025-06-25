document.addEventListener('DOMContentLoaded', () => {
  const filters = ['vegan', 'vegetarian', 'no_onion_garlic', 'jain'];

  chrome.storage.sync.get(['filters'], (data) => {
    const saved = data.filters || {};
    filters.forEach(f => {
      document.getElementById(`filter_${f}`).checked = saved[f] || false;
    });
  });

  document.getElementById('save').addEventListener('click', () => {
    const selected = {};
    filters.forEach(f => {
      selected[f] = document.getElementById(`filter_${f}`).checked;
    });

    chrome.storage.sync.set({ filters: selected }, () => {
      document.getElementById('status').textContent = '✔️ Filters saved!';
      setTimeout(() => document.getElementById('status').textContent = '', 1500);
    });
  });
});