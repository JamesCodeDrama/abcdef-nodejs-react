var { app, port } = require('./express_connector')
// var request = require('request');
// var async = require('async');
// var Quotes = require('./model/quotes_schema')
var Coin = require('./model/coin_schema')
// var CoinMap = require('./model/coin_map_schema')

app.get('/api/fromDB', (req, res) => {
  Coin.find({}, [], 
  {skip:0, limit:200, sort:{ rank: 1}}, 
  function(err, coins) {
    if (err) throw err;
    else res.send({DB: coins});
  });
});

app.listen(port, () => console.log(`Listening on port ${port}`));