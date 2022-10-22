import Page from './Page';

class Widget {
  constructor(element) {
    this.element = element;
    this.destroy = jest.fn();
  }
}

describe('Page', () => {
  let element;

  beforeEach(() => {
    document.body.innerHTML = `
      <main>
        <div data-widget></div>
        <div data-widget></div>
      </main>
      <div data-widget></div>
    `;
    element = document.querySelector('main');
  });

  it('creates a component for every matching element inside the page', () => {
    const page = new Page({ element, components: { '[data-widget]': Widget } });

    expect(page.components).toHaveLength(2);
    expect(page.components.every((c) => element.contains(c.element))).toBe(
      true
    );
  });

  it('destroys its components', () => {
    const page = new Page({ element, components: { '[data-widget]': Widget } });
    const [first, second] = page.components;

    page.destroy();

    expect(first.destroy).toHaveBeenCalledTimes(1);
    expect(second.destroy).toHaveBeenCalledTimes(1);
    expect(page.components).toEqual([]);
  });
});
