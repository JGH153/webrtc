import { browser, by, element } from 'protractor';

export class AngularRTCPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('ARTC-root h1')).getText();
  }
}
