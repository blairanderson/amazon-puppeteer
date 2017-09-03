const SELECTOR = '#wayfinding-breadcrumbs_feature_div ul li a.a-link-normal';

module.exports = function($) {
  return $(SELECTOR)
    .map(function extract(index) {
      return {
        index,
        href: $(this).attr('href'),
        title: $(this)
          .text()
          .trim()
      };
    })
    .get();
};
