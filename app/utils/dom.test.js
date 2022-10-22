import { $, $$, hasTransition, uniqueId } from './dom';

describe('dom utils', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <ul id="list"><li>One</li><li>Two</li></ul>
      <li>Outside</li>
    `;
  });

  it('$ returns the first match, or null', () => {
    expect($('li').textContent).toBe('One');
    expect($('.missing')).toBeNull();
  });

  it('$$ returns every match as an array, optionally within a scope', () => {
    expect(Array.isArray($$('li'))).toBe(true);
    expect($$('li')).toHaveLength(3);
    expect($$('li', $('#list'))).toHaveLength(2);
  });

  it('uniqueId returns a new id on every call', () => {
    const first = uniqueId('panel');
    const second = uniqueId('panel');

    expect(first).toMatch(/^panel-\d+$/);
    expect(second).not.toBe(first);
  });

  it('hasTransition is true only when some duration is above zero', () => {
    const element = $('#list');

    expect(hasTransition(element)).toBe(false);

    element.style.transitionDuration = '0s, 0.3s';
    expect(hasTransition(element)).toBe(true);

    element.style.transitionDuration = '0s, 0ms';
    expect(hasTransition(element)).toBe(false);
  });
});
