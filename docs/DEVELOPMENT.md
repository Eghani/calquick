# Development guide

## Architecture

Calquick is a single-page static application:

- `index.html` provides the shell, calculator selector, history panel, and
  script/style references.
- `script.js` renders the selected calculator into `#calculator-stage`.
- `style.css` defines the visual system, responsive layout, form controls,
  calculator keypad, result cards, and history list.

The calculator selector maps values to renderer functions in the `calculators`
object near the end of `script.js`. Renderers replace the stage contents,
create the required form controls, and bind their own event handlers.

## Rendering pattern

Form-based calculators generally use these shared helpers:

- `shell(title, description, body)` creates the calculator card.
- `formField(id, label, type, placeholder)` creates a labeled input.
- `bindForm(id, handler)` prevents a page reload and runs the calculation.
- `result(title, value, detail)` creates the result card.
- `error(message)` creates an accessible alert.
- `renderSimpleForm(...)` handles the common form/result/history flow.

Use these helpers when adding a calculator instead of duplicating markup or
history logic.

## Adding a calculator

1. Add an option to the `#calculator-select` select in `index.html`.
2. Add a renderer function in `script.js`.
3. Register the renderer in the `calculators` object.
4. Use stable, namespaced element IDs so renderers do not conflict.
5. Validate missing, non-numeric, zero, negative, and otherwise invalid input
   explicitly.
6. Render user-facing errors through the existing `error()` helper.
7. Record successful calculations through `record()`.
8. Add the calculator's formula, input rules, and limitations to
   `docs/CALCULATORS.md`.
9. Update the feature list or project structure in `README.md` if the
   calculator changes the project overview.

## Input and output conventions

- Use `get(id)` for numeric inputs and `val(id)` for trimmed text values.
- Use `valid(...)` to verify numeric values are finite.
- Use `fmt(...)` for numeric display consistency.
- Reject invalid inputs with a clear message rather than returning a
  success-shaped fallback.
- Keep labels associated with inputs using matching `for` and `id` attributes.
- Preserve the existing responsive layout and visible focus styles.

## History behavior

History uses the `calquick-history` `localStorage` key. The stored value is a
JSON array, newest item first, trimmed to 12 entries. If history behavior is
changed, update the privacy and storage descriptions in both README and the
calculator reference.

## Manual verification

There is currently no automated test suite or package manager configuration.
Before opening a change, serve the repository with a static server and verify:

1. The page loads without console errors.
2. Every selector option renders the expected calculator.
3. Valid inputs produce the documented result.
4. Invalid inputs show an error and do not add a history entry.
5. Successful calculations appear in history.
6. History survives a page refresh and can be cleared.
7. Basic calculator keyboard shortcuts work.
8. The layout remains usable at a narrow mobile width.
9. Browser refreshes do not require a build step.

For JavaScript syntax validation without installing dependencies, run:

```bash
node --check script.js
```

## Deployment checklist

- Publish `index.html`, `script.js`, `style.css`, `README.md`, `docs/`, and
  `LICENSE` as desired.
- Ensure the host serves `index.html` at the site root.
- Ensure static assets retain the relative paths used by `index.html`.
- Test the deployed site over HTTPS.
- Confirm browser storage behavior on the final domain.

## Style guidance

Keep changes focused and dependency-free unless there is a clear requirement
to introduce tooling. Follow the existing two-space JavaScript/CSS indentation,
semantic HTML, small shared helpers, and concise user-facing copy. Avoid
embedding secrets or collecting personal data.

## License

Contributions remain subject to the MIT License in the repository's
`LICENSE` file.
