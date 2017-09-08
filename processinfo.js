const cheerio = require('cheerio');
const parseBreadCrumbs = require('./parsers/breadcrumbs').parse;
const parseReviews = require('./parsers/reviews').parse;
const parseBuyBox = require('./parsers/buybox').parse;
const parseImages = require('./parsers/images').parse;
const parseBullets = require('./parsers/bullets').parse;
const parseVariations = require('./parsers/twister').parse;

const log = function() {
  if (process.env.LOG) {
    console.log.apply(this, arguments);
  }
};
module.exports = function(html) {
  const $ = cheerio.load(html);
  const buybox = parseBuyBox($);
  log(parseBuyBox($));
  const price = parsePrice($);
  log(parsePrice($));
  const brand = parseBrand($);
  log(parseBrand($));
  const media = parseImages($);
  log(parseImages($));
  const reviews = parseReviews($);
  log(parseReviews($));
  const bullets = parseBullets($);
  log(parseBullets($));
  const aplus = parseAPlus($);
  log(parseAPlus($));
  const variations = parseVariations($);
  log(parseVariations($));
  const breadcrumbs = parseBreadCrumbs($);
  log(parseBreadCrumbs($));

  return {
    buybox,
    price,
    brand,
    media,
    reviews,
    bullets,
    aplus,
    variations,
    breadcrumbs
  };
};

function parsePrice($) {
  const priceEl = $('#priceblock_ourprice');
  return {
    our_price: priceEl.text().trim()
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
