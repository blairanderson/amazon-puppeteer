const fetchASIN = require('./fetchasin.js');
const express = require('express');
const app = express();
const asinRegex = new RegExp('([A-Z0-9]{10})');
const message = 'Sorry that asin does not match the pattern';
const now = require('performance-now');

app.set('port', process.env.PORT || 5000);
app.use(express.static(__dirname + '/public'));

function start() {
  const start = now();
  return {
    done: function() {
      const end = now();
      return ((end - start) / 1000).toFixed(3);
    }
  };
}

app.get('/:asin', function(request, response) {
  const timer = start();
  console.log(JSON.stringify(request.params));
  const { asin } = request.params;

  if (asin.match(asinRegex)) {
    fetchASIN(asin)
      .then(function(data) {
        response.json(Object.assign({}, data, { time: timer.done() }));
      })
      .catch(function(error) {
        console.log('ERROR', error);
      });
  } else {
    response.json(
      Object.assign({}, request.params, { message, time: timer.done() })
    );
  }
});

app.get('/', function(request, response) {
  const timer = start();
  response.json(
    Object.assign(
      {},
      request.params,
      {
        message: 'expected path is /ASIN1234567',
        error: 'path not found, must include asin',
        time: timer.done()
      },
      { status: 404 }
    )
  );
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
