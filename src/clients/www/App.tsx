import * as React from 'react';
import { Api } from '../shared/api';
import { Event, Stat, Quiz } from '../../shared/types';

interface AppState { events: any[], stats: Stat[]  }
export class App extends React.Component<any, AppState> {
	constructor (props) {
		super(props);
		this.state = {
			events: [],
			stats: props.stats || []
		};
	}

	componentDidMount () {
		this.update();

		// @ts-ignore
		const socket = io && io();

		if (!socket) {
			return;
		}

		socket.on('stats.updated', event => {
			const top = (Math.random() * 120) - 10;
			const left = (Math.random() * 120) - 10;
			const size = ['small', 'medium', 'large'][Math.ceil(Math.random() * 3) - 1];
			this.setState({ events: [...this.state.events, { top, left, size, type: event.data.metric }] });
			this.update();
		});
	}

	async update () {
		const api = new Api();
		const stats = await api.getStats();
		this.setState({ stats });
	}

	render () {
		const { events, stats } = this.state;

		return <div>
			<Header />
			<main className="main">
				<JumbotronSection events={events} />
				<StatsSection stats={stats} />
			</main>
			<Footer year="2018" />
		</div>;
	};
}

const Events = props => {
	const { events } = props;

	return <div className="events">{events.map((event, idx) => <Event event={event} key={idx} />)}</div>;
};

const Event = props => {
	const { top, left, size, type } = props.event;

	return <div className="event" style={{top: `${top}%`, left: `${left}%`}}>
		<img className={`event__image event__image--${size}`} src={`${type}.png`} alt={type} />
	</div>;
};

const JumbotronSection = props => {
	const { events } = props;

	return (<section className="section jumbotron-section">
		<div className="jumbotron-section__background">
			<Events events={events} />
		</div>
		<div className="jumbotron">
			<img src="splash_3.png" className="splash rotate" alt="QuBu - The buzztastic quiz buzzer." title="QuBu" />
			<nav className="nav jumbotron__nav">
				<a className="button button--large get-started-button" href="https://app.qubu.io/">Get started</a>
			</nav>
		</div>
	</section>);
};

const StatsSection = props => {
	const { stats } = props;

	return (<section className="section stats-section">
		<Container>
			<h2 className="heading-2">Stats</h2>
			<Stats stats={stats} />
		</Container>
	</section>);
};

const Stats = props => {
	const { stats } = props;

	return <div className="stats">{stats.map(stat => <Stat stat={stat} key={stat.metric} />)}</div>;
};

const Stat = props => {
	const { metric, count } = props.stat;
	const heading = {
		'quiz.created': 'Quizes created',
		'quiz.player.created': 'Players joined',
		'quiz.team.created': 'Teams formed',
		'quiz.round.created': 'Rounds played',
		'quiz.round.buzz.created': 'Buzzes'
	}[metric];

	return <div className="stat">
		<span className="stat__count">{count}</span>
		<span className="stat__heading">{heading}</span>
	</div>;
};

const Header = props => {
	const { year} = props;

	return <header className="header">
		<div className="container">
			<nav className="nav">
				<h1 className="heading-1">
					<span className="red-dot" />
					<span className=""> QUBU</span>
				</h1>
				<menu className="menu">
					<a className="button get-started-button" href="https://app.qubu.io/">Get started</a>
				</menu>
			</nav>
		</div>
	</header>;
};

const Footer = props => {
	const { year} = props;

	return <footer className="footer">
		<div className="container">
			<nav className="nav">
				<h3>&copy; {year} QUBU</h3>
			</nav>
		</div>
	</footer>;
};

const Container = props => {
	return <div className="container">{props.children}</div>;
};