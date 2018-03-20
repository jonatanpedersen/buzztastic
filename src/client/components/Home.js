import React, { Component } from 'react'
import { Link, Redirect } from 'react-router-dom';

export default class Home extends Component {
	constructor() {
		super();
		this.state = {};
		this.createQuiz = this.createQuiz.bind(this);
	}
	createQuiz(event) {
		event.preventDefault();
		const name = this.state.name;
		console.log('Name: ', name);
		if (name !== undefined) {
			const quiz = { "name": name }
			fetch('/api/quizzes', {
				body: JSON.stringify(quiz),
				method: "POST",
				headers: new Headers({
					'Content-Type': 'application/json'
				})
			})
				.then(postResponse => postResponse.json())
				.then((json) => {
					const quizId = json.quizId;
					fetch(`/api/quizzes/${quizId}`, { method: 'GET' })
						.then(getResponse => getResponse.json())
						.then((json) => this.props.history.push(`/app/start-quiz/${quizId}/${json.name}/${json.code}`))
						.catch(err => console.error(err));
					// then(json => this.props.history.push(`/app/start-quiz/${quizId}`));
					// window.location = `/app/start-quiz/${quizId}`;
				}).catch((err) => console.error(err))
		}
	}
	render() {
		return (
			<section class="section--home">
				<div class="home">
					<h1 className="center">Buzztastic</h1>
					<div>
						<h2>Create new quiz</h2>
						<label for="start-quiz">Please type in the name of your new quiz</label>
						<input id="create-quiz" value={this.state.name} onChange={event => this.setState({ name: event.target.value })}></input>
						<p className="center">
							<button className="button" onClick={this.createQuiz}>Start quiz</button>
						</p>
					</div>
				</div>
			</section>
		)
	}
}
