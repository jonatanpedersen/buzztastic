import * as React from 'react';
import * as ReactDOM from "react-dom";
import { App } from './App';
import { Api } from '../shared/api';

async function main () {
	const api = new Api();
	const stats = await api.getStats();

	ReactDOM.hydrate(<App stats={stats} />, document.querySelector('.app'));
}

main();
