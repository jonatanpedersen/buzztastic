import React from 'react';
import { Link } from 'react-router-dom'

export default () => {
	return (
		<section class="section--home">
			<div class="home">
				<h1 className="app-header">Buzztastic</h1>
				<div className="home--create-quiz">
					<input className="" id="start-quiz"></input>
					<button className=""><Link to="/quiz">Start quiz</Link></button>
				</div>
				<hr />
				<div className="home--join-div">
					<input className="" id="join-quiz"></input>
					<button className=""><Link to="/quiz">Start quiz</Link></button>
				</div>
				{/* <button><Link to="/start-quiz">Home</Link></button> */}
			</div>
		</section>
	);
}