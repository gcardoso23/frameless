/**
 * Small DOM helpers. The query functions search `scope`, which defaults to
 * the whole document.
 */

/** @returns {HTMLElement|null} The first element matching `selector`. */
export const $ = (selector, scope = document) => scope.querySelector(selector);

/** @returns {HTMLElement[]} Every element matching `selector`, as an array. */
export const $$ = (selector, scope = document) =>
  Array.from(scope.querySelectorAll(selector));

let lastId = 0;

/**
 * Returns an id that is unique on the page, for wiring up ARIA attributes.
 * @example uniqueId('accordion-panel'); // 'accordion-panel-1'
 */
export const uniqueId = (prefix = 'id') => {
  lastId += 1;
  return `${prefix}-${lastId}`;
};

/**
 * Whether changing a transitioned property on `element` will animate.
 *
 * It won't when every duration is 0, e.g. under `prefers-reduced-motion`,
 * where the duration tokens are zeroed. `transitionend` never fires in that
 * case, so code waiting for it has to finish its work straight away.
 */
export const hasTransition = (element) => {
  const { transitionDuration } = getComputedStyle(element);

  return (transitionDuration || '0s')
    .split(',')
    .some((duration) => parseFloat(duration) > 0);
};
