const express = require('express');
const mongoose = require('mongoose')

const app = express();
const port = process.env.PORT || 5000;

const request = require('request');
const async = require('async');

mongoose.connect('mongodb://localhost/abcdef')

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error'));
db.on('open', function(callback) {
	console.log('Connected to database.');
});

var Schema = mongoose.Schema;

var quotesSchema = new Schema(
  {
    price: Number,
    volume_24h: Number,
    market_cap: Number,
    percent_change_1h: Number,
    percent_change_24h: Number,
    percent_change_7d: Number    
  }
);

var Quotes = mongoose.model('Quotes', quotesSchema);

var coinSchema = new Schema(
  { id: Number,
    ref_id: Number,
    name: String,
    symbol: String,
    website_slug: String,
    rank: Number,
    circulating_supply: Number,
    total_supply: Number,
    max_supply: Number,
    quotes:{
      type: Map,
      of: {}
    },
    last_updated: Number }
);

var Coin = mongoose.model('Coin', coinSchema);

function saveCoin(data) {
  var coin = new Coin(data);
  coin.save(function (err) {
      if (err) return console.log(err);
      // saved!
      else console.log('s');
  })
}

function httpGet(url, callback) {
  const options = {
    url :  url,
    json : true
  };
  request(options,
    function(err, res, body) {
      callback(err, body);
    }
  );
}

const urls= [
  "https://api.coinmarketcap.com/v2/ticker/?structure=array",
  "https://api.coinmarketcap.com/v2/ticker/?convert=THB&structure=array",
  "https://api.coinmarketcap.com/v2/ticker/?convert=EUR&structure=array",
  "https://api.coinmarketcap.com/v2/ticker/?convert=CNY&structure=array"
];

app.get('/api/hello', (req, res) => {
  var quotes = {}, bigData, 
  data, text = " ", i, j, prices = ["price", "volume_24h", "market_cap"], priceses = {},
  country = ["USD", "THB", "EUR", "CNY"];
  async.map(urls, httpGet, function (err, body){
    if (err) return console.log(err);
    //console.log(body);
    res.header("Content-Type",'application/json');
    for( i = 0; i < country.length; i++){
      for( j = 0; j < prices.length; j++){
        priceses[prices[j]] = body[i].data[0].quotes[country[i]][prices[j]];
      }
      console.log(priceses);
      quotes[country[i]] = priceses;
    }
    // quotes[country[1]] = body[0].data[0].quotes.THB;
    // quotes[country[2]] = body[1].data[0].quotes.EUR;
    // quotes[country[3]] = body[2].data[0].quotes.CNY;
    res.send({express: quotes});
  });
  saveCoin(
    {
      "id": 1,
      "ref_id": 1, 
      "name": "Bitcoin",
      "symbol": "BTC",
      "website_slug": "bitcoin",
      "rank": 1,
      "circulating_supply": 17094187,
      "total_supply": 17094187,
      "max_supply": 21000000,
      "quotes": {
          "USD": {
              "price": 6610.52,
              "volume_24h": 4722620000,
              "market_cap": 113001465047,
              "percent_change_1h": -0.14,
              "percent_change_24h": 1.39,
              "percent_change_7d": -13.28
          },
          "THB": {
              "price": 213916.7634771522,
              "volume_24h": 152824223439.67923,
              "market_cap": 3656733157313,
              "percent_change_1h": -0.14,
              "percent_change_24h": 1.39,
              "percent_change_7d": -13.28
          },
          "EUR": {
            "price": 5713.2041553593,
            "volume_24h": 4081568803.6921163,
            "market_cap": 97662580201,
            "percent_change_1h": -0.14,
            "percent_change_24h": 1.39,
            "percent_change_7d": -13.28
          },
          "CNY": {
            "price": 3251.2829394709,
            "volume_24h": 14676891694.249865,
            "market_cap": 325406670212,
            "percent_change_1h": -0.38,
            "percent_change_24h": 4.01,
            "percent_change_7d": -15.8
          }
        },
          "last_updated": 1529051673
    });
});

Coin.remove({}, function(err) {
  if (err) {
      console.log(err)
  } else {
      console.log('remove success');
  }
});

app.listen(port, () => console.log(`Listening on port ${port}`));