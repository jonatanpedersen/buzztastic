import * as nodeFetch from 'node-fetch';
import * as chai from 'chai';
import * as createDebug from 'debug';

const { expect } = chai;

export function describeHttpTests (tests) {
	const debug = createDebug('test');

	const context = {};

	tests.forEach(test => {
		test = context[test.id] = {...test};

		let describeTest;

		if (test.skip) {
			describeTest = describe.skip;
		} else if (test.only) {
			describeTest = describe.only;
		} else {
			describeTest = describe;
		}

		describeTest(test.description, () => {
			let requestUrl;

			before(async () => {
				const url = isFunction(test.request.url) ? test.request.url(context) : test.request.url;

				const requestBody = evalObj(test.request.body);

				function evalObj (obj) {
					if (obj === null || obj === undefined) {
						return;
					}

					for (const key in obj) {
						const value = obj[key];

						if (isFunction(value)) {
							obj = { ...obj, [key]: value(context) };
						} else if (typeof value === 'object') {
							obj = { ...obj, [key]: evalObj(value) };
						}
					}

					return obj;
				}

				const request = [url, {
					method: test.request.method,
					headers: {
						'Accepts': 'application/json',
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(requestBody)
				}];

				const response = await nodeFetch(...request);
				const { status, statusText, headers } = response;
				const body = await response.json();

				test.actualResponse = { status, statusText, headers, body };

				debug('%O', test);
			});

			describe('response', () => {
				if (test.response.status) {
					let status;

					before(() => {
						status = test.actualResponse.status;
					});

					describe('status', () => {
						it(`should eql ${test.response.status}`, () => {
							expect(status).to.eql(test.response.status);
						});
					});
				}

				if (test.response.statusText) {
					let statusText;

					before(() => {
						statusText = test.actualResponse.statusText;
					});

					describe('statusText', () => {
						it(`should eql ${test.response.statusText}`, () => {
							expect(statusText).to.eql(test.response.statusText);
						});
					});
				}

				if (test.response.headers) {
					describe('headers', () => {
						let headers;

						before(() => {
							headers = test.actualResponse.headers;
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
						let actualObject;

						before(() => {
							actualObject = test.actualResponse.body;
						});

						describeObject(test.response.body);

						function describeObject (expectedObject) {
							if (expectedObject === null || expectedObject === undefined) {
								return;
							}

							for (const key in expectedObject) {
								describe(key, () => {
									const expected = expectedObject[key];

									let actualValue;

									before(() => {
										actualValue = actualObject[key];
									});

									if (expected instanceof RegExp) {
										it(`should match ${expected}`, () => {
											expect(actualValue).to.match(expected);
										});
									} else if (isFunction(expected)) {
										let expectedValue;

										before(() => {
											expectedValue = expected({...context, actualValue });
										});

										it(`should eql ${expected}`, () => {
											expect(actualValue).to.eql(expectedValue);
										});
									} else if (typeof expected === 'object') {
										describeObject(object);
									} else {
										it(`should equal "${expected}"`, () => {
											expect(actualValue).to.eql(expected);
										});
									}
								});
							}
						}
					});
				}
			});
		});
	});
}

function isFunction(functionToCheck) {
	return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}