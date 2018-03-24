"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@jambon/core");
function env(name, value, ...reducers) {
    return async function env(context) {
        if (process.env[name] !== value) {
            return context;
        }
        return core_1.all(...reducers)(context);
    };
}
exports.env = env;
//# sourceMappingURL=env.js.map