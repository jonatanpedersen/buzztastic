"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@jambon/core");
const json_1 = require("@jambon/json");
const router_1 = require("@jambon/router");
const amqplib_1 = require("amqplib");
const mongodb_1 = require("mongodb");
const http_1 = require("http");
const socketIO = require("socket.io");
const uuid = require("uuid");
const static_1 = require("./static");
const pug_1 = require("./pug");
const createDebug = require("debug");
const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
async function main() {
    try {
        const debug = createDebug('qubu');
        const mongodbConnectionString = process.env.MONGODB_URI || 'mongodb://localhost/buzztastic';
        const db = await mongodb_1.MongoClient.connect(mongodbConnectionString);
        const quizzes = db.collection('quizzes');
        const events = db.collection('events');
        const amqpUrl = process.env.CLOUDAMQP_URL || "amqp://localhost";
        const connection = await amqplib_1.connect(amqpUrl);
        const channel = await connection.createChannel();
        function createEventId() {
            debug('createEventId');
            return uuid.v4();
        }
        function createEvent(type, data) {
            debug('createEvent');
            return {
                id: createEventId(),
                type,
                data
            };
        }
        async function storeEvent(event) {
            debug('storeEvent');
            await writeEvent(event);
            await publishEvent(event);
            await emitEvent(event);
        }
        async function writeEvent(event) {
            debug('writeEvent');
            await events.insertOne({ ...event });
        }
        async function publishEvent(event) {
            debug('publishEvent');
            const { id, type, data } = event;
            const queue = `qubu.events.${event.type}`;
            const message = new Buffer(JSON.stringify(event));
            await channel.assertQueue(queue, { durable: true });
            await channel.sendToQueue(queue, message);
        }
        async function emitEvent(event) {
            debug('emitEvent');
            io.emit(event.type, event, { for: 'everyone' });
        }
        async function subscribe(type, handler) {
            debug('subscribe: %s', type);
            const queue = `qubu.events.${type}`;
            await channel.assertQueue(queue, { durable: true });
            await channel.consume(queue, async (message) => {
                debug('subscribe.consume');
                if (message !== null) {
                    const json = message.content.toString();
                    const event = JSON.parse(json);
                    await handler(event);
                    channel.ack(message);
                }
            });
        }
        async function getQuizzes(context) {
            return {
                ...context,
                response: {
                    ...context.response,
                    body: await quizzes.find({}).toArray()
                }
            };
        }
        async function createQuiz(context) {
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
                    statusCode: core_1.HttpStatusCodes.OK
                }
            };
        }
        async function quizIdOrCode(context) {
            const { quizIdOrCode } = context.router.params;
            const quiz = await quizzes.findOne({ $or: [{ quizId: quizIdOrCode }, { code: quizIdOrCode }] });
            if (!quiz) {
                throw new NotFoundHttpError('Quiz Not Found');
            }
            return {
                ...context,
                locals: {
                    ...context.locals,
                    quiz
                }
            };
        }
        async function createQuizPlayer(context) {
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
                    statusCode: core_1.HttpStatusCodes.OK
                }
            };
        }
        async function playerId(context) {
            const { playerId } = context.router.params;
            if (!UUID.test(playerId)) {
                throw new BadRequestHttpError('playerId is not a uuid');
            }
            return context;
        }
        async function updateQuizPlayer(context) {
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
            await quizzes.updateOne({ quizId, 'players.playerId': playerId }, { $set: {
                    'players.$.name': name,
                    'players.$.teamId': teamId,
                    'players.$.updated': updated,
                    updated,
                } }).then(throwIfNotUpdated);
            await storeEvent(createEvent('quiz.player.updated', { quizId, playerId }));
            return {
                ...context,
                response: {
                    ...context.response,
                    body: { quizId, playerId }
                }
            };
        }
        async function deleteQuizPlayer(context) {
            const { quiz } = context.locals;
            const { quizId } = quiz;
            const { playerId } = context.router.params;
            const updated = new Date();
            await quizzes.updateOne({ quizId, 'players.playerId': playerId }, {
                $pull: { players: { playerId } },
                $set: { updated }
            }).then(throwIfNotUpdated);
            await storeEvent(createEvent('quiz.player.deleted', { quizId, playerId }));
            return {
                ...context,
                response: {
                    ...context.response,
                    body: { quizId, playerId }
                }
            };
        }
        async function createQuizRound(context) {
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
                    statusCode: core_1.HttpStatusCodes.OK
                }
            };
        }
        async function createQuizRoundBuzz(context) {
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
                    statusCode: core_1.HttpStatusCodes.OK
                }
            };
        }
        async function getQuiz(context) {
            const { quiz } = context.locals;
            return {
                ...context,
                response: {
                    ...context.response,
                    body: quiz
                }
            };
        }
        async function deleteQuiz(context) {
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
            };
        }
        async function createQuizTeam(context) {
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
                    statusCode: core_1.HttpStatusCodes.OK
                }
            };
        }
        const api = core_1.all(router_1.post(json_1.jsonParseRequestBody), router_1.put(json_1.jsonParseRequestBody), trycatch(router_1.path('quizzes$', router_1.get(getQuizzes), router_1.post(createQuiz)), router_1.path('quizzes', router_1.path(':quizIdOrCode', quizIdOrCode, router_1.path('players$', router_1.post(createQuizPlayer)), router_1.path('players/:playerId', playerId, router_1.put(updateQuizPlayer), router_1.del(deleteQuizPlayer)), router_1.path('teams$', router_1.post(createQuizTeam)), router_1.path('rounds$', router_1.post(createQuizRound)), router_1.path('rounds/current/buzzes', router_1.post(createQuizRoundBuzz))), router_1.path(':quizIdOrCode$', router_1.get(getQuiz), router_1.del(deleteQuiz))), log, def(setStatusCode(400))), json_1.setResponseContentTypeHeaderToApplicationJson, json_1.jsonStringifyResponseBody);
        const app = [
            static_1.dir('app'),
            def(pug_1.pug('./app/index.pug'))
        ];
        const www = [
            static_1.dir('www'),
            def(pug_1.pug('./www/index.pug'))
        ];
        const server = http_1.createServer(core_1.createRequestListener(trycatch(env('production', router_1.host('api.qubu.io', api), router_1.host('app.qubu.io', ...app), router_1.host('qubu.io', ...www)), env(undefined, router_1.path('api', api), router_1.path('app', ...app), router_1.path('www', ...www))), def(setStatusCode(404))));
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
            function handleEvent(event) {
                debug('event: %O', event);
            }
        });
    }
    catch (err) {
        console.error(err, err.stack);
        process.exit(1);
    }
}
exports.main = main;
function env(name, ...reducers) {
    return async function env(context) {
        if (process.env.NODE_ENV !== name) {
            return context;
        }
        return core_1.all(...reducers)(context);
    };
}
async function log(context) {
    console.log(context);
    return context;
}
function setStatusCode(statusCode) {
    return async function setStatusCode(context) {
        return {
            ...context,
            response: {
                ...context.response,
                statusCode: statusCode
            }
        };
    };
}
function def(...reducers) {
    return async function def(context) {
        if (context.response !== undefined) {
            return context;
        }
        return core_1.all(...reducers)(context);
    };
}
async function emptyResponse(context) {
    return {
        ...context,
        response: {}
    };
}
function trycatch(...reducers) {
    return async function trycatch(context) {
        try {
            return await core_1.all(...reducers)(context);
        }
        catch (err) {
            const { message, stack } = err;
            return {
                ...context,
                response: {
                    ...context.response,
                    headers: {
                        ...(context.response || {}).headers,
                        'Content-Type': 'text/html'
                    },
                    body: new Buffer(JSON.stringify({ message, stack })),
                    statusCode: err.code || 500
                }
            };
        }
    };
}
function createQuizCode() {
    var code = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}
class HttpError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
    }
}
class NotFoundHttpError extends HttpError {
    constructor(message) {
        super(404, message);
    }
}
class BadRequestHttpError extends HttpError {
    constructor(message) {
        super(400, message);
    }
}
async function throwIfNotUpdated(doc) {
    if (doc.modifiedCount === 0) {
        throw new BadRequestHttpError('Not Updated');
    }
}
//# sourceMappingURL=main.js.map