import React from 'react';
import ReactDOM from 'react-dom';

import App from './components/App';

(() => {
	const mainElement = document.getElementById('root');
	ReactDOM.render(<App />, mainElement);
})();
