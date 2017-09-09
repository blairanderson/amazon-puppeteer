const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const equal = require('deep-equal');
const TESTS = ['images', 'breadcrumbs', 'bullets', 'twister'];

//   'breadcrumb.html': '../parsers/breadcrumbs.js',
//   'images.html': '../parsers/images.js'
// };

function testMe(func) {
  fs.readFile(
    path.join(__dirname, func + '.html'),
    { encoding: 'utf-8' },
    function(err, testData) {
      if (err) {
        console.log(err);
        throw 'error reading testfile' + func;
      } else {
        const context = cheerio.load(testData);
        const parser = require('../parser/' + func + '.js');
        const result = parser.parse(context);
        const expectation = parser.expectation;
        if (equal(result, expectation)) {
          console.log('func:', func, 'success!!!');
        } else {
          console.log('func:', func, 'failure...');
          console.log('expected:', JSON.stringify(expectation, null, 4));
          console.log('got:', JSON.stringify(result, null, 4));
        }
      }
    }
  );
}

TESTS.forEach(testMe);
