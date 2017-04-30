const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')

//  Setting up the express app
const app = express()
const PORT = 80

//  Static directory
app.use(express.static(path.join(__dirname + '/../client')))

//  Handle data parsing
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.text())
app.use(bodyParser.json({ type: "application/vnd.api+json" }))

/*** Routing ***/
// Rates API
require('./routes/api/rates')(app)

//  Todo

//  Start server
app.listen(PORT, () => {
	console.log(`App listening on port: ${PORT}`)
})