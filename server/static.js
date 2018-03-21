"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const url_1 = require("url");
const fs_1 = require("fs");
function dir(path) {
    return async function dir(context) {
        const { pathname } = url_1.parse(context.request.url);
        const base = pathname ? path_1.join(path, pathname) : path;
        const files = [
            base,
            path_1.join(base, 'index.html')
        ];
        let body;
        for (const file of files) {
            try {
                body = fs_1.readFileSync(file);
                break;
            }
            catch (err) {
                console.log(err, file);
            }
        }
        ;
        return {
            ...context,
            response: {
                ...context.response,
                body
            }
        };
    };
}
exports.dir = dir;
//# sourceMappingURL=static.js.map