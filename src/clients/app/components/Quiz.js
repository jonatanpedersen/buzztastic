import React, { Component } from 'react';

export default class Quiz extends Component {
	constructor(props) {
		super(props);
		this.state = {};
		this.startQuiz = this.startQuiz.bind(this);
	}

	componentDidMount() {
		const quizIdOrCode = this.props.match.params.quizIdOrCode;
		fetch(`${baseApiUrl}/quizzes/${quizIdOrCode}`, { method: 'GET' })
			.then((response) => response.json())
			.then(quiz => {
				return this.setState({ quiz });
			});
	}

	startQuiz(event) {
		const quizCode = document.getElementById('quizCode').value;

		const quizRound = fetch(`${baseApiUrl}/quizzes/${quizCode}/rounds`, {
			method: 'POST',
			body: JSON.stringify({})
		})
			.then((response) => response.json())
			.then(rounds => this.props.history.push(`${baseUrl}quiz/${quizCode}`))
			.catch(err => console.error(err));
	}

	render() {
		const { state } = this;
		const { quiz } = state;

		if (quiz === null || quiz === undefined) {
			return null;
		}

		const { code, name } = quiz;

		return (
			<section className="section--start-quiz">
				<div className="start-quiz-placeholder">
					<p className="quiz-info">Quiz name: {name}</p>
					<p className="quiz-info">Quiz code: {code}</p>
					<p className="center"><button className="button button--green" onClick={this.startQuiz}>Start quiz</button></p>
					<input type="hidden" value={code} id="quizCode" />
				</div>
			</section>
		)
	}
}