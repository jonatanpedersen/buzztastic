import { createRequestListener, HttpStatusCodes, all, AsyncReducerFunction, lazy, HttpContext } from '@jambon/core';
import { jsonParseRequestBody, jsonStringifyResponseBody, setResponseContentTypeHeaderToApplicationJson } from '@jambon/json';
import { get, post, put, del, host, path } from '@jambon/router';
import { connect } from 'amqplib';
import { MongoClient } from 'mongodb';
import { createServer } from 'http';
import * as socketIO from 'socket.io';
import * as uuid from 'uuid';
import * as shortid from 'shortid';
import { dir } from './static';
import { pug } from './pug';
import  * as createDebug from 'debug';

const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;

export async function main () {
	try {
		const debug = createDebug('qubu');
		const mongodbConnectionString = process.env.MONGODB_URI || 'mongodb://localhost/buzztastic';
		const db = await MongoClient.connect(mongodbConnectionString);
		const quizzes = db.collection('quizzes');
		const events = db.collection('events');

		const amqpUrl = process.env.CLOUDAMQP_URL || "amqp://localhost";
		const connection = await connect(amqpUrl);
		const channel = await connection.createChannel();

		interface Event {
			id : string
			type : string,
			data : object
		}

		function createEventId () {
			debug('createEventId');
			return uuid.v4();
		}

		function createEvent (type : string, data : object) {
			debug('createEvent');
			return {
				id: createEventId(),
				type,
				data
			};
		}

		async function storeEvent (event : Event) {
			debug('storeEvent');
			await writeEvent(event);
			await publishEvent(event);
			await emitEvent(event);
		}

		async function writeEvent (event : Event) {
			debug('writeEvent');
			await events.insertOne({...event});
		}

		async function publishEvent (event : Event) {
			debug('publishEvent');
			const { id, type, data } = event;

			const queue = `qubu.events.${event.type}`;
			const message = new Buffer(JSON.stringify(event));

			await channel.assertQueue(queue, {durable: true});
			await channel.sendToQueue(queue, message);
		}

		async function emitEvent (event : Event) {
			debug('emitEvent');
			io.emit(event.type, event, { for: 'everyone' });
		}

		async function subscribe (type, handler) {
			debug('subscribe: %s', type);
			const queue = `qubu.events.${type}`;

			await channel.assertQueue(queue, {durable: true});
			await channel.consume(queue, async message => {
				debug('subscribe.consume');
				if (message !== null) {
					const json = message.content.toString();
					const event = JSON.parse(json);
					await handler(event);
					channel.ack(message);
				}
		  });
		}

		async function getQuizzes (context) {
			return {
				...context,
				response: {
					...context.response,
					body: await quizzes.find({}).toArray()
				}
			}
		}

		async function createQuiz (context) {
			const { name } = context.request.body;

			if (name === null || name === undefined || name === '') {
				throw new BadRequestHttpError('name can not be null, undefined or an empty string');
			}

			const quizId = uuid.v4();
			const code = createQuizCode();
			const created = new Date();

			await quizzes.insert({ quizId, code, name, created });

			await storeEvent(createEvent('quiz.created', { quizId }));

			return {
				...context,
				response: {
					...context.response,
					body: { quizId },
					statusCode: HttpStatusCodes.OK
				}
			};
		}

		async function quizIdOrCode (context) {
			const { quizIdOrCode} = context.router.params;
			const quiz = await quizzes.findOne({ $or: [ { quizId: quizIdOrCode }, { code: quizIdOrCode } ] });

			if (!quiz) {
				throw new NotFoundHttpError('Quiz Not Found');
			}

			return {
				...context,
				locals: {
					...context.locals,
					quiz
				}
			}
		}

		async function createQuizPlayer (context) {
			const { quiz } = context.locals;
			const { quizId } = quiz;
			const { name, teamId } = context.request.body;

			if (name === null || name === undefined || name === '') {
				throw new BadRequestHttpError('name can not be null, undefined or an empty string');
			}

			const playerId = uuid.v4();
			const created = new Date();

			const player = {
				playerId,
				name,
				teamId,
				created
			};

			const updated = new Date();

			await quizzes.updateOne({ quizId }, {
				$push: {
					players: player
				}
			}).then(throwIfNotUpdated);

			await storeEvent(createEvent('quiz.player.created', { quizId, playerId }));

			return {
				...context,
				response: {
					...context.response,
					body: { quizId, playerId },
					statusCode: HttpStatusCodes.OK
				}
			};
		}

		async function playerId (context) {
			const { playerId } = context.router.params;

			if (!UUID.test(playerId)) {
				throw new BadRequestHttpError('playerId is not a uuid');
			}

			return context;
		}

		async function updateQuizPlayer (context) {
			const { quiz } = context.locals;
			const { quizId } = quiz;
			const { playerId } = context.router.params;
			const { name, teamId } = context.request.body;

			if (name === null || name === undefined || name === '') {
				throw new BadRequestHttpError('name can not be null, undefined or an empty string');
			}

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

			await storeEvent(createEvent('quiz.player.updated', { quizId, playerId }));

			return {
				...context,
				response: {
					...context.response,
					body: { quizId, playerId }
				}
			};
		}

		async function deleteQuizPlayer (context) {
			const { quiz } = context.locals;
			const { quizId } = quiz;
			const { playerId } = context.router.params;

			const updated = new Date();

			await quizzes.updateOne(
				{ quizId, 'players.playerId': playerId },
				{
					$pull: { players: { playerId } },
					$set: { updated }
				},
			).then(throwIfNotUpdated);

			await storeEvent(createEvent('quiz.player.deleted', { quizId, playerId }));

			return {
				...context,
				response: {
					...context.response,
					body: { quizId, playerId }
				}
			};
		}

		async function createQuizRound (context) {
			const { quiz } = context.locals;
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

			await storeEvent(createEvent('quiz.round.created', { quizId, roundId }));

			return {
				...context,
				response: {
					...context.response,
					body: { quizId, roundId },
					statusCode: HttpStatusCodes.OK
				}
			};
		}

		async function createQuizRoundBuzz (context) {
			const { quiz } = context.locals;
			const { currentRoundId, rounds, quizId } = quiz;
			const { playerId, teamId } = context.request.body;

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

			await storeEvent(createEvent('quiz.round.buzz.created', { quizId, roundId, buzzId }));

			return {
				...context,
				response: {
					...context.response,
					body: { quizId, roundId, buzzId },
					statusCode: HttpStatusCodes.OK
				}
			};
		}

		async function getQuiz (context) {
			const { quiz } = context.locals;

			return {
				...context,
				response: {
					...context.response,
					body: quiz
				}
			}
		}

		async function deleteQuiz (context) {
			const { quiz } = context.locals;
			const { quizId } = quiz;

			await quizzes.removeOne({ quizId });

			await storeEvent(createEvent('quiz.deleted', { quizId }));

			return {
				...context,
				response: {
					...context.response,
					body: { quizId }
				}
			}
		}

		async function createQuizTeam (context) {
			const { quiz } = context.locals;
			const { quizId } = quiz;
			const { name } = context.request.body;

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

			await storeEvent(createEvent('quiz.team.created', { quizId, teamId }));

			return {
				...context,
				response: {
					...context.response,
					body: { quizId, teamId },
					statusCode: HttpStatusCodes.OK
				}
			};
		}

		const api = all(
			post(jsonParseRequestBody),
			put(jsonParseRequestBody),
			trycatch(
				path('quizzes$',
					get(getQuizzes),
					post(createQuiz),
				),
				path('quizzes',
					path(':quizIdOrCode',
						quizIdOrCode,
						path('players$',
							post(createQuizPlayer)
						),
						path('players/:playerId',
							playerId,
							put(updateQuizPlayer),
							del(deleteQuizPlayer)
						),
						path('teams$',
							post(createQuizTeam)
						),
						path('rounds$',
							post(createQuizRound)
						),
						path('rounds/current/buzzes',
							post(createQuizRoundBuzz)
						)
					),
					path(':quizIdOrCode$',
						get(getQuiz),
						del(deleteQuiz)
					)
				),
				log,
				def(setStatusCode(400))
			),
			setResponseContentTypeHeaderToApplicationJson,
			jsonStringifyResponseBody
		);

		const app = [
			dir('app'),
			def(pug('./app/index.pug'))
		];
		const www = [
			dir('www'),
			def(pug('./www/index.pug'))
		];

		const server = createServer(
			createRequestListener(
				trycatch(
					env('production',
						host('api.qubu.io', api),
						host('app.qubu.io', ...app),
						host('qubu.io', ...www)
					),
					env(undefined,
						path('api', api),
						path('app', ...app),
						path('www', ...www)
					)
				),
				def(setStatusCode(404))
			)
		);

		const io = socketIO(server);

		const port = process.env.PORT || 1432;

		server.listen(port, async () => {
			console.info(`Listening on port ${port}`);

			await subscribe('quiz.created', handleEvent);
			await subscribe('quiz.deleted', handleEvent);
			await subscribe('quiz.team.created', handleEvent);
			await subscribe('quiz.player.created', handleEvent);
			await subscribe('quiz.player.updated', handleEvent);
			await subscribe('quiz.player.deleted', handleEvent);
			await subscribe('quiz.round.created', handleEvent);
			await subscribe('quiz.round.buzz.created', handleEvent);

			function handleEvent (event : Event) {
				debug('event: %O', event);
			}
		});
	}

	catch (err) {
		console.error(err, err.stack);

		process.exit(1);
	}
}

function env (name : string, ...reducers : AsyncReducerFunction[]) : AsyncReducerFunction {
	return async function env (context) {
		if (process.env.NODE_ENV !== name) {
			return context;
		}

		return all(...reducers)(context);
	}
}

async function log (context) {
	console.log(context);

	return context;
}

function setStatusCode (statusCode) : AsyncReducerFunction {
	return async function setStatusCode (context) {
		return {
			...context,
			response: {
				...context.response,
				statusCode: statusCode
			}
		}
	}
}

function def (...reducers : AsyncReducerFunction[]) : AsyncReducerFunction {
	return async function def (context) {
		if (context.response !== undefined) {
			return context;
		}

		return all(...reducers)(context);
	}
}

async function emptyResponse (context) {
	return  {
		...context,
		response: {}
	}
}

function trycatch (...reducers : AsyncReducerFunction[]) : AsyncReducerFunction {
	return async function trycatch (context) {
		try {
			return await all(...reducers)(context);
		} catch (err) {
			const { message, stack } = err;

			return {
				...context,
				response: {
					...context.response,
					headers: {
						...(context.response || {}) .headers,
						'Content-Type': 'text/html'
					},
					body: new Buffer(JSON.stringify({message, stack})),
					statusCode: err.code || 500
				}
			}
		}
	}
}

function createQuizCode () {
	var code = '';
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

	for (let i = 0; i < 6; i++) {
		code += chars.charAt(Math.floor(Math.random() * chars.length));
	}

	return code;
}

class HttpError extends Error {
	code : number

	constructor (code : number, message) {
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

async function throwIfNotUpdated (doc) {
	if (doc.modifiedCount === 0) {
		throw new BadRequestHttpError('Not Updated');
	}
}
