var express = require('express');

var app = express(),
  port = 3001;

app.get('/healthcheck', (req, res) => {
    res.send({});
});

app.listen(port, (err) => {
  if (err) {
    return;
  }
  console.log('Listening at http://localhost:' + port);
}); 