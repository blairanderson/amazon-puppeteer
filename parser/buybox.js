module.exports = {};
module.exports.parse = function($) {
  const merchantEl = $('#merchant-info');
  const merchantString = merchantEl
    .text()
    .trim()
    .split('Gift-wrap available.')[0];

  const amazon = merchantString.indexOf('Ships from and sold by Amazon') > -1;

  const merchantLink = {
    fba: merchantString.indexOf('Fulfilled by Amazon') > -1,
    href: merchantEl.find('a').attr('href'),
    text: merchantEl
      .find('a')
      .text()
      .trim()
      .replace('Fulfilled by Amazon', '')
      .replace('easy-to-open packaging', '')
  };

  const priceEl = $('#priceblock_ourprice');
  const currency = priceEl.text().trim();
  const our_price = Number(currency.replace(/[^0-9\.-]+/g, ''));

  return {
    amazon,
    merchantLink,
    price: {
      our_price,
      currency
    }
  };
};
