import React, { Component } from 'react';
import { Link } from 'react-router-dom'

export default class Home extends Component {
	constructor() {
		super();
		this.state = {};
		this.handleClick = this.handleClick.bind(this);
	}

	handleClick(event) {
		const name = this.state.name;
		console.log('Name: ', name);
	}
	render() {
		return (
			<section class="section--home">
				<div class="home">
					<h1 className="app-header">Buzztastic</h1>
					<div className="home--container-create">
						<h2>Create new quiz</h2>
						<label for="start-quiz">Please type in the name of your new quiz</label>
						<input className="home--input" id="create-quiz" value={this.state.name} onChange={(event) => this.setState({ name: event.target.value })}></input>
						<button className="btn btn--blue" onClick={this.handleClick}>Start quiz</button>
					</div>
					<hr className="home--hr" />
					<div className="home--container-join">
						<h2>Join existing quiz</h2>
						<label for="join-quiz">Please type in the id of the quiz you want to join</label>
						<input className="home--input" id="join-quiz"></input>
						<Link className="btn btn--blue" to="/start-quiz">Start quiz</Link>
					</div>
					{/* <button><Link to="/start-quiz">Home</Link></button> */}
				</div>
			</section>
		)
	}
}