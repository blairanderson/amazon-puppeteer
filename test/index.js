const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

function testMe(test, parser, done) {
  fs.readFile(path.join(__dirname, test), { encoding: 'utf-8' }, function(
    err,
    data
  ) {
    if (err) {
      console.log(err);
      done(err, null);
    } else {
      console.log(require(parser)(cheerio.load(data)));
      done(null, 'yolo');
    }
  });
}

testMe('breadcrumb.html', '../parsers/breadcrumbs.js', function(err, success) {
  if (err) {
    console.log('err', err);
  } else {
    console.log('success', success);
  }
});
