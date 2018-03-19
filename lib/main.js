"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@jambon/core");
const json_1 = require("@jambon/json");
const router_1 = require("@jambon/router");
const mongodb_1 = require("mongodb");
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
async function main() {
    try {
        const env = process.env.NODE_ENV;
        const mongodbConnectionString = process.env.MONGODB_URI || 'mongodb://localhost/buzztastic';
        const db = await mongodb_1.default.MongoClient.connect(mongodbConnectionString);
        const quizzes = db.collection('quizzes');
        const api = [
            router_1.path('api', router_1.path('quizzes', router_1.get(async (context) => {
                return {
                    ...context,
                    response: {
                        ...context.response,
                        body: await quizzes.find({}).toArray().map(withoutId)
                    }
                };
            })))
        ];
        const server = http_1.createServer(core_1.createRequestListener(...api, json_1.setResponseContentTypeHeaderToApplicationJson, json_1.jsonStringifyResponseBody));
        const io = socket_io_1.default(server);
    }
    catch (err) {
        console.error(err);
    }
}
exports.main = main;
function withoutId(document) {
    const { _id, ...rest } = document;
    return rest;
}
//# sourceMappingURL=main.js.map