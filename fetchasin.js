const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { puppeteerArgs, userAgent, host, log } = require('./puppeteerargs.js');
const parse = require('amazon-html-to-json').parse;

async function fetchASIN(asin) {
  const browser = await puppeteer.launch(puppeteerArgs);
  const page = await browser.newPage();
  page.on('console', (...args) => console.log('PAGE LOG:', ...args));
  let screenshot = false;
  let images = false;
  console.log(asin);

  const path = `https://www.amazon.com/dp/${asin}`;
  const newData = { asin, path, timeNow: Date().toString() };
  await page.setViewport({ width: 1680, height: 895 });
  log('viewport');

  await page.setUserAgent(userAgent);
  log('useragent');

  try {
    var resp = await page.goto(path);
    if (!resp.ok) {
      browser.close();
      return { status: resp.status, error: `ASIN NOT OK. ${resp.status}` };
    }
    log('goto', path);
  } catch (error) {
    log('page.goto ERROR', JSON.stringify(error));
    browser.close();
    return { error: error.toString(), stack: error.stack.split('\n') };
  }

  if (process.env.SCREENSHOT === 'true' || process.env.SCREENSHOT === true) {
    try {
      log('screenshot');
      await page.screenshot({ path: `tmp/${asin}.png`, fullPage: true });
      newData['screenshot'] = `${host}/img/${asin}.png`;
      log('screenshot:', newData['screenshot']);
    } catch (error) {
      log('screenshot error');
      browser.close();
      return { error: error.toString(), stack: error.stack.split('\n') };
    }
  }

  function fetchImages() {
    return new Promise((resolve, reject) => {
      if (window.P) {
        P.when('ImageBlockATF').execute(function(dat) {
          if (dat) {
            resolve(dat);
          } else {
            reject('nope');
          }
        });
      } else {
        reject('nope');
      }
    });
  }

  try {
    images = await page.evaluate(fetchImages);
  } catch (e) {
    console.log(e);
  }

  try {
    const content = await page.content();
    log('content downloaded');
    log('parsing started', Date().toString());
    const $ = cheerio.load(content);
    const parsed = parse($, images);
    log('content parsed', Date().toString());
    browser.close();
    return Object.assign(newData, parsed);
  } catch (error) {
    browser.close();
    console.log('ERR', error.toString(), error.stack);
    return { error: error.toString(), stack: error.stack.split('\n') };
  }
}

module.exports = { fetchASIN };
