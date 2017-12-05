var potrace = require('potrace'),
  fs = require('fs');

potrace.trace(
  'tmp/bulb-shapes-and-sizes.png',
  { threshold: 150, steps: 10 },
  function(err, svg) {
    if (err) throw err;
    fs.writeFileSync('tmp/bulb-shapes-and-sizes.svg', svg);
  }
);
