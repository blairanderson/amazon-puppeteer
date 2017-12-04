const puppeteer = require('puppeteer');
const { puppeteerArgs, userAgent, host, log } = require('./puppeteerargs.js');
const cheerio = require('cheerio');
const querystring = require('querystring');
const parseQuery = require('./parsequery.js');

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
    return { error: error.toString(), stack: error.stack.split('\n') };
  }

  try {
    const content = await page.content();
    log('content downloaded');
    log('parsing started', Date().toString());
    const $ = cheerio.load(content);
    let parsed = parseQuery($, asin);
    parsed.results.forEach(function(result) {
      result.matched = result.asin === asin;
    });
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
