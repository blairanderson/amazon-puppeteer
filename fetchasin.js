const puppeteer = require('puppeteer');
const processInfo = require('./processinfo');

const userAgent =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36';

const puppeteerArgs = {
  args: ['--no-sandbox', '--disable-setuid-sandbox']
};

function log() {
  if (process.env.LOG) {
    console.log.apply(this, arguments);
  }
}

async function fetchASIN(asin) {
  try {
    const browser = await puppeteer.launch(puppeteerArgs);
    const page = await browser.newPage();
    console.log(asin);
    const path = `https://www.amazon.com/dp/${asin}`;
    await page.setViewport({ width: 1680, height: 895 });
    log('viewport');
    await page.setUserAgent(userAgent);
    log('useragent');
    await page.goto(path);
    log('goto', path);
    const content = await page.content();
    log('content downloaded');
    if (process.env.SCREENSHOT) {
      await page.screenshot({ path: `tmp/${asin}.png`, fullPage: true });
      log('screenshot');
    }
    log('parsing started', Date().toString());
    const parsed = processInfo(content);
    log('content parsed', Date().toString());
    browser.close();
    return Object.assign({ asin, path, timeNow: Date().toString() }, parsed);
  } catch (err) {
    browser.close();
    console.log('ERR', err);
    return new Error(err);
  }
}

module.exports = fetchASIN;
