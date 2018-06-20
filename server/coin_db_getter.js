var { request, async } = require('./express_connector')
var request = require('request');
var async = require('async');
const app = express();
const port = process.env.PORT || 5000;
app.set('json spaces', 2);
// var Quotes = require('./model/quotes_schema')
var Coin = require('./model/coin_schema')
var CoinMap = require('./model/coin_map_schema')

app.get('/api/fromDB', (req, res) => {
  Coin.find({}, [], 
  {skip:0, limit:200, sort:{ rank: 1}}, 
  function(err, coins) {
    if (err) throw err;
    else res.send({DB: coins});
  });
});

app.listen(port, () => console.log(`Listening on port ${port}`));