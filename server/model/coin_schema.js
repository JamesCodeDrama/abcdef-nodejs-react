const mongoose = require('../mongoose_connector');

var Schema = mongoose.Schema;

var coinSchema = new Schema({
    id: String,
    ref_id: Number,
    name: String,
    symbol: String,
    website_slug: String,
    rank: Number,
    circulating_supply: Number,
    total_supply: Number,
    max_supply: Number,
    quotes: {
        type: Map,
        of: {}
    },
    last_updated: Number
});

module.exports = mongoose.model('Coin', coinSchema);