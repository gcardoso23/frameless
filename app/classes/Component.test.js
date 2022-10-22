import Component from './Component';

describe('Component', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="card">
        <button class="card__button">A</button>
        <button class="card__button">B</button>
      </div>
      <button class="card__button">Outside</button>
    `;
  });

  it('accepts its root as an element or a selector', () => {
    const element = document.querySelector('.card');

    expect(new Component({ element }).element).toBe(element);
    expect(new Component({ element: '.card' }).element).toBe(element);
  });

  it('throws when the root element is missing', () => {
    expect(() => new Component({ element: '.missing' })).toThrow(
      'Component root not found: .missing'
    );
  });

  it('looks up child elements inside its root only', () => {
    const component = new Component({
      element: '.card',
      elements: { buttons: '.card__button' },
    });

    expect(component.elements.buttons.map((b) => b.textContent)).toEqual([
      'A',
      'B',
    ]);
  });

  it('emits bubbling custom events from its root', () => {
    const component = new Component({ element: '.card' });
    const listener = jest.fn();

    document.body.addEventListener('card:open', listener);
    component.emit('card:open', { id: 1 });
    document.body.removeEventListener('card:open', listener);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].detail).toEqual({ id: 1 });
  });

  it('removes its listeners when destroyed', () => {
    const component = new Component({ element: '.card' });
    const removeEventListeners = jest.spyOn(component, 'removeEventListeners');

    component.destroy();

    expect(removeEventListeners).toHaveBeenCalledTimes(1);
  });
});
