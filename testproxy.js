require('dotenv').config();
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    ignoreHTTPSErrors: true,
    args: ['--proxy-server=proxy.crawlera.com:8010']
  });

  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({
    'Proxy-Authorization':
      'Basic ' +
      Buffer.from(`${process.env.CRAWLERA_APIKEY}:`).toString('base64')
  });

  page.on('console', (...args) => console.log('PAGE LOG:', ...args));
  // const path = `https://www.andersonassociates.net/`;
  const asin = 'B008E338FY';
  const path = `https://www.amazon.com/dp/${asin}`;
  await page.setViewport({ width: 1680, height: 895 });

  try {
    console.log('before-goto', path);
    var start = +new Date();
    var resp = await page.goto(path, {
      timeout: 0,
      waitUntil: 'domcontentloaded'
    });

    console.log('after-goto', path);
    var end = +new Date();
    console.log('start-end-diff', (end - start) / 1000);

    if (!resp.ok) {
      browser.close();
      return { status: resp.status, error: `ASIN NOT OK. ${resp.status}` };
    }
    console.log('goto', path);
  } catch (error) {
    console.log('page.goto ERROR', error.stack.split('\n'));
    browser.close();
    return { error: error.toString(), stack: error.stack.split('\n') };
  }

  try {
    await page.screenshot({ path: `tmp/anderson.png`, fullPage: true });
    console.log('screenshot');
    browser.close();
  } catch (e) {
    browser.close();
    console.log('screenshot error', e.stack.split('\n'));
  }
})();
