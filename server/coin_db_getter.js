var { app, port } = require('./express_connector')
// var request = require('request');
// var async = require('async');
// var Quotes = require('./model/quotes_schema')
var Coin = require('./model/coin_schema')
// var CoinMap = require('./model/coin_map_schema')
var gap_update = 90000; //millisec

app.get('/api/fromDB', (req, res) => {
  Coin.find({last_updated: {$gt: Date.now() - gap_update}}, [], 
  {skip:0, limit:200, sort:{ rank: 1}}, 
  function(err, coins) {
    if (err) throw err;
    else res.send({Total: coins.length, DB: coins});
  });
});

app.listen(port, () => console.log(`Listening on port ${port}`));