import React, { Component } from 'react'
import { Link } from 'react-router-dom';

const socket = io();

export default class Quiz extends Component {
	constructor() {
		super();
		this.state = {};
		this.newRound = this.newRound.bind(this);
	}

	getInitialState() {
		return {
			rounds: [],
			quizId: ''
		};
	}

	async componentDidMount() {
		const quizId = this.props.match.params.quizId;
		this.serverRequest = await fetch(`/api/quizzes/${quizId}`, { method: 'GET' })
			.then((response) => response.json())
			.then(json => {
				this.setState({
					rounds: json.rounds,
					quizId
				});
			});
		socket.on('quiz.round.buzzes.created', () => {
			console.log('buzz created!');
		});
	}

	componentWillUnmount() {
		this.serverRequest.abort();
	}

	async newRound() {
		const quizId = this.state.quizId;
		await fetch(`/api/quizzes/${quizId}/rounds`, { method: 'POST' });
		fetch(`/api/quizzes/${quizId}`, { method: 'GET' })
			.then(response => response.json())
			.then(json => {
				this.setState({
					rounds: json.rounds
				});
			}).catch((err) => console.error(err));
	}

	render() {
		const numberOfRounds = this.state.rounds ? this.state.rounds.length : 0;
		return (
			<section className="section--quiz">
				<div>
					<h1>Quiz</h1>
					<label id="rounds" >Round: {numberOfRounds}</label>
					<input type="hidden" value={quizId} id="quizId" />
					<button className="button new-round-button" onClick={this.newRound}>Next round</button>
					<button className="button button--danger end-quiz-button">End quiz</button>
				</div>
			</section>
		)
	};
}