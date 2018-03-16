import React from 'react';
import { Link } from 'react-router-dom'

export default () => {
	return (
		<section class="section--home">
			<div class="home">
				<h1 className="app-header">Buzztastic</h1>
				<div className="home--container-create">
					<input className="home--input" id="start-quiz"></input>
					<button className=""><Link to="/start-quiz">Start quiz</Link></button>
				</div>
				<hr />
				<div className="home--container-join">
					<input className="home--input" id="join-quiz"></input>
					<button className=""><Link to="/start-quiz">Start quiz</Link></button>
				</div>
				{/* <button><Link to="/start-quiz">Home</Link></button> */}
			</div>
		</section>
	);
}