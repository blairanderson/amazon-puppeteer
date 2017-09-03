const fetchASIN = require('./fetchasin.js');
const express = require('express');
const app = express();
const asinRegex = new RegExp('([A-Z0-9]{10})');
const message = 'Sorry that asin does not match the pattern';
const now = require('performance-now');

app.set('port', process.env.PORT || 5000);
app.use(express.static(__dirname + '/public'));

app.get('/:asin', function(request, response) {
  const start = now();
  console.log((start - end).toFixed(3));
  console.log(JSON.stringify(request.params));
  const { asin } = request.params;

  if (asin.match(asinRegex)) {
    fetchASIN(asin)
      .then(function(data) {
        const end = now();
        const time = (start - end).toFixed(3);
        response.json(Object.assign({}, data, { time }));
      })
      .catch(function(error) {
        console.log('ERROR', error);
      });
  } else {
    const time = (start - end).toFixed(3);
    response.json(Object.assign({}, request.params, { message, time }));
  }
});

app.get('/', function(request, response) {
  response.json(
    Object.assign(
      {},
      request.params,
      {
        message: 'expected path is /ASIN1234567',
        error: 'path not found, must include asin'
      },
      { status: 404 }
    )
  );
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
