import { $$ } from '../utils/dom';

/**
 * Base class for pages.
 *
 * A page runs the script for one view in app/views. It gets the view's root
 * element and a map of selectors to component classes, and creates one
 * component for every element that matches:
 *
 *   super({
 *     element,
 *     components: { '[data-accordion]': Accordion },
 *   });
 */
export default class Page {
  /**
   * @param {object} options
   * @param {HTMLElement} options.element The page's root element.
   * @param {Object<string, Function>} [options.components] Component classes
   *   by the selector of the elements they should be created for.
   */
  constructor({ element, components = {} }) {
    this.element = element;
    this.components = Object.entries(components).flatMap(
      ([selector, ComponentClass]) =>
        $$(selector, element).map((node) => new ComponentClass(node))
    );
  }

  destroy() {
    this.components.forEach((component) => component.destroy());
    this.components = [];
  }
}
