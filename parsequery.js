const parseQuery = function($) {
  const results = $('#s-results-list-atf li')
    .map(function(index) {
      return {
        rank: index + 1,
        asin: $(this).data('asin'),
        title: $(this)
          .find('h2')
          .text()
          .trim(),
        image: $(this)
          .find('img')
          .attr('src')
          .trim()
      };
    })
    .get();
  return { results };
};

module.exports = { parseQuery };
