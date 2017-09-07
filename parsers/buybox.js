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

  return {
    amazon,
    fba,
    merchantLink
  };
};
