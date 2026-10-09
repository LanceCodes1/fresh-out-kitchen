# Fresh Out Kitchen

A beginner-friendly recipe discovery application built with HTML5, CSS3, vanilla JavaScript, and TheMealDB. Search by meal name, browse photo cards, and open a recipe to read its ingredients, measurements, and cooking instructions.

## Setup

No installation, build step, API secret, or backend is required. Use a current Chrome, Firefox, Safari, or Edge browser with an internet connection.

Open `index.html` directly in your browser, or serve this folder locally:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000`. Stop the server with Ctrl+C.

## Usage

1. Enter a meal name such as chicken, pasta, or curry.
2. Select **Find recipes** or press Enter. Alternatively, select **Chicken**, **Pasta**, **Rice**, **Beef**, **Soup**, or **Egg** below the form to run the same meal-name search.
3. Select a recipe card to view its ingredients and instructions.
4. Select **Close** or press Escape to return to the results.

Use the header’s **Recipes** link to jump to the results section. Shortcuts search by meal name; they do not search by ingredient or apply filters.

Keyboard users can Tab through controls and activate cards and shortcut buttons with Enter or Space. The search container has a visible focus ring, and search updates use a live status region.

## Files

- `index.html`: semantic page, search form, results area, and recipe dialog.
- `style.css`: responsive layout, colors, typography, cards, and focus states.
- `script.js`: API requests, safe rendering, ingredient pairing, and dialog behavior.
- `prompt_log.txt`: original prompt, approved plan, actual decisions, and verification evidence.
- `.gitignore`: excludes environment files, dependency folders, and macOS metadata; allows a future `.env.example`. No environment file is needed for this application.

## API

The application makes a browser-side GET request to TheMealDB's public name search endpoint:

```text
https://www.themealdb.com/api/json/v1/1/search.php?s=ENCODED_MEAL_NAME
```

TheMealDB’s public development API uses the shared test key `1`, included in the URL. This MVP does not require a private API credential or environment variable; no `.env` file is needed. Search responses supply recipe details, so opening a card needs no second request. `strIngredient1` through `strIngredient20` are paired with their corresponding `strMeasure` fields; blank ingredients are skipped. API strings are rendered as text, and only HTTPS image URLs on `www.themealdb.com` are accepted.

Recipes and photographs come from [TheMealDB](https://www.themealdb.com/). The static decorative hero photograph was verified on the official [Chicken Mandi meal page](https://www.themealdb.com/meal/53358-chicken-mandi-recipe). It loads as an image resource, without an additional API request, and reveals a warm background if loading fails. HTTP errors, network failures, invalid JSON, malformed response structures, and absent recipe fields have user-facing fallbacks. New searches cancel earlier requests and ignore stale responses.

## Verification

Automated checks rerun during milestone preparation:

- `node --check script.js`: passed.
- Temporary Node VM harness with a simulated DOM and mocked fetch responses: passed blank-query validation, URL encoding, literal API text, ingredient pairing/blank skipping, full instructions, focus restoration handler, null results, HTTP/network/JSON/schema errors, missing fields, and stale-response protection.
- Additional simulated checks passed all 20 ingredient slots, an ingredient20-only recipe, all six shortcuts through the existing search handler, image fallback handlers, request cancellation, and stale-failure protection.
- CSS syntax parsing and limited HTML ID/label/anchor checks passed. Git ignore rules and an explicit whitespace scan also passed.

The simulated checks do not verify rendered layout, native form validation, native dialog focus containment, screen reader announcements, or real browser networking. The temporary test harness is outside the repository; it is not included in this baseline.

User-performed browser evidence (confirmed verbally by the user; no screenshots were supplied with this update):

| Scenario | Reported result |
| --- | --- |
| 375px viewport | Hero, search, recipe results, and recipe dialog visually inspected. |
| 320px viewport | Homepage visually inspected. Full recipe/results/dialog verification at this width is not established. |
| 768px viewport | Recipe grid visually inspected with a two-column layout. |
| Invalid meal search | Friendly no-results message displayed. |
| Chrome DevTools Offline | API requests failed and the app displayed a friendly connection-error message. |
| Network restored | Chicken search succeeded with HTTP 200 and recipe cards reappeared. |
| Earlier browser tests | Pasta shortcut, Recipes navigation, and recipe dialog passed. |
| Chicken Handi API comparison | User opened TheMealDB’s `search.php?s=Chicken` JSON response and compared Chicken Handi (`idMeal` 52795) with the deployed app. The recipe name, ingredients, measurements, and instructions matched. This was user-performed manual verification, not an automated test. |

While testing the functioning recipe-detail dialog, the user caught the photograph overlapping other content, directed Codex to correct the layout, and visually checked that the overlap was resolved. This demonstrates why inspecting the user experience matters beyond checking whether code runs. Earlier user reports also confirmed live recipe search/dialog testing, and V8 visual review was reported completed. These are user-performed results, not independent agent browser tests. No screenshot-based conclusion is added here. Browser versions, device details, and checks beyond the reported scenarios remain unspecified.

Remaining manual coverage to document:

- The other five meal-name shortcuts; Pasta is already confirmed.
- Empty/whitespace-only input and rapid consecutive searches in a real browser.
- Keyboard navigation, visible focus, Escape dismissal, focus return, and screen reader announcements.
- Full recipe/results/dialog behavior at 320px, desktop viewport details, and 200% browser zoom.
- Missing images, measurements, and instructions using controlled browser responses.

## Known limitations

- Internet access and TheMealDB availability/CORS support are required. No offline storage or caching is implemented.
- Recipe completeness and accuracy depend on TheMealDB. Missing measurements are left blank; ingredients and instructions show fallback messages when absent.
- Original instructions are displayed in full, preserving line breaks; they are not rewritten or expanded into beginner tutorials.
- Search is by meal name only. There are no filters, favorites, accounts, or saved recipes.
- Native HTML dialog support and modern JavaScript are required. Older browsers are not supported.
- Manual coverage is limited to the user-reported scenarios above. Keyboard/screen reader outcomes and full HTML/accessibility validation remain unverified; automated checks use simulated DOM/network responses.
