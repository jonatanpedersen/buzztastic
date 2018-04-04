import * as React from 'react';
import * as ReactDOM from "react-dom";
import { App } from './App';
import { getStats } from '../shared/api';

async function main () {
	const stats = await getStats();

	ReactDOM.hydrate(<App stats={stats} />, document.querySelector('.app'));
}

main();
