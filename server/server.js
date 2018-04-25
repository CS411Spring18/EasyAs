//server/server.js
var express = require('express');
var router = require('./routes/routes.js')
var path = require('path');
var bodyParser = require('body-parser');
var app = express();
var mongoose = require('mongoose');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../client'));
app.use(express.static(path.join(__dirname, '../client')));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: false}));

// This is a proof of concept database. Will hide the user and pass for our actual one.
mongoose.connect('mongodb://testUser:testPass@ds135983.mlab.com:35983/littlebirdie');

app.use('/', router);

module.exports=app;
