import Accordion from './Accordion';

const titles = ['One', 'Two', 'Three'];

function render({ multiple = false, expanded = [] } = {}) {
  document.body.innerHTML = `
    <div data-accordion${multiple ? '="multiple"' : ''}>
      ${titles
        .map(
          (title, index) => `
            <h3>
              <button type="button" data-accordion-button
                ${expanded.includes(index) ? 'aria-expanded="true"' : ''}>
                ${title}
              </button>
            </h3>
            <div data-accordion-panel><p>${title} content</p></div>
          `
        )
        .join('')}
    </div>
  `;

  const element = document.querySelector('[data-accordion]');

  return {
    element,
    accordion: new Accordion(element),
    buttons: Array.from(document.querySelectorAll('[data-accordion-button]')),
    panels: Array.from(document.querySelectorAll('[data-accordion-panel]')),
  };
}

const isOpen = (button) => button.getAttribute('aria-expanded') === 'true';

describe('Accordion', () => {
  it('links every button to its panel', () => {
    const { buttons, panels } = render();

    buttons.forEach((button, index) => {
      const panel = panels[index];

      expect(button.getAttribute('aria-controls')).toBe(panel.id);
      expect(panel.getAttribute('aria-labelledby')).toBe(button.id);
      expect(panel.getAttribute('role')).toBe('region');
      expect(isOpen(button)).toBe(false);
      expect(panel.style.height).toBe('0px');
    });
  });

  it('starts a panel open when its button has aria-expanded="true"', () => {
    const { buttons, panels } = render({ expanded: [1] });

    expect(buttons.map(isOpen)).toEqual([false, true, false]);
    expect(panels[1].classList.contains('is-expanded')).toBe(true);
    expect(panels[1].style.height).toBe('auto');
  });

  it('only enables transitions after the initial state is applied', () => {
    const { element } = render();

    expect(element.classList.contains('is-ready')).toBe(true);
  });

  it('toggles a panel when its button is clicked', () => {
    const { buttons, panels } = render();

    buttons[0].click();
    expect(isOpen(buttons[0])).toBe(true);
    expect(panels[0].classList.contains('is-expanded')).toBe(true);

    buttons[0].click();
    expect(isOpen(buttons[0])).toBe(false);
    expect(panels[0].classList.contains('is-expanded')).toBe(false);
    expect(panels[0].style.height).toBe('0px');
  });

  it('closes the open panel when another one opens', () => {
    const { buttons } = render({ expanded: [0] });

    buttons[2].click();

    expect(buttons.map(isOpen)).toEqual([false, false, true]);
  });

  it('keeps several panels open with data-accordion="multiple"', () => {
    const { buttons } = render({ multiple: true });

    buttons[0].click();
    buttons[2].click();

    expect(buttons.map(isOpen)).toEqual([true, false, true]);
  });

  it('opens straight to auto height when there is no transition', () => {
    const { buttons, panels } = render();

    buttons[0].click();

    expect(panels[0].style.height).toBe('auto');
  });

  it('animates to the content height, then switches to auto', () => {
    const { buttons, panels } = render();
    const panel = panels[0];
    const transitionEnd = (propertyName) =>
      Object.assign(new Event('transitionend', { bubbles: true }), {
        propertyName,
      });

    Object.defineProperty(panel, 'scrollHeight', { value: 120 });
    panel.style.transitionDuration = '0.6s';
    buttons[0].click();

    expect(panel.style.height).toBe('120px');

    panel.firstElementChild.dispatchEvent(transitionEnd('height'));
    panel.dispatchEvent(transitionEnd('visibility'));
    expect(panel.style.height).toBe('120px');

    panel.dispatchEvent(transitionEnd('height'));
    expect(panel.style.height).toBe('auto');
  });

  it('moves focus between headers with arrow, Home and End keys', () => {
    const { buttons } = render();
    const press = (key) =>
      document.activeElement.dispatchEvent(
        new KeyboardEvent('keydown', { key, bubbles: true })
      );

    buttons[0].focus();

    press('ArrowDown');
    expect(document.activeElement).toBe(buttons[1]);
    press('End');
    expect(document.activeElement).toBe(buttons[2]);
    press('ArrowDown');
    expect(document.activeElement).toBe(buttons[0]);
    press('ArrowUp');
    expect(document.activeElement).toBe(buttons[2]);
    press('Home');
    expect(document.activeElement).toBe(buttons[0]);
  });

  it('emits expand and collapse events', () => {
    const { element, buttons } = render();
    const events = [];
    const log = (event) => events.push([event.type, event.detail.index]);

    element.addEventListener('accordion:expand', log);
    element.addEventListener('accordion:collapse', log);
    buttons[0].click();
    buttons[1].click();

    expect(events).toEqual([
      ['accordion:expand', 0],
      ['accordion:collapse', 0],
      ['accordion:expand', 1],
    ]);
  });

  it('stops responding after destroy()', () => {
    const { accordion, buttons } = render();

    accordion.destroy();
    buttons[0].click();

    expect(isOpen(buttons[0])).toBe(false);
  });
});
