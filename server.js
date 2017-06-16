'use strict';

const express = require('express');
const { json } = require('body-parser');
const request = require('request');

//*******  testing on localhost:3000 *****************************************
// const { getWeatherAPIKey } = require('./creds/creds');
// const weatherAPIKey = process.env.WEATHER_API_KEY || getWeatherAPIKey();
// console.log("weatherAPIKey", weatherAPIKey);

const weatherAPIKey = process.env.WEATHER_API_KEY;

const app = express();

const { connect, trails, posts } = require('./db/database');

const PORT = process.env.PORT || 3000;
app.set('port', PORT);



//middlewares
app.use(express.static('client'));
app.use(json());
// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

// API

const Trails = trails();
const Posts = posts();

app.get('/api/trails', (req, res, err) => {
	Trails.find()
		.then(trails => {
			res.json( trails );
		})
		.catch(err)
})

app.get('/api/posts/:id', (req, res, err) => {
	const trailId = req.params.id;
	Posts.find( { postTrailId: trailId })
		.sort( { postDate: -1 } )
		.then(posts => {
			res.json( posts );
		})
		.catch(err)
})

app.get('/api/weather/current/:latlon', (req, res, err) => {
	const coordinates = req.params.latlon;
	// console.log("coordinates", coordinates);
	const weatherCallURL = `https://api.wunderground.com/api/${weatherAPIKey}/conditions/q/${coordinates}.json`;
	request.get(weatherCallURL, (err, _, body) => {
    res.send(body);
  });
})

// app.get('/api/weather/radar/:latlon', (req, res, err) => {
// 	const coordinates = req.params.latlon;
// 	console.log("coordinates", coordinates);
// 	const weatherCallURL = `https://api.wunderground.com/api/${weatherAPIKey}/conditions/q/${coordinates}.json`;
// 	request.get(weatherCallURL, (err, _, body) => {
//     res.send(body);
//   });
// })

// app.post('/api/tasks', (req, res, err) => {
// 	const newTask = req.body;
// 	Tasks.create(newTask)
// 		.then(data => res.json(data))
// 		.catch(err)
// })

// app.delete('/api/tasks/:id', (req, res, err) => {
// 	const id = req.params.id
// 	Tasks.findOneAndRemove({ _id: id})
// 		.then(data => res.json(data))
// 		.catch(err)
// })

// app.put('/api/tasks', (req, res, err) => {
// 	Tasks.findOneAndUpdate({_id: req.body._id}, req.body, { upsert: true, new: true})
// 		.then(data => res.json(data))
// 		.catch(err)
// })


connect()
	.then(() => {
		app.listen(PORT, () => {
			console.log(`Mongoose server listening on port: ${PORT}`);
		});
	})
	.catch(console.error)
