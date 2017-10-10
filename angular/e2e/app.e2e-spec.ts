import { AngularRTCPage } from './app.po';

describe('angular-rtc App', () => {
  let page: AngularRTCPage;

  beforeEach(() => {
    page = new AngularRTCPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to ARTC!');
  });
});
