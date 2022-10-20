import { $, $$ } from '../utils/dom';

/**
 * Base class for UI components.
 *
 * A component is bound to one root element and looks up its children from a
 * map of selectors, scoped to that root:
 *
 *   super({
 *     element,
 *     elements: { buttons: '[data-accordion-button]' },
 *   });
 *
 *   this.elements.buttons; // HTMLElement[]
 *
 * Subclasses attach listeners in `addEventListeners()` and detach the same
 * ones in `removeEventListeners()`, so `destroy()` leaves nothing behind.
 */
export default class Component {
  /**
   * @param {object} options
   * @param {HTMLElement|string} options.element Root element, or a selector.
   * @param {Object<string, string>} [options.elements] Child selectors by name.
   */
  constructor({ element, elements = {} }) {
    this.element = typeof element === 'string' ? $(element) : element;

    if (!this.element) {
      throw new Error(`Component root not found: ${element}`);
    }

    this.elements = Object.fromEntries(
      Object.entries(elements).map(([name, selector]) => [
        name,
        $$(selector, this.element),
      ])
    );
  }

  addEventListeners() {}

  removeEventListeners() {}

  /**
   * Dispatches a bubbling CustomEvent from the root element, so other code
   * can react to this component without holding a reference to it.
   */
  emit(type, detail) {
    this.element.dispatchEvent(
      new CustomEvent(type, { bubbles: true, detail })
    );
  }

  destroy() {
    this.removeEventListeners();
  }
}
