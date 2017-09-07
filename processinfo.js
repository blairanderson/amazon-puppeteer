const cheerio = require('cheerio');
const parseBreadCrumbs = require('./parsers/breadcrumbs').parse;
const parseReviews = require('./parsers/reviews').parse;
const parseBuyBox = require('./parsers/buybox').parse;
const parseImages = require('./parsers/images').parse;
const parseBullets = require('./parsers/bullets').parse;

module.exports = function(html) {
  const $ = cheerio.load(html);

  return {
    buybox: parseBuyBox($),
    price: parsePrice($),
    brand: parseBrand($),
    media: parseImages($),
    reviews: parseReviews($),
    bullets: parseBullets($),
    aplus: parseAPlus($),
    breadcrumbs: parseBreadCrumbs($)
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
