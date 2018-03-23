import React, { Component } from 'react'
import { Switch, Route, BrowserHistory } from 'react-router-dom'
import Home from './Home';
import Quiz from './Quiz';
import StartQuiz from './StartQuiz'
import NotFound from './404';

console.log('Base url: ', baseUrl);
console.log('Base api : ', baseApiUrl);
console.log('rendeeeer');

export default class Main extends Component {
	render() {
		return (
			<main className='main'>
				<Switch>
					<Route exact path={baseUrl} component={Home} />
					<Route path={baseUrl + 'start-quiz/:quizCode/:quizName'} component={StartQuiz} />
					<Route path={baseUrl + 'quiz/:quizCode'} component={Quiz} />
					<Route path='*' component={NotFound}/>
				</Switch>
			</main>
		)
	}
}