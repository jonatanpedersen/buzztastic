"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Api {
    constructor(fetch) {
        this.fetch = fetch || defaultFetch;
    }
    async getEvents() {
        return this.get('/events');
    }
    async getStats() {
        return this.get('/stats');
    }
    async getQuiz(quizIdOrCode, string) {
        return this.get(`/quizzes/${quizIdOrCode}`);
    }
    async get(path) {
        return this.fetch({ method: 'GET', path });
    }
    async post(path, body) {
        return this.fetch({ method: 'POST', path, body });
    }
    async put(path, body) {
        return this.fetch({ method: 'PUT', path, body });
    }
    async del(path) {
        return this.fetch({ method: 'DELETE', path });
    }
}
exports.Api = Api;
async function defaultFetch(options) {
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