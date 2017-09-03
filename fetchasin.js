const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const asins = require('./asins.js');
const parseBreadCrumbs = require('./parsers/breadcrumbs');
const parseReviews = require('./parsers/reviews');
const parseBuyBox = require('./parsers/buybox');

const userAgent =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36';

const puppeteerArgs = {
  args: ['--no-sandbox', '--disable-setuid-sandbox']
};

async function fetchASIN(asin) {
  const browser = await puppeteer.launch(puppeteerArgs);
  const page = await browser.newPage();
  const path = `https://www.amazon.com/dp/${asin}`;
  await page.setViewport({ width: 1680, height: 895 });
  await page.setUserAgent(userAgent);
  await page.goto(path);
  const content = await page.content();
  const parsed = processInfo(content);
  browser.close();
  return Object.assign({ asin, path, timeNow: Date().toString() }, parsed);

  // fs.writeFile(`./${asin}.html`, content, function(err) {
  //   if(err) {return console.log(err);}
  //   console.log("The file was saved!");
  // });
  // await page.screenshot({path: `${asin}.png`, fullPage: true});
}

module.exports = fetchASIN;

function processInfo(html) {
  const $ = cheerio.load(html);

  return {
    buybox: parseBuyBox($),
    price: parsePrice($),
    brand: parseBrand($),
    images: parseImages($),
    reviews: parseReviews($),
    aplus: parseAPlus($),
    breadcrumbs: parseBreadCrumbs($)
  };
}

function parsePrice($) {
  const priceEl = $('#priceblock_ourprice');
  return {
    our_price: priceEl.text().trim()
  };
}

function parseImages($) {
  const imagesEl = $('li.a-spacing-small.item.imageThumbnail.a-declarative');
  return {
    count: imagesEl.length,
    thumbnails: []
  };
}

function parseBrand($) {
  const brandEl = $('a#bylineInfo');
  return {
    text: brandEl.text().trim(),
    href: brandEl.attr('href')
  };
}

function parseAPlus($) {
  return {
    modules: $('#aplus .aplus-module').length
  };
}
