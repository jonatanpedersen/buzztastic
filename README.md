# buzztastic

The Buzztastic Quiz Buzzer

## API

### Create Quiz `POST /api/quizes`

Request Body:

``` json
{
	"name": "Bananas"
}
```

Response Body:

``` json
{
	"quizId": "b0ad66ee-6001-4be8-8a88-9e03dda3c699"
}
```

### Get Quiz `GET /api/quizes/:quizId`

Response Body:

``` json
{
	"quizId": "b0ad66ee-6001-4be8-8a88-9e03dda3c699",
	"name": "H4ck th3 pl4n3t",
	"players": [
		{
			"playerId": "b2100f76-3ff2-4225-822a-bf118b9937d3",
			"name": "Super Coder",
			"teamId": "d363e891-f531-4157-ac89-9122309d1bbd",
			"created": "2018-03-16T14:54:08.577Z"
		}
	],
	"teams": [
		{
			"teamId": "d363e891-f531-4157-ac89-9122309d1bbd",
			"name": "Team Awesome",
			"created": "2018-03-16T14:54:08.577Z"
		}
	],
	"rounds": [
		{
			"roundId": "4e74a3ac-92b0-456a-b4a8-b790e2974f44",
			"created": "2018-03-16T16:35:45.858Z",
			"buzzes": [
				{
					"buzzId": "1fa1245e-f994-4ac1-b201-d47ac4e08f4f",
					"playerId": "b2100f76-3ff2-4225-822a-bf118b9937d3",
					"teamId": "d363e891-f531-4157-ac89-9122309d1bbd",
					"created": "2018-03-16T17:19:01.470Z"
				}
			]
		}
	]
}
```

### Create Quiz Team `POST /api/quizes/:quizId/teams`

Request Body:

``` json
{
	"name": "Team Awesome"
}
```

Response Body:

``` json
{
	"quizId": "b0ad66ee-6001-4be8-8a88-9e03dda3c699",
	"teamId": "d363e891-f531-4157-ac89-9122309d1bbd"
}
```

### Create Quiz Player `POST /api/quizes/:quizId/players`

Request Body:

``` json
{
	"name": "Super Coder",
	"teamId": "d363e891-f531-4157-ac89-9122309d1bbd"
}
```

Response Body:

``` json
{
	"quizId": "b0ad66ee-6001-4be8-8a88-9e03dda3c699",
	"playerId": "b2100f76-3ff2-4225-822a-bf118b9937d3"
}
```

### Update Quiz Player `PUT /api/quizes/:quizId/players/:playerId`

Request Body:

``` json
{
	"name": "Really Super Coder",
	"teamId": "d363e891-f531-4157-ac89-9122309d1bbd"
}
```

Response Body:

``` json
{
	"quizId": "b0ad66ee-6001-4be8-8a88-9e03dda3c699",
	"playerId": "b2100f76-3ff2-4225-822a-bf118b9937d3"
}
```

### Delete Quiz Player `DELETE /api/quizes/:quizId/players/:playerId`

### Create Quiz Round `POST /api/quizes/:quizId/rounds`
Creates a new round and sets `currentRouteId` to the new rounds Id.

Response Body:

``` json
{
	"quizId": "b0ad66ee-6001-4be8-8a88-9e03dda3c699",
	"roundId": "4e74a3ac-92b0-456a-b4a8-b790e2974f44"
}
```

### Create Quiz Round Buzz `POST /api/quizes/:quizId/rounds/current/buzzes`

Request Body:

``` json
{
	"playerId": "b2100f76-3ff2-4225-822a-bf118b9937d3",
	"teamId": "d363e891-f531-4157-ac89-9122309d1bbd"
}
```

Response Body:

``` json
{
	"quizId": "b0ad66ee-6001-4be8-8a88-9e03dda3c699",
	"roundId": "4e74a3ac-92b0-456a-b4a8-b790e2974f44",
	"buzzId": "1fa1245e-f994-4ac1-b201-d47ac4e08f4f"
}
```