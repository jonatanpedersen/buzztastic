import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import Home from './Home';
import Quiz from './Quiz';
import StartQuiz from './StartQuiz'

export default class Main extends Component {
	render() {
		return (
			<main className='main'>
				<Switch>
					<Route exact path='/app/' component={Home} />
					<Route path='/app/start-quiz/:quizCode/:quizName' component={StartQuiz} />
					<Route path='/app/quiz/:quizCode' component={Quiz} />
				</Switch>
			</main>
		)
	}
}