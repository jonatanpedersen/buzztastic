export interface Event {
	type: string,
	data: number,
	created: Date
}

export interface Stat {
	metric: string,
	count: number
}

export interface Quiz {
	quizId : string,
	code : string,
	name : string,
	teams : Team[],
	players : Player[],
	rounds : Round[],
	currentRoundId : string
	created : Date,
	updated : Date
}

export interface Player {
	playerId : string,
	name : string,
	teamId : string,
	created : Date,
	updated : Date
}

export interface Team {
	teamId : string,
	name : string,
	created : Date
}

export interface Round {
	roundId : string,
	buzzes: Buzz[],
	created : Date
}

export interface Buzz {
	buzzId : string,
	playerId : string,
	teamId : string,
	roundId : string,
	created : Date
}