import React, { Component } from 'react';
import {
	BrowserRouter as Router,
	Route,
	Link,
	Switch,
	Redirect
} from 'react-router-dom'

import Home from './Home'
import Quiz from './Quiz';

export default class App extends Component {
	render() {
		return (
			<Router>
				<div className="App">
					<div className="container">
						{/* <ul>
							<li><Link to="/">Home</Link></li>
						</ul> */}
						<Route exact path="/" component={Home} />
						<Route path="/quiz" component={Quiz} />
						{/* <Route path="/hello" component={Hello} /> */}
					</div>
				</div>
			</Router>
		);
	}
}