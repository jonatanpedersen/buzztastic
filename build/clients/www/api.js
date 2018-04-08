"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function getStats() {
    return call({
        method: 'GET',
        path: '/stats'
    });
}
exports.getStats = getStats;
async function get(path) {
    return call({ method: 'GET', path });
}
exports.get = get;
async function post(path, body) {
    return call({ method: 'POST', path, body });
}
exports.post = post;
async function put(path, body) {
    return call({ method: 'PUT', path, body });
}
exports.put = put;
async function del(path) {
    return call({ method: 'DELETE', path });
}
exports.del = del;
async function call(options) {
    const base = document.location.href.indexOf('qubu.io') > -1 ? 'https://api.qubu.io' : '/api';
    const { method, path, body } = options;
    const url = `${base}${path}`;
    let fetchOptions = {
        method,
        headers: {
            'Accept': 'application/json'
        }
    };
    if (body) {
        fetchOptions.body = JSON.stringify(body);
        fetchOptions.headers['Content-Type'] = 'Content-Type';
    }
    return fetch(url, fetchOptions)
        .then(response => response.json());
}
//# sourceMappingURL=api.js.map