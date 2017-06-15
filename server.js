'use strict';

const express = require('express');
const { json } = require('body-parser');

const app = express();

const { connect, trails } = require('./db/database');

const PORT = process.env.PORT || 3000;
app.set('port', PORT);



//middlewares
app.use(express.static('client'));
app.use(json());


// API

const Trails = trails();

app.get('/api/trails', (req, res, err) => {
	Trails.find()
		.then(trails => res.json( { trails } ))
		.catch(err)
})

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
