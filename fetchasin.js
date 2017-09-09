const puppeteer = require('puppeteer');
const processInfo = require('./processinfo');

const userAgent =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36';

const puppeteerArgs = {
  args: ['--no-sandbox', '--disable-setuid-sandbox']
};

const host =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000'
    : 'https://puppeteertest.herokuapp.com';

function log() {
  if (process.env.LOG) {
    console.log.apply(this, arguments);
  }
}

async function fetchASIN(asin) {
  const browser = await puppeteer.launch(puppeteerArgs);
  const page = await browser.newPage();
  let screenshot = false;
  console.log(asin);
  const path = `https://www.amazon.com/dp/${asin}`;
  const newData = { asin, path, timeNow: Date().toString() };
  await page.setViewport({ width: 1680, height: 895 });
  log('viewport');
  await page.setUserAgent(userAgent);
  log('useragent');

  try {
    await page.goto(path);
    log('goto', path);
  } catch (e) {
    log('page.goto ERROR', JSON.stringify(e));
    browser.close();
    return {};
  }

  try {
    if (process.env.SCREENSHOT) {
      await page.screenshot({ path: `tmp/${asin}.png`, fullPage: true });
      newData['screenshot'] = `${host}/img/${asin}.png`;
      log('screenshot:', newData['screenshot']);
    }
  } catch (err) {
    log('screenshot error');
    browser.close();
    return {};
  }

  const content = await page.content();
  log('content downloaded');

  try {
    log('parsing started', Date().toString());
    const parsed = processInfo(content);
    log('content parsed', Date().toString());
    browser.close();
    return Object.assign(newData, parsed);
  } catch (err) {
    browser.close();
    console.log('ERR', err);
    return {};
  }
}

module.exports = fetchASIN;
