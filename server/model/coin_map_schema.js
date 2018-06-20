const mongoose = require('../mongoose_connector');

var Schema = mongoose.Schema;

var CoinMapSchema = new Schema({
    id: String,
    ref_id: Number
})

module.exports = mongoose.model('CoinMap', CoinMapSchema);