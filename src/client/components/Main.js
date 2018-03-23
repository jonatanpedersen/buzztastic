import React, { Component } from 'react'
import { Switch, Route, BrowserHistory } from 'react-router-dom'
import Home from './Home';
import Quiz from './Quiz';
import StartQuiz from './StartQuiz'

const baseUrl = document.querySelector('head base').attributes.href.value;
console.log('Base url: ', baseUrl);

export default class Main extends Component {
	render() {
		return (
			<main className='main'>
				<Switch>
					<Route exact path={baseUrl} component={Home} />
					<Route path={baseUrl + 'start-quiz/:quizCode/:quizName'} component={StartQuiz} />
					<Route path={baseUrl + 'quiz/:quizCode'} component={Quiz} />
				</Switch>
			</main>
		)
	}
}