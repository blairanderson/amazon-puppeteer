const fetchASIN = require('./fetchasin.js');
const express = require('express');
const app = express();
const asinRegex = new RegExp('([A-Z0-9]{10})');

app.set('port', process.env.PORT || 5000);
app.use(express.static(__dirname + '/public'));

app.get('/:asin', function(request, response) {
  console.log(JSON.stringify(request.params));
  const { asin } = request.params;

  if (asin.match(asinRegex)) {
    fetchASIN(asin).then(function(data) {
      response.json(data);
    });
  } else {
    response.json(
      Object.assign({}, request.params, {
        message: 'Sorry that asin does not match the pattern'
      })
    );
  }
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
