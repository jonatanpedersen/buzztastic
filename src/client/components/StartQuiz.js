import React, { Component } from 'react'
import { Link } from 'react-router-dom';

export default class StartQuiz extends Component {
	constructor() {
		super();
		this.state = {};
	}
	render() {
		const quizId = this.props.match.params.quizId;
		const quizName = this.props.match.params.quizName;
		const quizCode = this.props.match.params.quizCode;
		console.log('Quiz name: ', quizName);
		console.log('Quiz code: ', quizCode);
		return (
			<section className="section--start-quiz">
				<div className="start-quiz-placeholder">
					<p className="quiz-info">Quiz id: {quizId}</p>
					<p className="quiz-info">Quiz name: {quizName}</p>
					<p className="quiz-info">Quiz code: {quizCode}</p>
					<p className="center"><button className="button">Start quiz</button></p>
				</div>
			</section>
		)
	}
}