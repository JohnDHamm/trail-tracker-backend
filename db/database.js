'use strict';

const mongoose = require('mongoose');

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/trailtracker'
const PORT = process.env.PORT || 3000

// const MONGODB_URL = 'mongodb://<dbuser>:<password>@ds047666.mlab.com:47666/miniauth'

mongoose.Promise = Promise

module.exports.connect = () => mongoose.connect(MONGODB_URL)
module.exports.disconnect = () => mongoose.disconnect()

module.exports.trails = () => mongoose.model('trail', {
	name: String,
	location: String,
	description: String,
	latitude: Number,
	longitude: Number,
	mapZoom: Number,
	numOpenTickets: Number,
	imgUrl: String
})
