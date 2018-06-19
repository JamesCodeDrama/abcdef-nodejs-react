const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
app.set('json spaces', 2);
module.exports = {app, port};