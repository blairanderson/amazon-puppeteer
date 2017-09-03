const puppeteer = require('puppeteer');
const fs = require('fs');
const cheerio = require('cheerio');
const asins = require('./asins.js');
const express = require('express');
const app = express();
const asinRegex = new RegExp('([A-Z0-9]{10})');

app.set('port', process.env.PORT || 5000);
app.use(express.static(__dirname + '/public'));

app.get('/:asin', function(request, response) {
  const { asin } = request.params;
  console.log(JSON.stringify(request.params));
  if (asin.match(asinRegex)) {
    fetchASIN(asin).then(function(data) {
      response.json(data);
    });
  } else {
    response.json(
      Object.assign({}, request.params, {
        message: 'Sorry that asin does not match the pattern'
      })
    );
  }
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

async function fetchASIN(asin) {
  const path = `https://www.amazon.com/dp/${asin}`;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
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

function processInfo(html) {
  const $ = cheerio.load(html);
  const merchant = parseMerchant($);
  const price = parsePrice($);
  const images = parseImages($);
  const brand = parseBrand($);
  const reviews = parseReviews($);
  const breadcrumbs = parseBreadCrumbs($);
  const aplus = parseAPlus($);

  return {
    merchant,
    price,
    brand,
    breadcrumbs,
    images,
    reviews,
    aplus
  };
}

function parseMerchant($) {
  const merchantEl = $('#merchant-info');
  const merchantString = merchantEl
    .text()
    .trim()
    .split('.');

  const amazon =
    merchantString.indexOf('Ships from and sold by Amazon.com') > -1;
  const fba = merchantString.indexOf('Fulfilled by Amazon') > -1;

  const merchantLink = merchantEl.find('a') && {
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
  const reviewsEl = $('#acrCustomerReviewLink');
  return {
    text: reviewsEl.text().trim()
  };
}

function parseBreadCrumbs($) {
  return $('#wayfinding-breadcrumbs_feature_div ul li a.a-link-normal').text();
}

function parseAPlus($) {
  return {
    modules: $('#aplus .aplus-module').length
  };
}
