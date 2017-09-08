module.exports = {};

module.exports.parse = function($) {
  const mapper = function(index, el) {
    const text = $(el)
      .text()
      .trim();
    const asin = $(el).attr('data-defaultasin');
    const url = $(el).attr('data-dp-url');
    return {
      text,
      asin,
      url
    };
  };

  const style = $('#twister #variation_style_name ul li')
    .map(mapper)
    .get();
  const color = $('#twister #variation_color_name ul li')
    .map(mapper)
    .get();
  const size = $('#twister #variation_size_name ul li')
    .map(mapper)
    .get();

  return {
    style,
    color,
    size
  };
};

module.exports.expectation = {
  style: [
    {
      text: 'w/ Wall Plate (1-Gang)',
      asin: '',
      url: '/dp/B007ST09TI/ref=twister_B00OLG42JY'
    },
    {
      text: 'w/ Wall Plate (2-Gang)',
      asin: '',
      url: '/dp/B007ST09T8/ref=twister_B00OLG42JY'
    },
    { text: 'Low Voltage Bracket', asin: 'B003JQL0S8', url: '' }
  ],
  size: [
    {
      text: '1 Pack',
      asin: 'B000UEAJWU',
      url: '/dp/B000UEAJWU/ref=twister_B00OLG42JY?_encoding=UTF8&psc=1'
    },
    {
      text: '2 Pack',
      asin: '',
      url: '/dp/B007ST09TI/ref=twister_B00OLG42JY'
    },
    { text: '10 Pack', asin: 'B003JQL0S8', url: '' }
  ]
};
