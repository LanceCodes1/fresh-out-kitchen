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

User-reported browser evidence: live recipe search and recipe dialog testing passed, and the photograph-overlap correction was visually verified. The user also reported that V8 visual review was completed. Browser names, viewport sizes, and a detailed V8 interaction checklist have not been supplied. No independent agent browser test or live API request was performed during milestone preparation. Earlier image provenance verification is recorded in `prompt_log.txt`.

Suggested manual review before committing:

- Search chicken, select a card, and compare ingredients and instructions with its API response.
- Search an unlikely name and confirm the no-results message; submit an empty or whitespace-only search.
- Use browser developer tools to go offline, then search and confirm the retry guidance.
- Search twice quickly and confirm the latest search wins.
- Activate all six shortcuts and confirm the input and results match the selected meal name; confirm **Recipes** jumps to the results section.
- Navigate with Tab, Enter, Space, and Escape; confirm visible focus and focus return after closing a recipe.
- Review at 375px and 1280px widths and at 200% browser zoom; confirm readable text, usable controls, and no horizontal scrolling.
- Check missing photographs, measurements, and instructions using mocked responses in a browser.

## Known limitations

- Internet access and TheMealDB availability/CORS support are required. No offline storage or caching is implemented.
- Recipe completeness and accuracy depend on TheMealDB. Missing measurements are left blank; ingredients and instructions show fallback messages when absent.
- Original instructions are displayed in full, preserving line breaks; they are not rewritten or expanded into beginner tutorials.
- Search is by meal name only. There are no filters, favorites, accounts, or saved recipes.
- Native HTML dialog support and modern JavaScript are required. Older browsers are not supported.
- Detailed browser/viewport and interaction evidence remains to be recorded. Screen reader testing and full HTML/accessibility validation have not been performed; automated checks use simulated DOM/network responses.
