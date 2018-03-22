import React from 'react';
import {render} from 'react-dom';

async function main () {
	const buttons = await fetch('/api/buttons')
		.then(response => response.json())
		.then(buttons => {
			return buttons.reduce((buttons, button) => {
				buttons[button.buttonId] = button;
				return buttons;
			}, {});
		});

	const socket = io();

	class App extends React.Component {
		constructor () {
			super();
			this.state = {buttonsPressed: {}}
		}

		componentDidMount () {
			const {socket} = this.props;

			socket.on('button-pressed', buttonPress => {
				const {buttonsPressed} = this.state;
				const {buttonId, timestamp} = buttonPress;

				const buttonPressed = buttonsPressed[buttonId];

				if (buttonPressed !== undefined) {
					return;
				}

				const pressCount = Object.keys(buttonsPressed).length + 1;

				this.setState({buttonsPressed: Object.assign({}, buttonsPressed, {[buttonId]: pressCount})});
			});

			socket.on('round-created', roundCreated => {
				console.log('round-created');
				this.setState({buttonsPressed: {}});
			});
		}

		render () {
			const {buttons} = this.props;
			const {buttonsPressed} = this.state;

			return <div>
				<button className="new-round-button" onClick={() => fetch('/api/rounds', {method: 'POST'})}>New Round</button>
				<ul className="buttons">
					{Object.entries(buttonsPressed).map(entry => 
						<li className="button animated bounceIn" key={entry[0]}>
							<span className="button__name">{buttons[entry[0]].name}</span>
						</li>
					)}
				</ul>
			</div>;
		}
	}

	const mainElement = document.querySelector('.main');
	
	render(React.createElement(App, {socket, buttons}), mainElement);
}

main();
