import React from 'react';
import {render} from 'react-dom';

async function main () {
	const quizzes = await fetch('/api/quizzes')
		.then(response => response.json());

	const socket = io();

	class App extends React.Component {
		constructor () {
			super();
			this.state = {buttonsPressed: {}}
		}

		componentDidMount () {
			const {socket} = this.props;

			socket.on('quiz.created', buttonPress => {
				console.log('quiz.created');
			});
		}

		render () {
			return null;
		}
	}

	const mainElement = document.querySelector('.main');

	render(React.createElement(App, {socket, quizzes}), mainElement);
}

main();
