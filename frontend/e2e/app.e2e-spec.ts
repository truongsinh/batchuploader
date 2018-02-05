import { AppPage } from './app.po';

describe('batchuploader App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display batch info title', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Batch info');
  });
});
