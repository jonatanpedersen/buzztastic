import { main } from '../src/server/main';
import { describeHttpTests } from './helpers';

const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
const BASE_URL = 'http://localhost:1432';

const tests = [
	{
		skip: true,
		description: 'create quiz',
		request: {
			method: 'POST',
			url: `${BASE_URL}/api/quizes`,
			body: {}
		},
		response: {
			status: 400
		}
	},
	{
		description: 'create quiz',
		request: {
			method: 'POST',
			url: `${BASE_URL}/api/quizes`,
			body: {
				name: 'Test Quiz'
			}
		},
		response: {
			status: 200
		}
	},
	{
		skip: true,
		description: 'get quiz',
		request: {
			method: 'GET',
			url: tests => `${BASE_URL}/api/quizes/${tests[0].actualResponse.body.quizId}`,
			body: {
				name: 'Test Quiz'
			}
		},
		response: {
			body: {
				quizId: UUID
			},
			status: 200
		}
	}
];

describe ('server', () => {
	before (async () =>  {
		await main();
	});

	describeHttpTests(tests);
});

