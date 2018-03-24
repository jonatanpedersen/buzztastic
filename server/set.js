"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function set(obj, update) {
    if (obj === undefined) {
        return update;
    }
    for (const prop in update) {
        const isObject = typeof update[prop] === 'object';
        const isNotNull = update[prop] !== null;
        const isNotArray = !Array.isArray(update[prop]);
        const newValue = isObject && isNotNull && isNotArray
            ? set(obj[prop], update[prop])
            : update[prop];
        obj = { ...obj, [prop]: newValue };
    }
    return obj;
}
exports.set = set;
//# sourceMappingURL=set.js.map