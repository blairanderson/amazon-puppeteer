const puppeteer = require('puppeteer');
const querystring = require('querystring');
const fs = require('fs');
const cheerio = require('cheerio');
const parseQuery = function(html, asin) {
  const $ = cheerio.load(html);
  const results = $('#s-results-list-atf li')
    .map(function(index) {
      return {
        rank: index + 1,
        asin: $(this).data('asin'),
        matched: $(this).data('asin') === asin,
        title: $(this)
          .find('h2')
          .text()
          .trim(),
        image: $(this)
          .find('img')
          .attr('src')
          .trim()
      };
    })
    .get();
  return { results };
};

const userAgent =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36';

const puppeteerArgs = {
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
  // headless: false,
  slowMo: 250 // slow down by 250ms
};

const host =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000'
    : 'https://puppeteertest.herokuapp.com';

const log = (...args) => {
  if (process.env.LOG) {
    console.log(...args);
  }
};

async function fetchQuery(keywords, asin) {
  const browser = await puppeteer.launch(puppeteerArgs);
  const page = await browser.newPage();
  page.on('console', (...args) => console.log('PAGE LOG:', ...args));
  let screenshot = false;
  let images = false;
  console.log(asin);
  const keyquerystring = querystring.stringify({ keywords });
  const path = `https://www.amazon.com/s?${
    keyquerystring
  }&unfiltered=1&ie=UTF8`;
  const newData = { asin, keywords, path, timeNow: Date().toString() };
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
    return { error };
  }

  try {
    const content = await page.content();
    log('content downloaded');
    log('parsing started', Date().toString());
    const parsed = parseQuery(content, asin);
    log('content parsed', Date().toString());
    browser.close();
    return Object.assign(newData, parsed);
  } catch (error) {
    browser.close();
    console.log('ERR', error.toString(), error.stack);
    return { error: error.toString(), stack: error.stack.split('\n') };
  }
}

module.exports = { fetchQuery };
