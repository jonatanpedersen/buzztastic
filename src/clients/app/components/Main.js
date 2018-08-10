import React, { Component } from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import NewQuiz from './NewQuiz';
import Quiz from './Quiz';
import QuizRound from './QuizRound';
import NotFound from './404';

export default class Main extends Component {
	render() {
		return (
			<main className="main">
				<Switch>
					<Redirect exact path="/" to="/quizzes/new" />
					<Route exact path="/quizzes/new" component={NewQuiz} />
					<Route path="/quizzes/:quizIdOrCode" component={Quiz} />
					<Route path="/quizzes/:quizIdOrCode/round" component={QuizRound} />
					<Route path="*" component={NotFound}/>
				</Switch>
			</main>
		)
	}
}