function returnBody(response) {
	return response.body;
}

function checkStatus(response) {
	if (response.status >= 200 && response.status < 300) {
		return response;
	} else {
		let error = new Error(response.statusText);
		error.response = response;
		throw error;
	}
}

function parseJSON(response) {
	return response.json()
		.then(body => {
			response.body = body;
			return response;
		})
		.catch((err) => {
			return response;
		});
}