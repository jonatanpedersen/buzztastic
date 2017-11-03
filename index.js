const express = require('express');
const {MongoClient} = require('mongodb');
const {callbackify} = require('util');
const bodyParser = require('body-parser');

async function main () {
	try {
		const app = express();
		app.use(bodyParser.json());
		const mongodbConnectionString = process.env.MONGODB_URI || 'mongodb://localhost/buzztastic';
		const db = await MongoClient.connect(mongodbConnectionString);
		const buttons = db.collection('buttons');

		app.get('/api/buttons', callbackify(async (req, res) => {
			const _buttons = buttons.find({}, {_id: 0, buttonId: 1, name: 1}).toArray();

			res.json(_buttons);
		}));

		app.put('/api/buttons/:buttonId', callbackify(async (req, res) => {
			const {buttonId} = req.params;
			const {name} = req.body;
			const button = {buttonId, name, presses: []};

			await buttons.insert(button);

			res.json(button);
		}));

		app.post('/api/buttons/:buttonId/presses', callbackify(async (req, res) => {
			const {buttonId} = req.params;

			await buttons.updateOne({buttonId}, {
				$push: {
					presses: {
						timestamp: new Date()
					}
				}
			});
		}));

		app.use((err, req, res, next) => {
			res.status(500).json({err: err.message});
		})

		const port = process.env.PORT || 1432;
		app.listen(port, () => {
			console.info(`Listening on port ${port}`);
		});
	}
	catch (err) {
		console.error(err, err.stack);

		process.exit(1);
	}
}

main();