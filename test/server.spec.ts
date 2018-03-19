import { main } from '../src/server/main';
import { describeHttpTests } from './helpers';

const BASE_URL = 'http://localhost:1432';
const CODE = /[A-Z]{6}/;
const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
const UTC = /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/;

const tests = [
	{
		id: 'createQuizWithoutName',
		description: 'create quiz without name',
		request: {
			method: 'POST',
			url: `${BASE_URL}/api/quizzes`,
			body: {}
		},
		response: {
			status: 400,
			statusText: 'Bad Request'
		}
	},
	{
		id: 'createQuiz',
		description: 'create quiz',
		request: {
			method: 'POST',
			url: `${BASE_URL}/api/quizzes`,
			body: {
				name: 'Test Quiz'
			}
		},
		response: {
			body: {
				quizId: UUID
			},
			status: 201,
			statusText: 'Created'
		}
	},
	{
		id: 'getQuiz',
		description: 'get quiz',
		request: {
			method: 'GET',
			url: ({createQuiz}) => `${BASE_URL}/api/quizzes/${createQuiz.actualResponse.body.quizId}`
		},
		response: {
			body: {
				quizId: UUID,
				code: CODE,
				created: UTC,
				name: 'Test Quiz'
			},
			status: 200,
			statusText: 'OK'
		}
	},
	{
		id: 'getQuizByCode',
		description: 'get quiz by code',
		request: {
			method: 'GET',
			url: ({getQuiz}) => `${BASE_URL}/api/quizzes/${getQuiz.actualResponse.body.code}`
		},
		response: {
			body: {
				quizId: UUID,
				code: CODE,
				created: UTC,
				name: 'Test Quiz'
			},
			status: 200,
			statusText: 'OK'
		}
	},
	{
		id: 'createQuizTeam',
		description: 'create quiz team',
		request: {
			method: 'POST',
			url: ({createQuiz}) => `${BASE_URL}/api/quizzes/${createQuiz.actualResponse.body.quizId}/teams`,
			body: {
				name: 'Awesome Team'
			}
		},
		response: {
			body: {
				quizId: UUID,
				teamId: UUID
			},
			status: 201,
			statusText: 'Created'
		}
	},
	{
		id: 'createQuizPlayer',
		description: 'create quiz player',
		request: {
			method: 'POST',
			url: ({createQuiz}) => `${BASE_URL}/api/quizzes/${createQuiz.actualResponse.body.quizId}/players`,
			body: {
				name: 'Jane Doe'
			}
		},
		response: {
			body: {
				quizId: UUID,
				playerId: UUID
			},
			status: 201,
			statusText: 'Created'
		}
	},
	{
		id: 'updateQuizPlayerWithTeam',
		description: 'update quiz player with team',
		request: {
			method: 'PUT',
			url: ({createQuiz, createQuizPlayer}) => `${BASE_URL}/api/quizzes/${createQuiz.actualResponse.body.quizId}/players/${createQuizPlayer.actualResponse.body.playerId}`,
			body: {
				name: 'Jane Doe',
				teamId: ({createQuizTeam}) => createQuizTeam.actualResponse.body.teamId
			}
		},
		response: {
			body: {
				quizId: UUID,
				playerId: UUID
			},
			status: 200,
			statusText: 'OK'
		}
	},
	{
		id: 'createAnotherQuizPlayerWithTeam',
		description: 'create another quiz player',
		request: {
			method: 'POST',
			url: ({createQuiz}) => `${BASE_URL}/api/quizzes/${createQuiz.actualResponse.body.quizId}/players`,
			body: {
				name: 'John Doe',
				teamId: ({createQuizTeam}) => createQuizTeam.actualResponse.body.teamId
			}
		},
		response: {
			body: {
				quizId: UUID,
				playerId: UUID
			},
			status: 201,
			statusText: 'Created'
		}
	},
	{
		id: 'createQuizRound',
		description: 'create quiz round',
		request: {
			method: 'POST',
			url: ({createQuiz}) => `${BASE_URL}/api/quizzes/${createQuiz.actualResponse.body.quizId}/rounds`,
			body: { }
		},
		response: {
			body: {
				quizId: UUID,
				roundId: UUID
			},
			status: 201,
			statusText: 'Created'
		}
	},
	{
		id: 'getQuizAfterRoundCreated',
		description: 'get quiz after round created',
		request: {
			method: 'GET',
			url: ({createQuiz}) => `${BASE_URL}/api/quizzes/${createQuiz.actualResponse.body.quizId}`
		},
		response: {
			body: {
				currentRoundId: ({createQuizRound}) => createQuizRound.actualResponse.body.roundId
			},
			status: 200,
			statusText: 'OK'
		}
	},
	{
		id: 'createQuizRoundBuzz',
		description: 'create quiz round buzz',
		request: {
			method: 'POST',
			url: ({createQuiz, createQuizRound}) => `${BASE_URL}/api/quizzes/${createQuiz.actualResponse.body.quizId}/rounds/current/buzzes`,
			body: {
				teamId: ({createQuizTeam}) => createQuizTeam.actualResponse.body.teamId,
				playerId: ({createQuizPlayer}) => createQuizPlayer.actualResponse.body.playerId
			}
		},
		response: {
			body: {
				quizId: ({createQuiz}) => createQuiz.actualResponse.body.quizId,
				roundId: ({createQuizRound}) => createQuizRound.actualResponse.body.roundId,
				buzzId: UUID
			},
			status: 201,
			statusText: 'Created'
		}
	},
	{
		id: 'createAnotherQuizRoundBuzz',
		description: 'create another quiz round buzz',
		request: {
			method: 'POST',
			url: ({createQuiz, createQuizRound}) => `${BASE_URL}/api/quizzes/${createQuiz.actualResponse.body.quizId}/rounds/current/buzzes`,
			body: {
				teamId: ({createQuizTeam}) => createQuizTeam.actualResponse.body.teamId,
				playerId: ({createAnotherQuizPlayerWithTeam}) => createAnotherQuizPlayerWithTeam.actualResponse.body.playerId
			}
		},
		response: {
			body: {
				quizId: ({createQuiz}) => createQuiz.actualResponse.body.quizId,
				roundId: ({createQuizRound}) => createQuizRound.actualResponse.body.roundId,
				buzzId: UUID
			},
			status: 201,
			statusText: 'Created'
		}
	},
	{
		id: 'createAnotherQuizRoundBuzzWithTheSamePlayerInTheSameRound',
		description: 'create another quiz round buzz with the same player in the same round',
		request: {
			method: 'POST',
			url: ({createQuiz, createQuizRound}) => `${BASE_URL}/api/quizzes/${createQuiz.actualResponse.body.quizId}/rounds/current/buzzes`,
			body: {
				teamId: ({createQuizTeam}) => createQuizTeam.actualResponse.body.teamId,
				playerId: ({createQuizPlayer}) => createQuizPlayer.actualResponse.body.playerId
			}
		},
		response: {
			status: 400,
			statusText: 'Bad Request'
		}
	}
];

describe ('server', () => {
	before (async () =>  {
		await main();
	});

	describeHttpTests(tests);
});
