import express from 'express';
import mongodb from 'mongodb';
import util from 'util';
import bodyParser from 'body-parser';
import http from 'http';
import socketIo from 'socket.io';
import uuid from 'uuid';
import compression from 'compression';

async function main () {
	try {
		const mongodbConnectionString = process.env.MONGODB_URI || 'mongodb://localhost/buzztastic';
		const db = await mongodb.MongoClient.connect(mongodbConnectionString);
		const buttons = db.collection('buttons');
		const rounds = db.collection('rounds');

		const app = express();
		app.use(compression());
		app.use(express.static('public'));
		app.use(bodyParser.json());

		const server = http.Server(app);
		const io = socketIo(server);

		app.get('/api/rounds/current', util.callbackify(async (req, res) => {
			const round = await rounds.find({}).sort({timestamp: -1 }).limit(1).toArray().then(rounds => rounds.shift());

			res.json(round);
		}));

		app.post('/api/rounds', util.callbackify(async (req, res) => {
			const roundId = uuid.v4();
			const timestamp = new Date();
			const round = {roundId, timestamp, presses: []};

			await rounds.insert(round);

			io.emit('round-created', {roundId}, { for: 'everyone' });

			res.json({roundId});
		}));

		app.post('/api/rounds/current/buttons/:buttonId/presses', util.callbackify(async (req, res) => {
			const {buttonId} = req.params;
			const timestamp = new Date();

			const round = await rounds.find({}).sort({timestamp: -1 }).limit(1).toArray().then(rounds => rounds.shift());
			const {roundId} = round;

			await rounds.updateOne({roundId}, {
				$push: {
					presses: {
						buttonId,
						timestamp
					}
				}
			});

			io.emit('button-pressed', {buttonId, timestamp}, { for: 'everyone' });

			res.status(204).end();
		}));

		app.get('/api/buttons', util.callbackify(async (req, res) => {
			const _buttons = await buttons.find({}, {_id: 0, buttonId: 1, name: 1}).toArray();

			res.json(_buttons);
		}));

		app.post('/api/buttons', util.callbackify(async (req, res) => {
			const buttonId = v4();
			const {name} = req.body;
			const button = {buttonId, name, presses: []};

			await buttons.insert(button);

			io.emit('button-added', {buttonId, name}, { for: 'everyone' });

			res.json({buttonId, name});
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