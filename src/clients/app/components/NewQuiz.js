import React, { Component } from 'react'

export default class NewQuiz extends Component {
	constructor(props) {
		super(props);

		this.state = {
			newQuizName: ''
		};

		this.createQuiz = this.createQuiz.bind(this);
	}

	async createQuiz(event) {
		event.preventDefault();
		const { newQuizName } = this.state;

		const quiz = {
			name: newQuizName
		};

		const quizId = await fetch(`${baseApiUrl}/quizzes`, {
			body: JSON.stringify(quiz),
			method: 'POST'
		})
		.then(postResponse => postResponse.json())
		.then((json) => json.quizId)
		.catch(err => console.error(err));

		if (!quizId) {
			return;
		}

		const { code } = await fetch(`${baseApiUrl}/quizzes/${quizId}`)
			.then(response => response.json());

		this.props.history.push(code);
	}

	render() {
		return (
			<section className="section--home">
				<div className="home">
					<div>
						<h2>New quiz</h2>
						<label htmlFor="start-quiz">Please type in the name of your new quiz</label>
						<input value={this.state.newQuizName} onChange={event => this.setState({ newQuizName: event.target.value })}></input>
						<p className="center">
							<button className="button button--green" onClick={this.createQuiz}>Create quiz</button>
						</p>
					</div>
				</div>
			</section>
		)
	}
}
