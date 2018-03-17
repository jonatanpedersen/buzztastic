import express from 'express';
import mongodb from 'mongodb';
import util from 'util';
import bodyParser from 'body-parser';
import http from 'http';
import socketIo from 'socket.io';
import uuid from 'uuid';
import compression from 'compression';
import shortid from 'shortid';
import { assertNotNullOrUndefineds, assertNotEmptyStrings } from './assert';
import vhost from 'vhost';

const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;

export async function main () {
	try {
		const env = process.env.NODE_ENV;

		const mongodbConnectionString = process.env.MONGODB_URI || 'mongodb://localhost/buzztastic';
		const db = await mongodb.MongoClient.connect(mongodbConnectionString);
		const quizzes = db.collection('quizzes');

		const router = express();
		router.use(compression());

		router.use(bodyParser.json());

		const server = http.Server(router);
		const io = socketIo(server);

		const api = express.Router();

		api.get('/quizzes', util.callbackify(async (req, res) => {
			res.json(await quizzes.find({}).toArray());
		}));

		api.post('/quizzes', util.callbackify(async (req, res) => {
			const { name } = req.body;

			const quizId = uuid.v4();
			const code = createQuizCode();
			const created = new Date();

			const quiz = {
				quizId,
				code,
				created
			};

			await quizzes.insert(quiz);

			io.emit('quiz.created', { quizId }, { for: 'everyone' });

			res.json({ quizId });
		}));

		api.param('quizIdOrCode', async (req, res, next, quizIdOrCode) => {
			try {
				res.locals.quiz = await quizzes.findOne({ $or: [ { quizId: quizIdOrCode }, { code: quizIdOrCode } ] });

				if (!res.locals.quiz) {
					throw new NotFoundHttpError('Quiz Not Found');
				}

				next();
			} catch(err) {
				next(err);
			}
		});

		api.param('teamId', (req, res, next, teamId) => {
			if (!UUID.test(teamId)) {
				return next(BadRequestHttpError('teamId is not a uuid'));
			}

			next();
		});

		api.param('playerId', (req, res, next, playerId) => {
			if (!UUID.test(playerId)) {
				return next(new BadRequestHttpError('playerId is not a uuid'));
			}

			next();
		});

		api.post('/quizzes/:quizIdOrCode/players', util.callbackify(async (req, res, next) => {
			const { quiz } = res.locals;
			const { quizId } = quiz;
			const { name, } = req.body;

			const playerId = uuid.v4();
			const created = new Date();

			const player = {
				playerId,
				name,
				created
			};

			const updated = new Date();

			await quizzes.updateOne({ quizId }, {
				$push: {
					players: player
				}
			}).then(throwIfNotUpdated);

			io.emit('quiz.player.created', { quizId, playerId }, { for: 'everyone' });

			res.json({ quizId, playerId });
		}));

		api.put('/quizzes/:quizIdOrCode/players/:playerId', util.callbackify(async (req, res, next) => {
			const { quiz } = res.locals;
			const { quizId } = quiz;
			const { playerId } = req.params;
			const { name, teamId } = req.body;

			if (!UUID.test(teamId)) {
				throw new BadRequestHttpError('teamId is not a uuid');
			}

			const updated = new Date();

			await quizzes.updateOne(
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

		api.delete('/quizzes/:quizIdOrCode/players/:playerId', util.callbackify(async (req, res, next) => {
			const { quiz } = res.locals;
			const { quizId } = quiz;
			const { playerId } = req.params;

			const updated = new Date();

			await quizzes.updateOne(
				{ quizId, 'players.playerId': playerId },
				{
					$pull: { players: { playerId } },
					$set: { updated }
				},
			).then(throwIfNotUpdated);

			io.emit('quiz.player.deleted', { quizId, playerId }, { for: 'everyone' });

			res.json({ quizId, playerId });
		}));

		api.post('/quizzes/:quizIdOrCode/teams', util.callbackify(async (req, res, next) => {
			const { quiz } = res.locals;
			const { quizId } = quiz;
			const { name } = req.body;

			const teamId = uuid.v4();
			const created = new Date();

			const team = {
				teamId,
				name,
				created
			};

			await quizzes.updateOne({ quizId }, {
				$push: { teams: team }
			}).then(throwIfNotUpdated);

			io.emit('quiz.team.created', { quizId, teamId }, { for: 'everyone' });

			res.json({ quizId, teamId });
		}));

		api.post('/quizzes/:quizIdOrCode/rounds', util.callbackify(async (req, res, next) => {
			const { quiz } = res.locals;
			const { quizId } = quiz;

			const roundId = uuid.v4();
			const created = new Date();

			const round = {
				roundId,
				created
			};

			await quizzes.updateOne({ quizId }, {
				$push: {
					rounds: round
				},
				$set: { currentRoundId: roundId }
			}).then(throwIfNotUpdated);

			io.emit('quiz.round.created', { quizId, roundId }, { for: 'everyone' });

			res.json({ quizId, roundId });
		}));

		api.post('/quizzes/:quizIdOrCode/rounds/current/buzzes', util.callbackify(async (req, res, next) => {
			const { quiz } = res.locals;
			const { currentRoundId, rounds, quizId } = quiz;
			const { playerId, teamId } = req.body;

			if (!UUID.test(playerId)) {
				throw new BadRequestHttpError('playerId is not a uuid');
			}

			const buzzId = uuid.v4();
			const roundId = currentRoundId;
			const roundIndex = rounds.findIndex(round => round.roundId === roundId);
			const created = new Date();

			const query = {
				quizId,
				teams: {
					$elemMatch: {
						teamId
					}
				},
				players: {
					$elemMatch: {
						playerId,
						teamId
					}
				},
				[`rounds.${roundIndex}.buzzes`]: {
					$not: {
						$elemMatch: {
							playerId
						}
					}
				}
			};

			const update = {
				$addToSet: {
					[`rounds.${roundIndex}.buzzes`]: {
						buzzId,
						playerId,
						teamId,
						created
					}
				}
			};

			await quizzes.updateOne(query, update).then(throwIfNotUpdated);

			io.emit('quiz.round.buzzes.created', { quizId, roundId, buzzId }, { for: 'everyone' });

			res.json({ quizId, roundId, buzzId });
		}));

		api.get('/quizzes/:quizIdOrCode', util.callbackify(async (req, res, next) => {
			const { quiz } = res.locals;
			const { quizId } = quiz;

			res.json(quiz);
		}));

		api.delete('/quizzes/:quizIdOrCode', util.callbackify(async (req, res, next) => {
			const { quiz } = res.locals;
			const { quizId } = quiz;

			await quizzes.removeOne({ quizId });

			io.emit('quiz.deleted', { quizId }, { for: 'everyone' });

			res.json({ quizId });
		}));

		const app = express.Router();
		app.use(express.static('app'));

		const www = express.Router();
		www.use(express.static('www'));

		if (env === 'production') {
			const apiHost = vhost('api.qubu.io', api);
			router.use(apiHost);

			const appHost = vhost('app.qubu.io', app);
			router.use(appHost);

			const wwwHost = vhost('qubu.io', www);
			router.use(wwwHost);
		} else {
			router.use('/api', api);
			router.use('/app', app);
			router.use('/www', www);
		}

		router.use((err, req, res, next) => {
			console.error(err);

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
	constructor (code, message) {
		super(message);
		this.code = code;
	}
}

class NotFoundHttpError extends HttpError {
	constructor (message) {
		super(404, message);
	}
}

class BadRequestHttpError extends HttpError {
	constructor (message) {
		super(400, message);
	}
}

function createQuizCode () {
	var code = "";
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

	for (let i = 0; i < 6; i++) {
		code += chars.charAt(Math.floor(Math.random() * chars.length));
	}

	return code;
}
