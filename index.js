const fetchASIN = require('./fetchasin.js');
const express = require('express');
const app = express();
const asinRegex = new RegExp('([A-Z0-9]{10})');
const message = 'Sorry that asin does not match the pattern';

app.set('port', process.env.PORT || 5000);
app.use(express.static(__dirname + '/public'));

app.get('/:asin', function(request, response) {
  console.log(JSON.stringify(request.params));
  const { asin } = request.params;

  if (asin.match(asinRegex)) {
    fetchASIN(asin)
      .then(function(data) {
        response.json(data);
      })
      .catch(function(error) {
        console.log('ERROR', error);
      });
  } else {
    response.json(Object.assign({}, request.params, { message }));
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
