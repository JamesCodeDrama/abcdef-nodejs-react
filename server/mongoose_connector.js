const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/abcdef')
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error'));
db.on('open', function (callback) {
    console.log('Connected to database.');
});
module.exports = mongoose;