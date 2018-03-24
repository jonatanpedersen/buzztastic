import React from 'react'
import { render } from 'react-dom'
import { BrowserRouter } from 'react-router-dom'

class App extends React.Component {
	constructor () {
		super();
		this.state = {
			events: [],
			stats: []
		};
	}

	componentDidMount () {
		const socket = io();

		socket.on('stats.updated', event => {
			const top = (Math.random() * 80) + 10;
			const left = (Math.random() * 80) + 10;
			const size = ['small', 'medium', 'large'][Math.ceil(Math.random() * 3) - 1];
			this.setState({ events: [...this.state.events, { top, left, size, type: event.data.metric }] });
			this.update();
		});

		this.update();
	}

	update () {
		const base = document.location.href.indexOf('qubu.io') > -1 ? 'https://api.qubu.io' : '/api';
		fetch(`${base}/stats`, { method: 'GET' })
			.then(response => response.json())
			.then(stats => {
				this.setState({ stats });
			});
	}

	render () {
		const { events, stats } = this.state;

		return <div>
			<img className="rotate" src="splash_3.png" alt="QuBu - The buzztastic quiz buzzer." title="QuBu" />
			<Events events={events} />
			<Stats stats={stats} />
		</div>;
	};
}


const Events = props => {
	const { events } = props;

	return <div className="events">{events.map(event => <Event event={event} />)}</div>;
};

const Event = props => {
	const { top, left, size, type } = props.event;
	return <div className="event" style={{top: `${top}%`, left: `${left}%`}}>
		<img className={`event__image event__image--${size}`} src={`${type}.png`} alt={type} />
	</div>;
};

const Stats = props => {
	const { stats } = props;
	return <div className="stats">{stats.map(metric => <Metric metric={metric} />)}</div>;
};

const Metric = props => {
	const { metric, count } = props.metric;
	return <div className="metric">{metric} {count}</div>;
};


render((
	<BrowserRouter>
		<App />
	</BrowserRouter>
), document.querySelector('.main'));

