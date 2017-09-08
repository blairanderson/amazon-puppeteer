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
    brand,
    media,
    reviews,
    bullets,
    aplus,
    variations,
    breadcrumbs
  };
};

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
