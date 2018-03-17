import nodeFetch from 'node-fetch';
import chai from 'chai';

const { expect } = chai;

export function describeHttpTests (tests) {
	tests.forEach(test => {
		let describeTest;

		if (test.skip) {
			describeTest = describe.skip;
		} else if (test.only) {
			describeTest = describe.only;
		} else {
			describeTest = describe;
		}

		describeTest(test.description, () => {
			let response, requestUrl;

			before(() => {
				const url = isFunction(test.request.url) ? test.request.url(tests) : test.request.url;

				return nodeFetch(url, {
					method: test.request.method,
					headers: {
						'Accepts': 'application/json',
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(test.request.body)
				})
				.then(_response => response = _response);
			});

			describe('response', () => {
				if (test.response.status) {
					describe('status', () => {
						let status;

						before(() => {
							status = response.status;
						});

						it(`should eql ${test.response.status}`, () => {
							expect(status).to.eql(test.response.status);
						});
					});
				}

				if (test.response.statusText) {
					describe('statusText', () => {
						let statusText;

						before(() => {
							statusText = response.statusText;
						});

						it(`should eql ${test.response.statusText}`, () => {
							expect(statusText).to.eql(test.response.statusText);
						});
					});
				}

				if (test.response.headers) {
					describe('headers', () => {
						let headers;

						before(() => {
							headers = response.headers;
						});

						Object.keys(test.response.headers).forEach(header => {
							describe(header, () => {
								let expected = test.response.headers[header];
								expected = Array.isArray(expected) ? expected : [expected];
								let actual;

								before(() => {
									actual = headers.getAll(header);
									actual = Array.isArray(actual) ? actual : [actual];
								});

								it(`should eql ${expected}`, () => {
									expect(actual).to.eql(expected);
								});
							});
						});
					});
				}

				if (test.response.body) {
					describe('body', () => {
						let responseBody;

						before(() => {
							return response.json().then(obj => responseBody = obj);
						});

						it(`should eql ${test.response.body}`, () => {
							expect(responseBody).to.deep.eql(test.response.body);
						});
					});
				}
			});
		});
	});
}

function isFunction(functionToCheck) {
	return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}