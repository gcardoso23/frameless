import Page from '../classes/Page';
import Accordion from '../components/Accordion';

export default class Home extends Page {
  constructor(element) {
    super({
      element,
      components: {
        '[data-accordion]': Accordion,
      },
    });
  }
}
