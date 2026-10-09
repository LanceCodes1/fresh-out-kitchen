const form = document.querySelector('#search-form');
const searchInput = document.querySelector('#meal-search');
const status = document.querySelector('#search-status');
const grid = document.querySelector('#recipe-grid');
const heading = document.querySelector('#results-heading');
const count = document.querySelector('#results-count');
const dialog = document.querySelector('#recipe-dialog');
const recipeContent = document.querySelector('#recipe-content');
let activeController;
let selectedCard;

// API values are treated as text, never as HTML.
function cleanText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function showStatus(message, state = '') {
  status.textContent = message;
  status.className = `status ${state}`;
  status.hidden = false;
}

function mealPhoto(meal, detail = false) {
  const container = element('span', `meal-photo${detail ? ' detail-photo' : ''}`);
  const fallback = () => {
    container.replaceChildren(element('span', '', 'Photo unavailable'));
    container.classList.add('image-placeholder');
  };
  // Only accept secure image URLs from TheMealDB's own domain.
  let imageUrl;
  try {
    imageUrl = new URL(cleanText(meal.strMealThumb));
    if (imageUrl.protocol !== 'https:' || imageUrl.hostname !== 'www.themealdb.com') {
      throw new Error('Unsupported image URL');
    }
  } catch {
    fallback();
    return container;
  }
  const image = element('img', 'meal-photo');
  image.alt = detail ? cleanText(meal.strMeal) || 'Recipe photograph' : '';
  image.loading = detail ? 'eager' : 'lazy';
  image.addEventListener('error', fallback, { once: true });
  image.src = imageUrl.href;
  container.append(image);
  return container;
}

function showRecipe(meal, card) {
  selectedCard = card;
  const title = element('h2', 'recipe-title', cleanText(meal.strMeal) || 'Untitled recipe');
  title.id = 'recipe-title';
  const columns = element('div', 'recipe-columns');
  const ingredientsSection = element('section');
  ingredientsSection.append(element('h3', '', 'Ingredients'));
  const ingredients = element('ul', 'ingredient-list');
  // Ingredient and measurement numbers belong together, even if some fields are blank.
  for (let i = 1; i <= 20; i++) {
    const ingredient = cleanText(meal[`strIngredient${i}`]);
    if (!ingredient) continue;
    const item = element('li');
    const measure = cleanText(meal[`strMeasure${i}`]);
    if (measure) item.append(element('span', 'ingredient-measure', `${measure} `));
    item.append(document.createTextNode(ingredient));
    ingredients.append(item);
  }
  ingredientsSection.append(ingredients.children.length ? ingredients : element('p', '', 'Ingredients are unavailable for this recipe.'));
  const instructionsSection = element('section');
  instructionsSection.append(element('h3', '', 'How to make it'));
  instructionsSection.append(element('p', 'instructions', cleanText(meal.strInstructions) || 'Cooking instructions are unavailable for this recipe.'));
  columns.append(ingredientsSection, instructionsSection);
  recipeContent.replaceChildren(mealPhoto(meal, true), title, columns);
  dialog.showModal();
  dialog.scrollTop = 0;
  document.body.classList.add('dialog-open');
}

function renderMeals(meals) {
  const fragment = document.createDocumentFragment();
  for (const meal of meals) {
    const name = cleanText(meal.strMeal) || 'Untitled recipe';
    const card = element('button', 'recipe-card');
    card.type = 'button';
    card.setAttribute('aria-label', `View recipe: ${name}`);
    card.setAttribute('aria-haspopup', 'dialog');
    const copy = element('span', 'card-copy');
    const text = element('span');
    text.append(element('span', 'card-title', name), element('span', 'card-label', 'View recipe'));
    const arrow = element('span', 'card-arrow', '↗');
    arrow.setAttribute('aria-hidden', 'true');
    copy.append(text, arrow);
    card.append(mealPhoto(meal), copy);
    card.addEventListener('click', () => showRecipe(meal, card));
    fragment.append(card);
  }
  grid.replaceChildren(fragment);
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const query = searchInput.value.trim();
  if (!query) {
    searchInput.setCustomValidity('Enter a meal name to find recipes.');
    searchInput.reportValidity();
    return;
  }
  searchInput.setCustomValidity('');
  // Cancel the previous request so an older search cannot overwrite the latest one.
  activeController?.abort();
  const controller = new AbortController();
  activeController = controller;
  grid.replaceChildren();
  grid.setAttribute('aria-busy', 'true');
  count.textContent = '';
  heading.textContent = 'Finding your next meal';
  showStatus(`Searching for “${query}”…`, 'loading');
  try {
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`, { signal: controller.signal });
    if (!response.ok) throw new Error('HTTP error');
    const data = await response.json();
    if (!data || typeof data !== 'object' || !Object.hasOwn(data, 'meals') || (data.meals !== null && !Array.isArray(data.meals))) {
      throw new Error('Unexpected API response');
    }
    if (controller !== activeController) return;
    const meals = (data.meals || []).filter(meal => {
      if (!meal || typeof meal !== 'object' || Array.isArray(meal)) return false;
      if (cleanText(meal.strMeal) || cleanText(meal.strInstructions)) return true;
      // A partial recipe can contain usable ingredients in any numbered slot.
      for (let i = 1; i <= 20; i++) {
        if (cleanText(meal[`strIngredient${i}`])) return true;
      }
      return false;
    });
    if (data.meals?.length && !meals.length) throw new Error('No usable recipe data');
    heading.textContent = `Recipes for “${query}”`;
    if (!meals.length) {
      showStatus(`No recipes found for “${query}”. Try a shorter meal name, like chicken or pasta.`);
      return;
    }
    renderMeals(meals);
    count.textContent = `${meals.length} ${meals.length === 1 ? 'recipe' : 'recipes'}`;
    // Keep the result announcement available to screen readers without a visible empty box.
    status.textContent = `Found ${count.textContent} for “${query}”. Select a recipe to see how to make it.`;
    status.className = 'visually-hidden';
  } catch (error) {
    if (controller !== activeController || error.name === 'AbortError') return;
    heading.textContent = 'Let’s try that again';
    showStatus('We couldn’t load recipes. Check your connection and try your search again.', 'error');
  } finally {
    if (controller === activeController) grid.setAttribute('aria-busy', 'false');
  }
});
searchInput.addEventListener('input', () => searchInput.setCustomValidity(''));
document.querySelector('#close-recipe').addEventListener('click', () => dialog.close());
// Native dialog handles Escape and keeps keyboard focus inside while it is open.
dialog.addEventListener('close', () => {
  document.body.classList.remove('dialog-open');
  if (selectedCard?.isConnected) selectedCard.focus();
});

// Keep the warm hero background visible if its decorative image fails to load.
const heroImage = document.querySelector('#hero-image');
if (heroImage) {
  const showHeroFallback = () => heroImage.remove();
  heroImage.addEventListener('error', showHeroFallback, { once: true });
  // A cached failure may finish before this deferred script runs.
  if (heroImage.complete && heroImage.naturalWidth === 0) showHeroFallback();
}

// Shortcuts submit the existing form so every search shares the same API and states.
document.querySelector('#meal-shortcuts').addEventListener('click', (event) => {
  const button = event.target.closest('button[data-meal]');
  if (!button) return;
  searchInput.value = button.dataset.meal;
  searchInput.setCustomValidity('');
  form.requestSubmit();
});
