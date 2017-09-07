module.exports = {};
module.exports.parse = function($) {
  const bulletEls = $('#feature-bullets ul li span.a-list-item:not(:has(*))');
  const count = bulletEls.length;
  const bullets = bulletEls
    .map(function(index, span) {
      const text = $(span)
        .text()
        .trim();
      return {
        characterCount: text.length,
        text
      };
    })
    .get();

  const sum = bullets
    .map(function(bullet) {
      return bullet.characterCount;
    })
    .reduce(function(accumulator, count) {
      return accumulator + count;
    });

  const averageLength = parseFloat((sum / count).toFixed(1));

  return {
    bullets,
    count,
    averageLength
  };
};

module.exports.expectation = {
  bullets: [
    {
      characterCount: 75,
      text:
        'Mounting bracket has Oval holes that allow final shifting and straightening'
    },
    {
      characterCount: 75,
      text:
        'Easy to install, for mounting low voltage wires(phone, internet, TV, video)'
    },
    {
      characterCount: 98,
      text:
        'Adjusts to fit various wall thickness, the bracket wings secure when mounting screws are tightened'
    },
    {
      characterCount: 76,
      text:
        'Bracket is its own template for cut-out, trace the bracket then cut the hole'
    },
    {
      characterCount: 98,
      text:
        'Horizontal or vertical mounting, installs faster and costs less than metal brackets, UL/CSA Listed'
    },
    {
      characterCount: 35,
      text: 'Designed to mount wall plates flush'
    },
    {
      characterCount: 72,
      text:
        'Adjusts to fit 1/4-inch to 1-inch thick wall board, paneling, or drywall'
    },
    { characterCount: 31, text: 'Horizontal or vertical mounting' },
    { characterCount: 29, text: 'UL/CSA listed 1-gang, 10-pack' },
    {
      characterCount: 105,
      text:
        'Mounting brackets offer specially designed screw holes that deliver a better looking, easy to install job'
    }
  ],
  count: 10,
  averageLength: 69.4
};
