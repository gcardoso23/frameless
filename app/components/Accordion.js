import Component from '../classes/Component';
import { hasTransition, uniqueId } from '../utils/dom';

/**
 * Accordion following the WAI-ARIA Authoring Practices pattern:
 * https://www.w3.org/WAI/ARIA/apg/patterns/accordion/
 *
 *   <div class="accordion" data-accordion>
 *     <div class="accordion__item">
 *       <h3 class="accordion__heading">
 *         <button class="accordion__button" type="button" data-accordion-button>
 *           Title
 *         </button>
 *       </h3>
 *       <div class="accordion__panel" data-accordion-panel>
 *         <div class="accordion__content">…</div>
 *       </div>
 *     </div>
 *   </div>
 *
 * - One panel is open at a time; `data-accordion="multiple"` allows more.
 * - `aria-expanded="true"` on a button starts its panel open.
 * - Arrow Up/Down move between headers; Home/End jump to the first/last.
 * - Emits `accordion:expand` and `accordion:collapse` with `{ index }`.
 *
 * The animation itself lives in _accordion.scss. This class only sets the
 * height each panel transitions to.
 */
export default class Accordion extends Component {
  constructor(element) {
    super({
      element,
      elements: {
        buttons: '[data-accordion-button]',
        panels: '[data-accordion-panel]',
      },
    });

    this.allowMultiple = this.element.dataset.accordion === 'multiple';

    this.onClick = this.onClick.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onTransitionEnd = this.onTransitionEnd.bind(this);

    this.setup();
    this.addEventListeners();
  }

  setup() {
    const { buttons, panels } = this.elements;

    buttons.forEach((button, index) => {
      const panel = panels[index];
      const expanded = button.getAttribute('aria-expanded') === 'true';

      button.id = button.id || uniqueId('accordion-button');
      panel.id = panel.id || uniqueId('accordion-panel');

      button.setAttribute('aria-expanded', String(expanded));
      button.setAttribute('aria-controls', panel.id);
      panel.setAttribute('role', 'region');
      panel.setAttribute('aria-labelledby', button.id);

      panel.classList.toggle('is-expanded', expanded);
      panel.style.height = expanded ? 'auto' : '0px';
    });

    // Apply the initial state before enabling transitions (see
    // _accordion.scss), so panels that start open don't animate in.
    this.element.getBoundingClientRect();
    this.element.classList.add('is-ready');
  }

  isExpanded(index) {
    return (
      this.elements.buttons[index].getAttribute('aria-expanded') === 'true'
    );
  }

  toggle(index) {
    if (this.isExpanded(index)) {
      this.collapse(index);
    } else {
      this.expand(index);
    }
  }

  expand(index) {
    if (this.isExpanded(index)) return;

    if (!this.allowMultiple) {
      this.elements.buttons.forEach((_, other) => this.collapse(other));
    }

    const panel = this.elements.panels[index];

    this.elements.buttons[index].setAttribute('aria-expanded', 'true');
    panel.classList.add('is-expanded');

    // Animate to the content's height, then hand over to `auto` (see
    // onTransitionEnd) so the panel can still grow or shrink with its content.
    panel.style.height = `${panel.scrollHeight}px`;

    if (!hasTransition(panel)) panel.style.height = 'auto';

    this.emit('accordion:expand', { index });
  }

  collapse(index) {
    if (!this.isExpanded(index)) return;

    const panel = this.elements.panels[index];

    this.elements.buttons[index].setAttribute('aria-expanded', 'false');
    panel.classList.remove('is-expanded');

    // `auto` can't be transitioned, so pin the current height in pixels and
    // force a reflow before animating down to 0.
    if (panel.style.height === 'auto') {
      panel.style.height = `${panel.scrollHeight}px`;
      panel.getBoundingClientRect();
    }

    panel.style.height = '0px';

    this.emit('accordion:collapse', { index });
  }

  onClick(event) {
    const button = event.target.closest('[data-accordion-button]');
    const index = this.elements.buttons.indexOf(button);

    if (index !== -1) this.toggle(index);
  }

  onKeyDown(event) {
    const { buttons } = this.elements;
    const index = buttons.indexOf(event.target);

    if (index === -1) return;

    const count = buttons.length;
    const target = {
      ArrowDown: (index + 1) % count,
      ArrowUp: (index - 1 + count) % count,
      Home: 0,
      End: count - 1,
    }[event.key];

    if (target === undefined) return;

    event.preventDefault();
    buttons[target].focus();
  }

  onTransitionEnd(event) {
    const index = this.elements.panels.indexOf(event.target);

    // Skip transitions bubbling up from inside the panel.
    if (index === -1 || event.propertyName !== 'height') return;

    if (this.isExpanded(index)) event.target.style.height = 'auto';
  }

  addEventListeners() {
    this.element.addEventListener('click', this.onClick);
    this.element.addEventListener('keydown', this.onKeyDown);
    this.element.addEventListener('transitionend', this.onTransitionEnd);
  }

  removeEventListeners() {
    this.element.removeEventListener('click', this.onClick);
    this.element.removeEventListener('keydown', this.onKeyDown);
    this.element.removeEventListener('transitionend', this.onTransitionEnd);
  }
}
