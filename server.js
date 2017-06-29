'use strict';

const express = require('express');
const { json } = require('body-parser');
const request = require('request');
const multer = require('multer');
const AWS = require('aws-sdk');

//*******  testing on localhost:3000 *****************************************
// const { getWeatherAPIKey, getAmazonKeys } = require('./creds/creds');
// const weatherAPIKey = process.env.WEATHER_API_KEY || getWeatherAPIKey();
// const AWSaccessKeyId = process.env.AWS_ACCESS_KEY_ID || getAmazonKeys().access_key_id;
// const AWSsecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || getAmazonKeys().secret_access_key;

const weatherAPIKey = process.env.WEATHER_API_KEY;

//Amazon S3 config
const s3 = new AWS.S3();
// localhost:3000
// s3.config.update(
//   {
//     accessKeyId: AWSaccessKeyId,
//     secretAccessKey: AWSsecretAccessKey,
//     subregion: 'us-east-2',
//   });
s3.config.update(
  {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    subregion: 'us-east-2',
  });

// Multer config - memory storage keeps file data in a buffer
const upload = multer({
  storage: multer.memoryStorage(),
  // file size limitation in bytes
  limits: { fileSize: 52428800 },
});


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

app.patch('/api/trail', (req, res, err) => {
	Trails.findOneAndUpdate({_id: req.body._id}, req.body, { upsert: true, new: true})
		.then(data => res.json(data))
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

app.post('/api/post', (req, res, err) => {
	const newPost = req.body;
	Posts.create(newPost)
		.then(data => res.json(data))
		.catch(err)
})

app.delete('/api/closeTicket/:id', (req, res, err) => {
	const id = req.params.id
	Posts.findOneAndRemove({ _id: id})
		.then(data => res.json(data))
		.catch(err)
	})

app.get('/api/weather/current/:latlon', (req, res, err) => {
	const coordinates = req.params.latlon;
	const weatherCallURL = `https://api.wunderground.com/api/${weatherAPIKey}/conditions/q/${coordinates}.json`;
	request.get(weatherCallURL, (err, _, body) => {
    res.send(body);
  });
})

app.get('/api/weather/forecast/:latlon', (req, res, err) => {
	const coordinates = req.params.latlon;
	const weatherCallURL = `https://api.wunderground.com/api/${weatherAPIKey}/forecast/q/${coordinates}.json`;
	request.get(weatherCallURL, (err, _, body) => {
		// console.log("body", body);
    res.send(body);
  });
})

app.get('/api/weather/radar/:latlon', (req, res, err) => {
	const lat = req.params.latlon.split(',')[0];
	const lon = req.params.latlon.split(',')[1];

	const weatherCallURL = `https://api.wunderground.com/api/${weatherAPIKey}/radar/image.gif?centerlat=${lat}&centerlon=${lon}&radius=50&width=300&height=300&newmaps=1`;
	res.send(weatherCallURL);

	// request.get(weatherCallURL, { encoding: null }, (err, _, body) => {
 // 		res.set('Content-Type', 'image/gif');
 // 		const radar ={};
 //    radar.image = body;
 //    res.send(body);

  // });
})

app.post('/api/photoupload/:postType', upload.single('theseNamesMustMatch'), (req, res) => {
	const postType = req.params.postType;
	console.log("postType", postType);
  // req.file is the 'theseNamesMustMatch' file
  // console.log("req.file", req.file);
  const filename = `${postType}/${req.file.originalname}`;
  s3.putObject({
      Bucket: 'johndhammcodes.trailtracker',
      Key: filename,
      Body: req.file.buffer,
      ACL: 'public-read', // your permisions
    }, (err, data) => {
      if (err) return res.status(400).send(err);
      console.log("data", data);
      res.send('File uploaded to S3');
    }
  )
})


connect()
	.then(() => {
		app.listen(PORT, () => {
			console.log(`Mongoose server listening on port: ${PORT}`);
		});
	})
	.catch(console.error)
