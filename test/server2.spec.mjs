import { main } from '../src/server/main';
import nodeFetch from 'node-fetch';
import chai from 'chai';

const { expect } = chai;

const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
const CODE = /[A-Z]{6}/;

describe.only('api', () => {
	before (async () =>  {
		await main();
	});

	describe('quizzes', () => {

		describe.only('create', () => {
			const response = async () => createQuiz('Test Quiz');

			describeResponse(response, response => {
				const body = () => response().body;

				describeBody(body, body => {

					describe('quizId', () => {
						let quizId;

						before(() => {
							quizId = body().quizId;
						});

						it('should match a uuid', () => {
							expect(quizId).to.match(UUID);
						});
					});
				});
			});
		});

		describe('create', () => {
			describe('response', () => {
				let response;

				before(async () => {
					response = await createQuiz('Test Quiz');
				});

				describe('body', () => {
					let body;

					before(() => {
						body = response.body;
					});

					describe('quizId', () => {
						let quizId;

						before(() => {
							quizId = response.body.quizId;
						});

						it('should match a uuid', () => {
							expect(quizId).to.match(UUID);
						});
					});
				});
			});
		});

		describe('get', () => {
			let response, quiz;

			before(async () => {
				quiz = await createQuiz('Test Quiz').then(responseBody);
				response = await getQuiz(quiz.quizId);
			});

			describe('response', () => {
				describe('body', () => {
					let body;

					describe('quizId', () => {
						it('should match a uuid', () => {
							expect(response.body.quizId).to.match(UUID);
						});
					});

					describe('code', () => {
						it('should match a code', () => {
							expect(response.body.code).to.match(CODE);
						});
					});
				});
			});
		});

		describe('get', () => {
			let response;

			before(async () => {
				const { quizId } = await createQuiz('Test Quiz').then(responseBody);
				response = await getQuiz(quizId);
			});

			describe('response', () => {
				describe('body', () => {
					describe('quizId', () => {
						it('should match a uuid', () => {
							expect(response.body.quizId).to.match(UUID);
						});
					});
				});
			});
		});
	});
});

const BASE_URL = 'http://localhost:1432';

async function createQuiz (name) {
	return post('/api/quizzes', { name });
}

async function getQuiz (quizIdOrCode) {
	return get(`/api/quizzes/${quizIdOrCode}`);
}

async function deleteQuiz (quizIdOrCode) {
	return del(`/api/quizzes/${quizIdOrCode}`);
}

async function createQuizPlayer (quizIdOrCode, name, teamId) {
	return post(`/api/quizzes/${quizIdOrCode}/players`, { name, teamId });
}

async function updateQuizPlayer (quizIdOrCode, playerId, name, teamId) {
	return put(`/api/quizzes/${quizIdOrCode}/players/${playerId}`, { name, teamId });
}

async function deleteQuizPlayer (quizIdOrCode, playerId) {
	return del(`/api/quizzes/${quizIdOrCode}/players/${playerId}`);
}

async function createQuizTeam (quizIdOrCode, name) {
	return post(`/api/quizzes/${quizIdOrCode}/teams`, { name });
}

async function deleteQuizTeam (quizIdOrCode, teamId) {
	return del(`/api/quizzes/${quizIdOrCode}/teams/${teamId}`);
}

async function createQuizRound (quizIdOrCode) {
	return post(`/api/quizzes/${quizIdOrCode}/rounds`);
}

async function createQuizRoundBuzz (quizIdOrCode, playerId, teamId) {
	return post(`/api/quizzes/${quizIdOrCode}/rounds/current/buzzes`, { playerId, teamId });
}

async function get (path) {
	return fetch(path, {
		method: 'GET'
	});
}

async function post (path, body) {
	return fetch(path, {
		method: 'POST',
		body: JSON.stringify(body)
	});
}

async function put (path, body) {
	return fetch(path, {
		method: 'PUT',
		body: JSON.stringify(body)
	});
}

async function del (path) {
	return fetch(path, {
		method: 'DELETE'
	});
}

async function fetch (path, options) {
	const url = `${BASE_URL}${path}`;

	const request = [url, {
		headers: {
			'Accepts': 'application/json',
			'Content-Type': 'application/json',
			...options.headers
		},
		...options
	}];

	return nodeFetch(...request)
		.then(checkStatus)
		.then(parseJSON);
}

function responseBody (response) {
	return response.body;
}

function checkStatus(response) {
	if (response.status >= 200 && response.status < 300) {
		return response;
	} else {
		let error = new Error(response.statusText);
		error.response = response;
		throw error;
	}
}

function parseJSON(response) {
	return response.json()
		.then(body => {
			response.body = body;
			return response;
		})
		.catch((err) => {
			return response;
		});
}

function describeResponse (resolve, test) {
	describeTest('response', resolve, test);
}

function describeBody (resolve, test) {
	describeTest('body', resolve, test);
}

function describeTest (name, resolve, test) {
	describe(name, () => {
		let sub;

		before(async () => {
			sub = await resolve();
		});

		test(() => sub);
	})
}