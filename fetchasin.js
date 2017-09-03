const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const asins = require('./asins.js');

async function fetchASIN(asin) {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const path = `https://www.amazon.com/dp/${asin}`;
  await page.setViewport({ width: 1680, height: 895 });
  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36'
  );
  await page.goto(path);
  const content = await page.content();
  const parsed = processInfo(content);

  // fs.writeFile(`./${asin}.html`, content, function(err) {
  //   if(err) {return console.log(err);}
  //   console.log("The file was saved!");
  // });
  // await page.screenshot({path: `${asin}.png`, fullPage: true});

  browser.close();
  const timeNow = Date().toString();
  return Object.assign({}, parsed, { asin, path, timeNow });
}

module.exports = fetchASIN;

function processInfo(html) {
  const $ = cheerio.load(html);
  const buybox = parseBuyBox($);
  const price = parsePrice($);
  const images = parseImages($);
  const brand = parseBrand($);
  const reviews = parseReviews($);
  const breadcrumbs = parseBreadCrumbs($);
  const aplus = parseAPlus($);

  return {
    buybox,
    price,
    brand,
    breadcrumbs,
    images,
    reviews,
    aplus
  };
}

function parseBuyBox($) {
  const merchantEl = $('#merchant-info');
  const merchantString = merchantEl
    .text()
    .trim()
    .split('Gift-wrap available.')[0];

  const amazon = merchantString.indexOf('Ships from and sold by Amazon') > -1;
  const fba = merchantString.indexOf('Fulfilled by Amazon') > -1;
  const merchantLink = {
    text: merchantEl
      .find('a')
      .text()
      .trim(),
    href: merchantEl.find('a').attr('href')
  };

  return {
    amazon,
    fba,
    merchantLink
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

function parseReviews($) {
  const reviewStars = $('#acrPopover').attr('title');
  // for some reason this is duplicated.
  const textRaw = $('#acrCustomerReviewLink #acrCustomerReviewText')
    .text()
    .trim();

  const text = textRaw.slice(0, textRaw.length / 2);

  return {
    text,
    reviewStars
  };
}

function parseBreadCrumbs($) {
  const el = $('#wayfinding-breadcrumbs_feature_div ul li a.a-link-normal');
  const text = el.text();
  const length = el.length;
  return {
    text,
    length
  };
}

function parseAPlus($) {
  return {
    modules: $('#aplus .aplus-module').length
  };
}
