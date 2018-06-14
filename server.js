const express = require('express');

const app = express();
const port = process.env.PORT || 5000;

var request = require('request');

app.get('/api/hello', (req, res) => {
  request('https://api.coinmarketcap.com/v2/ticker/?structure=array', function (error, response, body) {
    console.log('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    console.log('body:', JSON.parse(body)["data"]); // Print the HTML.
    res.send({ express: JSON.parse(body)["data"] });
  });
});

app.listen(port, () => console.log(`Listening on port ${port}`));