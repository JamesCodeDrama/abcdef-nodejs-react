const mongoose = require('../mongoose_connector');

var Schema = mongoose.Schema;

var quotesSchema = new Schema({
    price: Number,
    volume_24h: Number,
    market_cap: Number,
    percent_change_1h: Number,
    percent_change_24h: Number,
    percent_change_7d: Number
});

module.exports = mongoose.model('Quotes', quotesSchema);