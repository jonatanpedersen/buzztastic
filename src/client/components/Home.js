import React, { Component } from 'react'
import { Link, Redirect } from 'react-router-dom';

export default class Home extends Component {
	constructor() {
		super();
		this.state = {};
		this.startQuiz = this.startQuiz.bind(this);
	}
	startQuiz(event) {
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
				.then(response => response.json())
				.then((json) => {
					console.log('response: ', json);
					const quizId = json.quizId;
					// window.location = `/app/start-quiz/${quizId}`;
					return this.props.history.push(`/app/start-quiz/${quizId}`);
				});
		}
	}
	render() {
		return (
			<section class="section--home">
				<div class="home">
					<h1 className="center">Buzztastic</h1>
					<div className="home--container-create">
						<h2>Create new quiz</h2>
						<label for="start-quiz">Please type in the name of your new quiz</label>
						<input className="home--input" id="create-quiz" value={this.state.name} onChange={event => this.setState({ name: event.target.value })}></input>
						<p className="center">
							<button className="button" onClick={this.startQuiz}>Start quiz</button>
						</p>
					</div>
					<hr className="margin" />
					<div className="home--container-join">
						<h2>Join existing quiz</h2>
						<label for="join-quiz">Please type in the id of the quiz you want to join</label>
						<input className="home--input" id="join-quiz"></input>
						<p className="center">
							<Link className="button" to="/app/start-quiz">Join quiz</Link>
						</p>
					</div>
					{/* <button><Link to="/start-quiz">Home</Link></button> */}
				</div>
			</section>
		)
	}
}
