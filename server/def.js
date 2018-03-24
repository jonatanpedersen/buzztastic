"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@jambon/core");
function def(...reducers) {
    return async function def(context) {
        if (context.response !== undefined) {
            return context;
        }
        return core_1.all(...reducers)(context);
    };
}
exports.def = def;
//# sourceMappingURL=def.js.map