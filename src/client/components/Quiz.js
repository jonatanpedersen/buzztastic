import React, { Component } from 'react'
import { Link } from 'react-router-dom';

export default class Quiz extends Component {
	constructor(props) {
		super(props);
		this.state = {
			rounds: [],
			quizId: '',
			quizCode: ''
		};
		this.newRound = this.newRound.bind(this);
	}

	componentDidMount() {
		const quizId = this.props.match.params.quizId;
		const quizCode = this.props.match.params.quizCode;
		fetch(`/api/quizzes/${quizId}`, { method: 'GET' })
			.then((response) => response.json())
			.then(json => {
				this.setState({
					rounds: json.rounds,
					quizId,
					quizCode
				});
			});
		const socket = io();
		socket.on('quiz.round.buzzes.created', buzzed => {
			console.log('buzz created! SOCKET WORKS');
			console.log('Buzzed: ', buzzed);
		});
	}

	async newRound() {
		console.log('New round called...');
		const quizId = this.state.quizId;
		const quizCode = this.state.quizCode;
		await fetch(`/api/quizzes/${quizCode}/rounds`, {
			method: 'POST',
			body: JSON.stringify({}),
			headers: {
				'content-type': 'application/json',
				'Accept': 'application/json'
			}
		});
		fetch(`/api/quizzes/${quizId}`, { method: 'GET' })
			.then(response => response.json())
			.then(json => {
				this.setState({
					rounds: json.rounds
				});
			}).catch((err) => console.error(err));
	}

	render() {
		const numberOfRounds = this.state.rounds ? this.state.rounds.length : 1;
		const quizCode = this.state.quizCode;
		return (
			<section className="section--quiz">
				<div>
					<h1>Quiz code: {quizCode}</h1>
					<label id="rounds" >Round: {numberOfRounds}</label>
					<input type="hidden" value={quizId} id="quizId" />
					<ul className="buzzer-list animated bounceIn">
						<li className="buzzer-list__item">
							<span className="buzzer__name">Buzzer test 1</span>
						</li>
						<li className="buzzer-list__item">
							<span class="buzzer__name">Buzzer test 2</span>
						</li>
					</ul>
					<button className="button new-round-button" onClick={this.newRound}>Next round</button>
					<Link className="button button--danger end-quiz-button" to="/app" >End quiz</Link>
				</div>
			</section>
		)
	};
}