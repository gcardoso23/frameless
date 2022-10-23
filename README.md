# Frameless

Webpack, Sass and vanilla JavaScript, with a small component pattern and nothing else to learn.

Frameless is a starter for sites that don't need a framework but still deserve structure: multiple pages, reusable components, design tokens, accessible defaults and a test setup, all in plain JavaScript and SCSS.

## Features

- **Multi-page by default.** Every HTML file in `app/views` becomes a page, and each page's script is a separate chunk.
- **Component and Page base classes.** About 100 lines in total, with no runtime dependencies.
- **Accessible accordion example.** Follows the WAI-ARIA pattern, supports the keyboard, animates with easing and still works without JavaScript.
- **Design tokens as CSS custom properties.** Colors with dark mode, plus spacing, type, easing curves and durations. Reduced motion turns every animation off at once.
- **Modern Sass.** `@use` modules, a mobile-first `media()` mixin and a `rem()` function.
- **One browserslist** shared by Babel and Autoprefixer.
- **Fast feedback.** Hot reloading in development, content-hashed files in production.
- **Quality checks.** ESLint, Stylelint (with BEM class names), Prettier, Jest with jsdom, and GitHub Actions CI.

## Getting started

```bash
npx degit gcardoso23/frameless my-site
cd my-site
yarn
yarn dev
```

The dev server runs at <http://localhost:8080>.

## Scripts

| Command             | What it does                                       |
| ------------------- | -------------------------------------------------- |
| `yarn dev`          | Start the dev server with hot reloading            |
| `yarn build`        | Build for production into `dist/`                  |
| `yarn test`         | Run the unit tests (add `--coverage` for a report) |
| `yarn lint`         | Run ESLint and Stylelint                           |
| `yarn format`       | Format every file with Prettier                    |
| `yarn format:check` | Check formatting without writing (used in CI)      |

## Project structure

```text
app/
├── index.js          # Entry: loads the page named by <body data-page>
├── classes/          # Component and Page base classes
├── components/       # UI components, e.g. Accordion
├── pages/            # One class per page, e.g. Home
├── utils/            # DOM helpers
├── static/           # Copied as-is to dist/static
├── styles/
│   ├── abstracts/    # Sass-only helpers: breakpoints, functions
│   ├── base/         # Reset, design tokens, global element styles
│   ├── components/   # One partial per component
│   └── pages/        # One partial per page
└── views/            # HTML pages; each one is built to dist/
```

## How it works

### Pages

Each `.html` file in `app/views` is built to `dist/` under the same name. To give a page its own script, name it on the `<body>`:

```html
<body data-page="about"></body>
```

Then register a loader for that name in `app/index.js`:

```js
const pages = {
  home: () => import(/* webpackChunkName: "home" */ './pages/Home'),
  about: () => import(/* webpackChunkName: "about" */ './pages/About'),
};
```

A page class lists its components by selector. The base class creates one instance for every matching element:

```js
import Page from '../classes/Page';
import Counter from '../components/Counter';

export default class About extends Page {
  constructor(element) {
    super({
      element,
      components: { '[data-counter]': Counter },
    });
  }
}
```

### Components

A component gets its root element, names the child elements it needs and manages its own listeners:

```js
import Component from '../classes/Component';

export default class Counter extends Component {
  constructor(element) {
    super({
      element,
      elements: {
        button: '[data-counter-button]',
        output: '[data-counter-output]',
      },
    });

    this.count = 0;
    this.onClick = this.onClick.bind(this);
    this.addEventListeners();
  }

  onClick() {
    this.count += 1;
    this.elements.output[0].textContent = this.count;
    this.emit('counter:change', { count: this.count });
  }

  addEventListeners() {
    this.elements.button[0].addEventListener('click', this.onClick);
  }

  removeEventListeners() {
    this.elements.button[0].removeEventListener('click', this.onClick);
  }
}
```

- `this.elements` always holds arrays, looked up inside the root only.
- `emit()` dispatches a bubbling `CustomEvent`, so other code can react without a reference to the component.
- `destroy()` calls `removeEventListeners()`.

See [`Accordion.js`](app/components/Accordion.js) for a complete example.

### Styles and motion

Design tokens live in [`base/_root.scss`](app/styles/base/_root.scss) as CSS custom properties. Every transition uses a duration token and an easing curve:

```scss
.card {
  transition: transform var(--duration-base) var(--ease-out-quart);
}
```

- Dark mode only overrides the color tokens.
- When the system asks for reduced motion, the duration tokens drop to `0ms`, which turns off every transition.
- Sass covers what custom properties can't do, namely breakpoints and helper functions. Partials load them with `@use '../abstracts' as *;`:

```scss
.card {
  padding: var(--space-4);
  border-radius: rem(12px);

  @include media(md) {
    padding: var(--space-8);
  }
}
```

Class names follow BEM (`block__element--modifier`), and Stylelint enforces it.

### Static assets

Files in `app/static` are copied to `dist/static` unchanged. Reference them by their final path, in HTML (`static/images/hero.jpg`) and in SCSS (`url('static/images/hero.jpg')`). css-loader leaves `url()` alone.

### Without JavaScript

An inline script in each view adds a `js` class to `<html>` before the CSS loads. Components only hide content under `.js`, so if the bundle fails to load, the page stays readable.

## Browser support

The build targets the browserslist `defaults` query. Babel only transpiles syntax, so add `core-js` if you need polyfills.
