import React, { Component } from 'react'

console.log('Home file!');

export default class Home extends Component {
	constructor() {
		super();
		this.state = {};
		this.createQuiz = this.createQuiz.bind(this);
	}
	async createQuiz(event) {
		event.preventDefault();
		const quizInputName = this.state.quizInputName;

		console.log('input name: ', quizInputName);

		if (quizInputName.trim() === '') {
			console.error('quiz name not found');
			const quizInput = document.getElementById('create-quiz');
			quizInput.value = '';
			return alert('Quiz name have to include letters');
		}

		if (quizInputName !== undefined) {
			const quiz = { "name": quizInputName }

			const quizId = await fetch(`${baseApiUrl}/quizzes`, {
				body: JSON.stringify(quiz),
				method: 'POST'
			})
				.then(postResponse => postResponse.json())
				.then((json) => json.quizId)
				.catch(err => console.error(err));
			console.log('Quiz id: ', quizId);
			if (!quizId) {
				return;
			}
			const quizInfo = await fetch(`${baseApiUrl}/quizzes/${quizId}`, { method: 'GET' })
				.then(getResponse => getResponse.json())
				.catch(err => console.error(err));
			console.log('Quiz info: ', quizInfo);

			const quizName = quizInfo.name;
			const quizCode = quizInfo.code;
			this.props.history.push(`/app/start-quiz/${quizCode}/${quizName}`);
		}
	}
	render() {
		console.log('Rendering Home!!!');
		return (
			<section class="section--home">
				<div class="home">
					<div>
						<h2>Create new quiz</h2>
						<label for="start-quiz">Please type in the name of your new quiz</label>
						<input id="create-quiz" value={this.state.quizInputName} onChange={event => this.setState({ quizInputName: event.target.value })}></input>
						<p className="center">
							<button className="button button--green" onClick={this.createQuiz}>Start quiz</button>
						</p>
					</div>
				</div>
			</section>
		)
	}
}
