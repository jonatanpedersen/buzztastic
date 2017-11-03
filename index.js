const express = require('express');
const {MongoClient} = require('mongodb');
const {callbackify} = require('util');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const {v4} = require('uuid');

async function main () {
	try {
		const mongodbConnectionString = process.env.MONGODB_URI || 'mongodb://localhost/buzztastic';
		const db = await MongoClient.connect(mongodbConnectionString);
		const buttons = db.collection('buttons');

		const app = express();
		app.use(express.static('public'));
		app.set('view engine', 'pug');
		app.use(bodyParser.json());

		const server = http.Server(app);
		const io = socketIo(server);

		app.get('/', callbackify(async (req, res) => {
			res.render('index');
		}));

		app.get('/api/buttons', callbackify(async (req, res) => {
			const _buttons = await buttons.find({}, {_id: 0, buttonId: 1, name: 1}).toArray();

			res.json(_buttons);
		}));

		app.post('/api/buttons', callbackify(async (req, res) => {
			const buttonId = v4();
			const {name} = req.body;
			const button = {buttonId, name, presses: []};

			await buttons.insert(button);

			io.emit('button-added', {buttonId, name}, { for: 'everyone' });

			res.json({buttonId, name});
		}));

		app.post('/api/buttons/:buttonId/presses', callbackify(async (req, res) => {
			const {buttonId} = req.params;
			const timestamp = new Date();

			await buttons.updateOne({buttonId}, {
				$push: {
					presses: {
						timestamp
					}
				}
			});

			io.emit('button-pressed', {buttonId, timestamp}, { for: 'everyone' });

			res.status(204).end();
		}));

		app.use((err, req, res, next) => {
			res.status(500).json({err: err.message});
		})

		const port = process.env.PORT || 1432;

		server.listen(port, () => {
			console.info(`Listening on port ${port}`);
		});
	}
	catch (err) {
		console.error(err, err.stack);

		process.exit(1);
	}
}

main();