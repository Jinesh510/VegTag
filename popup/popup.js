document.addEventListener("DOMContentLoaded", () => {
  const dietCheckboxes = document.querySelectorAll('input[name="diet"]');
  const allergenCheckboxes = document.querySelectorAll('input[name="allergen"]');
  const addCustomAllergenBtn = document.getElementById("addCustomAllergenBtn");
  const customAllergenInput = document.getElementById("customAllergenInput");

  function savePreferences() {
    const selectedDiet = [...dietCheckboxes]
      .filter(cb => cb.checked)
      .map(cb => cb.value);

    const selectedAllergens = [...allergenCheckboxes]
      .filter(cb => cb.checked)
      .map(cb => cb.value);

    chrome.storage.local.set({
      userPreferences: {
        diet: selectedDiet,
        allergens: selectedAllergens,
      },
    });
  }

  function restorePreferences() {
    chrome.storage.local.get("userPreferences", (data) => {
      const { diet = [], allergens = [] } = data.userPreferences || {};

      dietCheckboxes.forEach(cb => {
        cb.checked = diet.includes(cb.value);
      });

      allergenCheckboxes.forEach(cb => {
        cb.checked = allergens.includes(cb.value);
      });
    });
  }

  dietCheckboxes.forEach(cb => cb.addEventListener("change", savePreferences));
  allergenCheckboxes.forEach(cb => cb.addEventListener("change", savePreferences));

  if (addCustomAllergenBtn) {
    addCustomAllergenBtn.addEventListener("click", () => {
      const value = customAllergenInput.value.trim();
      if (value) {
        const newCheckbox = document.createElement("input");
        newCheckbox.type = "checkbox";
        newCheckbox.name = "allergen";
        newCheckbox.value = value;
        newCheckbox.checked = true;
        newCheckbox.addEventListener("change", savePreferences);

        const label = document.createElement("label");
        label.appendChild(newCheckbox);
        label.appendChild(document.createTextNode(` ${value}`));
        document.querySelector(".popup").appendChild(label);

        customAllergenInput.value = "";
        savePreferences();
      }
    });
  }

  restorePreferences();
});
