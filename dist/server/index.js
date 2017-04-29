'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');

//  Setting up the express app
var app = express();
var PORT = 80;

//  Static directory
app.use(express.static(path.join(__dirname + '/../client')));

//  Handle data parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));

/*** Routing ***/

//  Todo

//  Start server
app.listen(PORT, function () {
	console.log('App listening on port: ' + PORT);
});