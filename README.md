# Calquick

Calquick is a lightweight collection of everyday calculators that runs entirely
in the browser. It has no server, build step, package dependencies, account
system, or external API calls.

The application provides a focused interface for arithmetic, finance,
dates, time, units, health estimates, and basic geometry. Calculation history
is stored locally in the browser and is never sent to a server by the
application.

## Features

- Basic arithmetic calculator with keyboard support.
- Scientific calculator with degree/radian trigonometry, logarithms,
  square roots, powers, constants, and factorials.
- Percentage, fraction, ratio, and average calculators.
- Age, date, and time calculators.
- Length and weight unit conversion.
- BMI, simple interest, compound interest, and EMI/loan estimates.
- Rectangle and circle area calculations.
- Up to 12 recent calculations saved in `localStorage`.
- Responsive layout and visible keyboard-focus states.
- No runtime dependencies or build tooling.

See [docs/CALCULATORS.md](docs/CALCULATORS.md) for the complete calculator
reference, supported inputs, formulas, and limitations.

## Run locally

Because this is a static site, it can be opened directly:

1. Clone or download the repository.
2. Open `index.html` in a modern browser.
3. Choose a calculator from the selector.

For a local HTTP server, use any static file server. For example, with Python:

```bash
python -m http.server 8000
```

Then open <http://localhost:8000>.

No `npm install`, compilation, environment variables, or backend service is
required.

## Project structure

```text
.
├── index.html              # Page structure and calculator selector
├── script.js               # Calculator rendering, formulas, and history
├── style.css               # Layout, responsive styles, and components
├── docs/
│   ├── CALCULATORS.md      # User-facing calculator reference
│   └── DEVELOPMENT.md      # Architecture and contribution workflow
├── LICENSE                 # MIT License
└── README.md               # Project overview and quick start
```

## Browser support

Calquick targets current versions of modern browsers with support for:

- ES6 JavaScript features, including `const`, arrow functions, template
  literals, destructuring, and `String.prototype.replaceAll`.
- `localStorage`.
- Standard HTML form controls and CSS Grid.

The app is designed for desktop and mobile viewport sizes. A browser with
JavaScript disabled cannot run the calculators.

## Privacy and data storage

Calquick stores calculation history under the browser `localStorage` key
`calquick-history`. Each item contains the calculator name, the entered
expression, the displayed result, and a localized timestamp. The list is
limited to the 12 most recent entries.

Clearing history removes that key from the current browser origin. Clearing
site data, using a different browser or origin, or using private browsing may
also remove the history. Inputs are not synchronized between devices.

## Accuracy and scope

Results are intended for everyday estimates and education. Values use
JavaScript `Number` arithmetic and may therefore have normal floating-point
rounding behavior. BMI is an estimate, and financial calculators do not
include taxes, fees, insurance, payment schedules, or lender-specific rules.
Do not use the health or financial outputs as a substitute for professional
advice.

The exact supported operations and assumptions are documented in
[docs/CALCULATORS.md](docs/CALCULATORS.md).

## Deployment

Deploy the repository contents to any static hosting provider, such as GitHub
Pages, Netlify, Vercel static hosting, or an object-storage website. The
hosting root must serve `index.html`, and `script.js` and `style.css` must
remain alongside it unless the paths in `index.html` are changed.

There is no server-side configuration or database migration.

## Development

Read [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for the rendering model,
validation expectations, manual verification checklist, and guidance for
adding calculators.

## License

Calquick is distributed under the [MIT License](LICENSE).
