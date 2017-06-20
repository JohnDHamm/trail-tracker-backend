'use strict';

const mongoose = require('mongoose');

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/trailtracker'
const PORT = process.env.PORT || 3000

// const MONGODB_URL ='mongodb://<dbuser>:<password>@ds127892.mlab.com:27892/trailtracker'

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

module.exports.posts = () => mongoose.model('post', {
	description: String,
	hasPhoto: Boolean,
	photoUrl: String,
	postDate: String,
	postFormatDate: String,
	postTrailId: String,
	postType: Number,
	postTypeString: String,
	ticketopen: Boolean,
	userId: String,
	userName: String,
	userImgUrl: String
})
