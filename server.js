const express = require('express');
const mongoose = require('mongoose')

const app = express();
const port = process.env.PORT || 5000;

const request = require('request');
const async = require('async');
app.set('json spaces', 2);

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
  { id: String,
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

var CoinMapSchema = new Schema(
  { id: String,
    ref_id: Number }
)

var CoinMap = mongoose.model('CoinMap', CoinMapSchema);

const BizarreCoin =
  {
    "id": 69555,
    "name": "BitchCoin",
    "symbol": "BIT",
    "website_slug": "bitttttt",
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
  };

function newCoin(data, superName) {
  var newData = {...data};
  console.log(superName)
  newData.id = superName;
  newData.ref_id = data.id;
  var coin = new Coin(newData);
  coin.save(function (err) {
      if (err) return console.log(err);
      // saved!
      else{
        console.log('New Coin');
      }
  })
  return newData;  
}

function saveCoin(data) {
  Coin.findOneAndUpdate({ref_id: data.ref_id}, data, {upsert:true}, function(err, doc){
    if (err) return res.send(500, { error: err });
    return console.log("Saved Coin");
  });
}

function newCoinMap(data) {
  var coinmap = new CoinMap(data);
  coinmap.save(function (err) {
      if (err) return console.log(err);
      else console.log('New CoinMap');
      // saved!
  })
}

function saveCoinMap(data) {
  CoinMap.findOneAndUpdate({ref_id: data.ref_id}, data, {upsert:true}, function(err, doc){
    if (err) return console.log(err);
    return console.log("Saved CoinMap");
  });
}

function fetchAll(db){
  Coin.find({}, function(err, coins) {
    var coinMap = {};

    coins.forEach(function(coin) {
      coinMap[coin._id] = coin;
    });

    return coinMap;  
  });
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

Coin.remove({}, function (err) {
  if (err) {
    console.log(err)
  } else {
    console.log('Coin Removed');
  }
});


CoinMap.remove({}, function (err) {
  if (err) {
    console.log(err)
  } else {
    console.log('CoinMap Removed');
  }
});

function coinCheck(API_id, bigData, template, h) {
  CoinMap.find({ ref_id: API_id }, function(err, coinm) {
    if (err) throw err;
  
    console.log(API_id);

    // object of the user
    if(coinm.length === 0) {
      console.log("not found");
      superName = template[h].symbol + (h + 100);
      bigData[h] = newCoin(bigData[h], superName);
      newCoinMap({id: superName, ref_id: API_id});
    } else {
      console.log("found", API_id);
      saveCoin(bigData[h]);
      saveCoinMap({id: superName, ref_id: API_id});
    }
  });
}

app.get('/api/hello', (req, res) => {
  console.log("============================================================================================");
  // [START] Declear variable
  var coins_ID_map = {}, superName, API_id, template,
  quotes = {}, bigData = [], h, i, j,
  prices = ["price", "volume_24h", "market_cap"],
  country = ["USD", "THB", "EUR", "CNY"],
  percent = ["percent_change_1h", "percent_change_24h", "percent_change_7d"],
  prices_ = {},
  percent_change = {}, 
  temp_price, temp_percent, temp_ref_id, temp_quotes;
  // [END] Declear variable
  // [START] Check data
  async.map(urls, httpGet, function (err, body){
    template = body[0].data; //List of Data(API)
    if (err) return console.log(err);
    res.header("Content-Type",'application/json');
    for(h = 0; h < template.length; h++){ //FIRST LOOP (Edit: All of coins)
      for( i = 0; i < country.length; i++){ //2nd LOOP (Edit: coin_currency & percent in "quotes")
        const coin = body[i].data[h],
              coin_currency = coin.quotes[country[i]];
        for( j = 0; j < prices.length; j++){ //3rd LOOP
          prices_[prices[j]] = coin_currency[prices[j]];
          if(i === 0) percent_change[percent[j]] = coin_currency[percent[j]];
        } // [END] for j
        temp_price = {...prices_};
        temp_percent = {...percent_change};
        quotes["percent_change"] = temp_percent;
        quotes[country[i]] = temp_price;
      } // [END] for i
      bigData[h] = {...template[h]};  //Create bigData
      temp_quotes = {...quotes};
      temp_ref_id = bigData[h].id;
      bigData[h].quotes = temp_quotes; // Edit bigData #2
      superName = template[h].symbol + h; //key
      API_id = template[h].id; //id From Web
      coins_ID_map[superName] = API_id;
      coinCheck(API_id, bigData, template, h);
    } // [END] for h
    res.json({CoinData: bigData});
  }); // [END] async.map
  // [END] Check data
});

app.listen(port, () => console.log(`Listening on port ${port}`));