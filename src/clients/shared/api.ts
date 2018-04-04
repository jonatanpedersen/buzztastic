import { Event, Stat, Quiz } from '../../shared/types';

export type FetchFunction = (options: { method: string, path: string, body?: object}) => Promise<any>;

export class Api {
	private fetch : FetchFunction;

	constructor (fetch : FetchFunction) {
		this.fetch = fetch;
	}

	async getEvents () : Promise<Event[]> {
		return this.get<Event[]>('/events');
	}

	async getStats () : Promise<Stat[]> {
		return this.get<Stat[]>('/stats');
	}

	async getQuiz (quizIdOrCode, string) : Promise<Quiz[]> {
		return this.get<Quiz[]>(`/quizzes/${quizIdOrCode}`);
	}

	async get<T> (path : string) : Promise<T> {
		return this.fetch({ method: 'GET', path });
	}

	async post<T> (path : string, body : object) : Promise<T> {
		return this.fetch({ method: 'POST', path, body });
	}

	async put<T> (path : string, body : object) : Promise<T> {
		return this.fetch({ method: 'PUT', path, body });
	}

	async del<T> (path : string) : Promise<T> {
		return this.fetch({ method: 'DELETE', path });
	}
}


async function fetch2 (options: { method: string, path: string, body?: object}) : Promise<any> {
	const base = document.location.href.indexOf('qubu.io') > -1 ? 'https://api.qubu.io' : '/api';
	const { method, path, body } = options;

	const url = `${base}${path}`;

	let fetchOptions : any = {
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