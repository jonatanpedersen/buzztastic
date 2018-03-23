import React, { Component } from 'react'

export default class StartQuiz extends Component {
	constructor() {
		super();
		this.state = {};
		this.startQuiz = this.startQuiz.bind(this);
	}

	startQuiz(event) {
		const quizCode = document.getElementById('quizCode').value;

		fetch(`${baseApiUrl}/quizzes/${quizCode}/rounds`, {
			method: 'POST',
			body: JSON.stringify({})
		})
			.then((response) => response.json())
			.then(rounds => this.props.history.push(`${baseUrl}quiz/${quizCode}`))
			.catch(err => console.error(err));
	}
	render() {
		const quizName = this.props.match.params.quizName;
		const quizCode = this.props.match.params.quizCode;
		return (
			<section className="section--start-quiz">
				<div className="start-quiz-placeholder">
					<p className="quiz-info">Quiz name: {quizName}</p>
					<p className="quiz-info">Quiz code: {quizCode}</p>
					<p className="center"><button className="button button--green" onClick={this.startQuiz}>Start quiz</button></p>
					<input type="hidden" value={quizCode} id="quizCode" />
				</div>
			</section>
		)
	}
}