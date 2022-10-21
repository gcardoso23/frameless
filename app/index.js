import './styles/index.scss';
import { $ } from './utils/dom';

// Each view names its page with <body data-page="…">. Pages are loaded with
// dynamic imports, so every page's code ships as its own chunk.
const pages = {
  home: () => import(/* webpackChunkName: "home" */ './pages/Home'),
};

const root = $('[data-page]');
const loadPage = root && pages[root.dataset.page];

if (loadPage) {
  loadPage().then(({ default: Page }) => new Page(root));
}
