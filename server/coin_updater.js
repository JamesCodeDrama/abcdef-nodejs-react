var {
    request,
    async
} = require('./express_connector');
var request = require('request');
var async = require('async');
// var Quotes = require('./model/quotes_schema');
var Coin = require('./model/coin_schema');
var CoinMap = require('./model/coin_map_schema');

coin_interval_update();
var timer = 0;
setInterval(function () {
    console.log("Time : [", timer, "](sec.)");
    timer++;
}, 1000); // [END] setInterval
setInterval(function () {
    coin_interval_update();
    timer = 0;
}, 60000 /* 1 min. */ ); // [END] setInterval


function newCoin(data, superName) {
    var newData = { ...data
    };
    console.log(superName)
    newData.id = superName;
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
        ref_id: data.ref_id
    }, data, {
        upsert: true
    }, function (err, doc) {
        if (err) return res.send(500, {
            error: err
        });
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
    CoinMap.find({
        ref_id: API_id
    }, function (err, coinm) {
        if (err) throw err;

        console.log(API_id);

        // object of the user
        if (coinm.length === 0) {
            console.log("not found");
            superName = template[h].symbol + (h + 100);
            bigData[h] = newCoin(bigData[h], superName);
            newCoinMap({
                id: superName,
                ref_id: API_id
            });
        } else {
            console.log("found", API_id);
            saveCoin(bigData[h]);
            saveCoinMap({
                id: superName,
                ref_id: API_id
            });
        }
    });
}

function coin_interval_update() {
    console.log("====================================================================================");
    const urls = [
        "https://api.coinmarketcap.com/v2/ticker/?structure=array",
        "https://api.coinmarketcap.com/v2/ticker/?convert=THB&structure=array",
        "https://api.coinmarketcap.com/v2/ticker/?convert=EUR&structure=array",
        "https://api.coinmarketcap.com/v2/ticker/?convert=CNY&structure=array"
    ];
    // [START] Declear variable
    var coins_ID_map = {},
        superName, API_id, template,
        quotes = {},
        bigData = [],
        h, i, j,
        prices = ["price", "volume_24h", "market_cap"],
        country = ["USD", "THB", "EUR", "CNY"],
        percent = ["percent_change_1h", "percent_change_24h", "percent_change_7d"],
        prices_ = {},
        percent_change = {},
        temp_price, temp_percent, temp_ref_id, temp_quotes;
    // [END] Declear variable
    // [START] Check data
    async.map(urls, httpGet, function (err, body) {
        template = body[0].data; //List of Data(API)
        if (err) return console.log(err);
        for (h = 0; h < template.length; h++) { //FIRST LOOP (Edit: All of coins)
            for (i = 0; i < country.length; i++) { //2nd LOOP (Edit: coin_currency & percent in "quotes")
                const coin = body[i].data[h],
                    coin_currency = coin.quotes[country[i]];
                for (j = 0; j < prices.length; j++) { //3rd LOOP
                    prices_[prices[j]] = coin_currency[prices[j]];
                    if (i === 0) percent_change[percent[j]] = coin_currency[percent[j]];
                } // [END] for j
                temp_price = { ...prices_
                };
                temp_percent = { ...percent_change
                };
                quotes["percent_change"] = temp_percent;
                quotes[country[i]] = temp_price;
            } // [END] for i
            bigData[h] = { ...template[h]
            }; //Create bigData
            temp_quotes = { ...quotes
            };
            temp_ref_id = bigData[h].id;
            bigData[h].quotes = temp_quotes; // Edit bigData #2
            superName = template[h].symbol + h; //key
            API_id = template[h].id; //id From Web
            coins_ID_map[superName] = API_id;
            coinCheck(API_id, bigData, template, h);
        } // [END] for h
    }); // [END] async.map
    // [END] Check data
}