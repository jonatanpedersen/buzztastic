import { createRequestListener, HttpStatusCodes, all, AsyncReducerFunction } from '@jambon/core';
import { jsonParseRequestBody, jsonStringifyResponseBody, setResponseContentTypeHeaderToApplicationJson } from '@jambon/json';
import { get, post, put, del, host, path } from '@jambon/router';

import { MongoClient } from 'mongodb';
import { createServer } from 'http';
import * as socketIO from 'socket.io';
import * as uuid from 'uuid';
import * as shortid from 'shortid';

const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;

export async function main () {
	try {
		const env = process.env.NODE_ENV;

		const mongodbConnectionString = process.env.MONGODB_URI || 'mongodb://localhost/buzztastic';
		const db = await MongoClient.connect(mongodbConnectionString);
		const quizzes = db.collection('quizzes');

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

			io.emit('quiz.created', { quizId }, { for: 'everyone' });

			return {
				...context,
				response: {
					...context.response,
					body: { quizId },
					statusCode: HttpStatusCodes.CREATED
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

			io.emit('quiz.player.created', { quizId, playerId }, { for: 'everyone' });

			return {
				...context,
				response: {
					...context.response,
					body: { quizId, playerId },
					statusCode: HttpStatusCodes.CREATED
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

		async function updatePlayer (context) {
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

			io.emit('quiz.player.updated', { quizId, playerId }, { for: 'everyone' });

			return {
				...context,
				response: {
					...context.response,
					body: { quizId, playerId }
				}
			};
		}

		async function deletePlayer (context) {
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

			io.emit('quiz.player.deleted', { quizId, playerId }, { for: 'everyone' });

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

			io.emit('quiz.round.created', { quizId, roundId }, { for: 'everyone' });

			return {
				...context,
				response: {
					...context.response,
					body: { quizId, roundId },
					statusCode: HttpStatusCodes.CREATED
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

			io.emit('quiz.round.buzzes.created', { quizId, roundId, buzzId }, { for: 'everyone' });

			return {
				...context,
				response: {
					...context.response,
					body: { quizId, roundId, buzzId },
					statusCode: HttpStatusCodes.CREATED
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

			io.emit('quiz.deleted', { quizId }, { for: 'everyone' });

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

			io.emit('quiz.team.created', { quizId, teamId }, { for: 'everyone' });

			return {
				...context,
				response: {
					...context.response,
					body: { quizId, teamId },
					statusCode: HttpStatusCodes.CREATED
				}
			};
		}

		const server = createServer(
			createRequestListener(
				path('api',
					post(jsonParseRequestBody),
					put(jsonParseRequestBody),
					katch(
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
									put(updatePlayer),
									del(deletePlayer)
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
						)
					),
					setResponseContentTypeHeaderToApplicationJson,
					jsonStringifyResponseBody
				)
			)
		);

		const io = socketIO(server);

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

function katch (...reducers : AsyncReducerFunction[]) {
	return async function katch (context) {
		try {
			return await all(...reducers)(context);
		} catch (err) {
			const { message, stack } = err;

			return {
				...context,
				response: {
					...context.response,
					body: { message, stack },
					statusCode: err.code || 500
				}
			}
		}
	}
}

function debug (context) {
	console.log('context', context);

	return context;
}

function withoutId (document) {
	const {_id, ...rest} = document;

	return rest;
}

function createQuizCode () {
	var code = "";
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

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