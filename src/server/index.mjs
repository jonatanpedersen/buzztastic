import express from 'express';
import mongodb from 'mongodb';
import util from 'util';
import bodyParser from 'body-parser';
import http from 'http';
import socketIo from 'socket.io';
import uuid from 'uuid';
import compression from 'compression';
import shortid from 'shortid';

async function main () {
	try {
		const mongodbConnectionString = process.env.MONGODB_URI || 'mongodb://localhost/buzztastic';
		const db = await mongodb.MongoClient.connect(mongodbConnectionString);
		const quizes = db.collection('quizes');

		const app = express();
		app.use(compression());
		app.use(express.static('public'));
		app.use(bodyParser.json());

		const server = http.Server(app);
		const io = socketIo(server);

		app.post('/api/quizes', util.callbackify(async (req, res) => {
			const { name } = req.body;

			const quizId = uuid.v4();
			const code = shortid();
			const created = new Date();

			const quiz = {
				quizId,
				code,
				created
			};

			await quizes.insert(quiz);

			io.emit('quiz.created', { quizId }, { for: 'everyone' });

			res.json({ quizId });
		}));

		app.param('quizId', async (req, res, next, quizId) => {
			try {
				res.locals.quiz = await quizes.findOne({quizId});
				next();
			} catch(err) {
				next(err);
			}
		});

		app.post('/api/quizes/:quizId/players', util.callbackify(async (req, res) => {
			const { quizId } = req.params;
			const { name, teamId } = req.body;

			const playerId = uuid.v4();
			const created = new Date();

			const player = {
				playerId,
				name,
				teamId,
				created
			};

			const updated = new Date();

			await quizes.updateOne({ quizId }, {
				$push: {
					players: player
				}
			}).then(throwIfNotUpdated);

			io.emit('quiz.player.created', { quizId, playerId }, { for: 'everyone' });

			res.json({ quizId, playerId });
		}));

		app.put('/api/quizes/:quizId/players/:playerId', util.callbackify(async (req, res) => {
			const { quizId, playerId } = req.params;
			const { name, teamId } = req.body;

			const updated = new Date();

			const player = {
				playerId,
				name,
				teamId,
				updated
			};

			await quizes.updateOne(
				{ quizId, 'players.playerId': playerId },
				{ $set: { 
						'players.$.name' : name,
						'players.$.teamId' : teamId,
						'players.$.updated' : updated,
						updated,
				} }
			).then(throwIfNotUpdated);

			io.emit('quiz.player.updated', { quizId, playerId }, { for: 'everyone' });

			res.json({ quizId, playerId });
		}));

		app.delete('/api/quizes/:quizId/players/:playerId', util.callbackify(async (req, res) => {
			const { quizId, playerId } = req.params;

			const updated = new Date();

			await quizes.updateOne(
				{ quizId, 'players.playerId': playerId },
				{ 
					$pull: { players: { playerId } },
					$set: { updated } 
				},
			).then(throwIfNotUpdated);

			io.emit('quiz.player.deleted', { quizId, playerId }, { for: 'everyone' });

			res.json({ quizId, playerId });
		}));

		app.post('/api/quizes/:quizId/teams', util.callbackify(async (req, res) => {
			const { quizId } = req.params;
			const { name } = req.body;

			const teamId = uuid.v4();
			const created = new Date();

			const team = {
				teamId,
				name,
				created
			};

			await quizes.updateOne({ quizId }, {
				$push: { teams: team }
			}).then(throwIfNotUpdated);

			io.emit('quiz.team.created', { quizId, teamId }, { for: 'everyone' });

			res.json({ quizId, teamId });
		}));

		app.post('/api/quizes/:quizId/rounds', util.callbackify(async (req, res) => {
			const { quizId } = req.params;

			const roundId = uuid.v4();
			const created = new Date();

			const round = {
				roundId,
				created
			};

			await quizes.updateOne({ quizId }, {
				$push: {
					rounds: round
				},
				$set: { currentRoundId: roundId }
			}).then(throwIfNotUpdated);

			io.emit('quiz.round.created', { quizId, roundId }, { for: 'everyone' });

			res.json({ quizId, roundId });
		}));

		app.post('/api/quizes/:quizId/rounds/current/buzzes', util.callbackify(async (req, res) => {
			const { quiz } = res.locals;
			const { currentRoundId } = quiz;
			const { quizId } = req.params;
			const { playerId, teamId } = req.body;

			const buzzId = uuid.v4();
			const roundId = currentRoundId
			const created = new Date();

			const buzz = {
				buzzId,
				playerId,
				teamId,
				created
			};

			await quizes.updateOne(
				{ quizId, 'rounds.roundId': roundId, 'teams.teamId': teamId, 'players.playerId': playerId, 'rounds.buzzes.playerId': { $ne: playerId } },
				{ $addToSet: { 'rounds.$.buzzes': buzz } }
			).then(throwIfNotUpdated);

			io.emit('quiz.round.buzzes.created', { quizId, roundId, buzzId }, { for: 'everyone' });

			res.json({ quizId, roundId, buzzId });
		}));

		app.get('/api/quizes/:quizId', util.callbackify(async (req, res) => {
			const { quizId } = req.params;
			const quiz = await quizes.findOne({ quizId });

			res.json(quiz);
		}));

		app.delete('/api/quizes/:quizId', util.callbackify(async (req, res) => {
			const { quizId } = req.params;

			await quizes.removeOne({ quizId });

			io.emit('quiz.deleted', { quizId }, { for: 'everyone' });

			res.json({ quizId });
		}));

		app.use((err, req, res, next) => {
			res.status(err.code || 500).end();
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

async function throwIfNotUpdated (doc) {
	if (doc.modifiedCount === 0) {
		throw new BadRequestHttpError();
	}
}

class HttpError extends Error {
	constructor (code) {
		super();
		this.code = code;
	}
}

class BadRequestHttpError extends HttpError {
	constructor (code) {
		super(400);
	}	
}



main();