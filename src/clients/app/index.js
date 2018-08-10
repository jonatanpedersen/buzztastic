import React from 'react'
import { render } from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import App from './components/App';

const basename = document.querySelector('head base').attributes.getNamedItem('href').value.replace(/\/$/, '');
console.log(basename);

render((
	<BrowserRouter basename={basename}>
		<App />
	</BrowserRouter>
), document.getElementById('root'));

