import React, { Component } from 'react'

export default class StartQuiz extends Component {
	constructor() {
		super();
		this.state = {};
		this.startQuiz = this.startQuiz.bind(this);
	}

	startQuiz(event) {
		const quizId = document.getElementById('quizId').value;
		const quizCode = document.getElementById('quizCode').value;

		fetch(`/api/quizzes/${quizCode}/rounds`, {
			method: 'POST',
			body: JSON.stringify({}),
			headers: {
				'content-type': 'application/json',
				'Accept': 'application/json'
			}
		})
			.then(() => this.props.history.push(`/app/quiz/${quizId}/${quizCode}`))
			.catch(err => console.error(err));
	}
	render() {
		const quizId = this.props.match.params.quizId;
		const quizName = this.props.match.params.quizName;
		const quizCode = this.props.match.params.quizCode;
		return (
			<section className="section--start-quiz">
				<div className="start-quiz-placeholder">
					<p className="quiz-info">Quiz id: {quizId}</p>
					<p className="quiz-info">Quiz name: {quizName}</p>
					<p className="quiz-info">Quiz code: {quizCode}</p>
					<p className="center"><button className="button button--green" onClick={this.startQuiz}>Start quiz</button></p>
					<input type="hidden" value={quizId} id="quizId" />
					<input type="hidden" value={quizCode} id="quizCode" />
				</div>
			</section>
		)
	}
}