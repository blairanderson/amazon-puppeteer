module.exports = {};
module.exports.parse = function($) {
  const rating = $('#acrPopover').attr('title');
  const ratingAverage = parseFloat(rating.replace(/,/g, ''));
  // for some reason this is duplicated.
  const textRaw = $('#acrCustomerReviewLink #acrCustomerReviewText')
    .text()
    .trim();

  // "675 customer reviews"
  const text = textRaw.slice(0, textRaw.length / 2);
  const count = parseInt(text.replace(/,/g, ''));

  return {
    text,
    count,
    rating,
    ratingAverage
  };
};
