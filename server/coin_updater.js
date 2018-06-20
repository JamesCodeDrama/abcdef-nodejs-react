// [START] init zone
var {
    request,
    async
} = require('./express_connector');
var request = require('request');
var async = require('async');
// var Quotes = require('./model/quotes_schema');
var Coin = require('./model/coin_schema');
var CoinMap = require('./model/coin_map_schema');
var timer = 0;
coin_interval_update();
setInterval(function () {
    console.log("Time : [", timer, "](sec.)");
    if (timer == 60) { /* when 1 min. */
        timer = 0;
        coin_interval_update();
    } 
    timer++;
}, 1000 /* 1 sec. */ ); // [END] setInterval
var is_init = false; // if true : will delete coins data when start
// [END] init zone



function newCoin(data, data_to_db_id_temp) {
    var newData = { ...data
    };
    console.log(data_to_db_id_temp)
    newData.id = data_to_db_id_temp;
    newData.ref_id = data.id;
    var coin = new Coin(newData);
    coin.save(function (err) {
        if (err) return console.log(err);
        // saved!
        else {
            console.log('New Coin');
        }
    })
    return newData;
}

function saveCoin(data) {
    Coin.findOneAndUpdate({
        ref_id: data.id
    }, data, {
        upsert: true
    }, function (err, doc) {
        if (err) return res.send(500, {
            error: err
        });
        return console.log("Saved Coin");
        // console.log(data);
        // console.log(data.ref_id, " ", data.last_updated);
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
    CoinMap.findOneAndUpdate({
        ref_id: data.ref_id
    }, data, {
        upsert: true
    }, function (err, doc) {
        if (err) return console.log(err);
        return console.log("Saved CoinMap");
    });
}

function httpGet(url, callback) {
    const options = {
        url: url,
        json: true
    };
    request(options,
        function (err, res, body) {
            callback(err, body);
        }
    );
}

if (is_init) {
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
}

function coinCheck(API_id, data_to_db, api_data, h) {
    CoinMap.find({
        ref_id: API_id
    }, function (err, coinm) {
        if (err) throw err;

        // console.log(API_id);
        let data_to_db_id_temp;
        // object of the user
        if (coinm.length === 0) {
            console.log("not found");
            data_to_db_id_temp = api_data[h].symbol + (h + 100);
            data_to_db[h] = newCoin(data_to_db[h], data_to_db_id_temp);
            newCoinMap({
                id: data_to_db_id_temp,
                ref_id: API_id
            });
        } else {
            console.log("found", API_id);
            saveCoin(data_to_db[h]);
            saveCoinMap({
                id: data_to_db_id_temp,
                ref_id: API_id
            });
        }
    });
}

async function coin_interval_update() {
    console.log("====================================================================================");
    const urls = [
        "https://api.coinmarketcap.com/v2/ticker/?structure=array",
        "https://api.coinmarketcap.com/v2/ticker/?convert=THB&structure=array",
        "https://api.coinmarketcap.com/v2/ticker/?convert=EUR&structure=array",
        "https://api.coinmarketcap.com/v2/ticker/?convert=CNY&structure=array"
    ];
    // [START] Declear variable
    var API_id, api_data,
        quotes = {},
        data_to_db = [],
        h, i, j,
        prices = ["price", "volume_24h", "market_cap"],
        currency = ["USD", "THB", "EUR", "CNY"],
        percent = ["percent_change_1h", "percent_change_24h", "percent_change_7d"],
        prices_ = {},
        percent_change = {};
    // [END] Declear variable
    // [START] Check data
    async.map(urls, httpGet, function (err, body) {
        api_data = body[0].data; //List of Data(API)
        if (err) return console.log(err);
        for (h = 0; h < api_data.length; h++) { //FIRST LOOP (Edit: All of coins)
            for (i = 0; i < currency.length; i++) { //2nd LOOP (Edit: coin_currency & percent in "quotes")
                const   coin = body[i].data[h] ,
                        coin_currency = coin.quotes[currency[i]];
                for (j = 0; j < prices.length; j++) { //3rd LOOP
                    prices_[prices[j]] = coin_currency[prices[j]];
                    if (i === 0) percent_change[percent[j]] = coin_currency[percent[j]];
                } // [END] for j
                quotes["percent_change"] = { ...percent_change
                };
                quotes[currency[i]] = { ...prices_
                };
            } // [END] for i
            api_data[h].last_updated = Date.now();
            data_to_db[h] = { ...api_data[h]
            }; // Create data_to_db
            data_to_db[h].quotes = { ...quotes
            }; // Edit data_to_db #2
            API_id = api_data[h].id; //id From Web
            coinCheck(API_id, data_to_db, api_data, h);
        } // [END] for h
    }); // [END] async.map
    // [END] Check data
}