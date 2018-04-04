"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const api_1 = require("../shared/api");
class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            events: [],
            stats: props.stats || []
        };
    }
    componentDidMount() {
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
    async update() {
        const stats = await api_1.getStats();
        this.setState({ stats });
    }
    render() {
        const { events, stats } = this.state;
        return React.createElement("div", null,
            React.createElement(Header, null),
            React.createElement("main", { className: "main" },
                React.createElement(JumbotronSection, { events: events }),
                React.createElement(StatsSection, { stats: stats })),
            React.createElement(Footer, { year: "2018" }));
    }
    ;
}
exports.App = App;
const Events = props => {
    const { events } = props;
    return React.createElement("div", { className: "events" }, events.map((event, idx) => React.createElement(Event, { event: event, key: idx })));
};
const Event = props => {
    const { top, left, size, type } = props.event;
    return React.createElement("div", { className: "event", style: { top: `${top}%`, left: `${left}%` } },
        React.createElement("img", { className: `event__image event__image--${size}`, src: `${type}.png`, alt: type }));
};
const JumbotronSection = props => {
    const { events } = props;
    return (React.createElement("section", { className: "section jumbotron-section" },
        React.createElement("div", { className: "jumbotron-section__background" },
            React.createElement(Events, { events: events })),
        React.createElement("div", { className: "jumbotron" },
            React.createElement("img", { src: "splash_3.png", className: "splash rotate", alt: "QuBu - The buzztastic quiz buzzer.", title: "QuBu" }),
            React.createElement("nav", { className: "nav jumbotron__nav" },
                React.createElement("a", { className: "button button--large get-started-button", href: "https://app.qubu.io/" }, "Get started")))));
};
const StatsSection = props => {
    const { stats } = props;
    return (React.createElement("section", { className: "section stats-section" },
        React.createElement(Container, null,
            React.createElement("h2", { className: "heading-2" }, "Stats"),
            React.createElement(Stats, { stats: stats }))));
};
const Stats = props => {
    const { stats } = props;
    return React.createElement("div", { className: "stats" }, stats.map(stat => React.createElement(Stat, { stat: stat, key: stat.metric })));
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
    return React.createElement("div", { className: "stat" },
        React.createElement("span", { className: "stat__count" }, count),
        React.createElement("span", { className: "stat__heading" }, heading));
};
const Header = props => {
    const { year } = props;
    return React.createElement("header", { className: "header" },
        React.createElement("div", { className: "container" },
            React.createElement("nav", { className: "nav" },
                React.createElement("h1", { className: "heading-1" },
                    React.createElement("span", { className: "red-dot" }),
                    React.createElement("span", { className: "" }, " QUBU")),
                React.createElement("menu", { className: "menu" },
                    React.createElement("a", { className: "button get-started-button", href: "https://app.qubu.io/" }, "Get started")))));
};
const Footer = props => {
    const { year } = props;
    return React.createElement("footer", { className: "footer" },
        React.createElement("div", { className: "container" },
            React.createElement("nav", { className: "nav" },
                React.createElement("h3", null,
                    "\u00A9 ",
                    year,
                    " QUBU"))));
};
const Container = props => {
    return React.createElement("div", { className: "container" }, props.children);
};
//# sourceMappingURL=App.js.map