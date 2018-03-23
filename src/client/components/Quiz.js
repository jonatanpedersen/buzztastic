import React, { Component } from 'react'
import { Link } from 'react-router-dom';

export default class Quiz extends Component {
	constructor(props) {
		super(props);
		this.state = { buzzers: [] };
		this.newRound = this.newRound.bind(this);
	}

	componentDidMount() {
		const quizCode = this.props.match.params.quizCode;
		fetch(`${baseApiUrl}/quizzes/${quizCode}`, { method: 'GET' })
			.then((response) => response.json())
			.then(quiz => {
				return this.setState({ quiz });
			});

		const socket = io();
		socket.on('quiz.round.buzz.created', buzzed => {
			const { quiz, buzzers } = this.state;
			const { playerId, teamId } = buzzed.data;
			console.log('Quiz: ', quiz);
			const team = quiz.teams.find(team => team.teamId === teamId);
			const { name: teamName } = team;
			const player = quiz.players.find(player => player.playerId = playerId);
			const { name: playerName } = player;
			this.setState({ buzzers: [...buzzers, { playerName, teamName }] });
		});
	}

	async newRound() {
		const quizCode = this.props.match.params.quizCode;
		const { buzzers, quiz } = this.state;
		await fetch(`${baseApiUrl}/quizzes/${quizCode}/rounds`, {
			method: 'POST',
			body: JSON.stringify({})
		});
		fetch(`${baseApiUrl}/quizzes/${quizCode}`, { method: 'GET' })
			.then(response => response.json())
			.then(quiz => {
				this.setState({
					quiz: quiz,
					buzzers: []
				});
			}).catch((err) => console.error(err));
	}

	render() {
		const { quiz, buzzers } = this.state;
		const quizCode = this.props.match.params.quizCode;
		const numberOfRounds = quiz && quiz.rounds ? quiz.rounds.length : 0;

		return (
			<section className="section--quiz">
				<div>
					<div className="quiz-info">
						<h1>Quiz code: {quizCode}</h1>
						<label id="rounds" className="round-count" >Round: {numberOfRounds}</label>
					</div>
					<div className="buzzers">
						<ul className="buzzer-list ">
							{buzzers.map(buzzer =>
								<li className="buzzer-list__item animated bounceIn">
									<span className="buzzer__team">{buzzer.teamName}</span>
								</li>
							)}
						</ul>
					</div>
					<button className="button new-round-button" onClick={this.newRound}>Next round</button>
					<Link className="button button--danger end-quiz-button" to={baseUrl} >End quiz</Link>
				</div>
			</section>
		)
	};
}