import React, { Component } from 'react'

console.log('Home file!');

export default class NotFound extends Component {
	constructor() {
		super();
		this.state = {}
	}
	render () {
		return (
			<section>
				<h2>Page not found</h2>
			</section>
		)
	}
}