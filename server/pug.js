"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pug_1 = require("pug");
function pug(file) {
    return async function pug(context) {
        return {
            ...context,
            response: {
                ...context.response,
                body: new Buffer(pug_1.renderFile(file, context))
            }
        };
    };
}
exports.pug = pug;
//# sourceMappingURL=pug.js.map