import React, { Component } from 'react'
import { Link } from 'react-router-dom';

export default class StartQuiz extends Component {
	constructor() {
		super();
		this.state = {};
	}
	render() {
		const quizId = this.props.match.params.quizId
		return (
			<section className="section--start-quiz">
				<div>I'm empty</div>
				<div>id: {quizId}</div>
			</section>
		)
	}
}