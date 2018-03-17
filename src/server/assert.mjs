
export function assertNotNull(name, value) {
	if (value === null) {
		throwTypeError(name, 'null');
	}
}

export function assertNotUndefined(name, value) {
	if (value === undefined) {
		throwTypeError(name, 'undefined');
	}
}

export function assertNotNullOrUndefined(name, value) {
	assertNotNull(name, value);
	assertNotUndefined(name, value);
}

export function assertNotNullOrUndefineds(values) {
	Object.keys(values).forEach(name => assertNotNullOrUndefined(name, values[name]));
}

export function assertNotEmptyString(name, value) {
	assertString(name, value);

	if (value === '') {
		throwTypeError(name, 'string');
	}
}

export function assertNotEmptyStrings(values) {
	Object.keys(values).forEach(name => assertNotEmptyString(name, values[name]));
}

export function assertString(name, value) {
	assertTypeOf(name, value, 'string');
}

export function assertStrings(values) {
	Object.keys(values).forEach(name => assertString(name, values[name]));
}

export function assertObject(name, value) {
	assertTypeOf(name, value, 'object');
}

export function assertObjects(values) {
	Object.keys(values).forEach(name => assertObject(name, values[name]));
}

export function assertNotNullObject(name, value) {
	assertNotNull(name, value);
	assertObject(name, value);
}

export function assertNotNullObjects(values) {
	Object.keys(values).forEach(name => assertNotNullObject(name, values[name]));
}

export function assertNumber(name, value) {
	assertTypeOf(name, value, 'number');
}

export function assertNumbers(values) {
	Object.keys(values).forEach(name => assertNumber(name, values[name]));
}

export function assertBoolean(name, value) {
	assertTypeOf(name, value, 'boolean');
}

export function assertBooleans(values) {
	Object.keys(values).forEach(name => assertBoolean(name, values[name]));
}

export function assertDate(name, value) {
	assertInstanceOf(name, value, Date);
}

export function assertDates(values) {
	Object.keys(values).forEach(name => assertDate(name, values[name]));
}

export function assertArray(name, value) {
	assertInstanceOf(name, value, Array);
}

export function assertArrays(values) {
	Object.keys(values).forEach(name => assertArray(name, values[name]));
}

export function assertFunction(name, value) {
	assertTypeOf(name, value, 'function');
}

export function assertFunctions(values) {
	Object.keys(values).forEach(name => assertFunction(name, values[name]));
}

export function assertInstanceOf(name, value, type) {
	if (!(value instanceof type)) {
		throwTypeError(name, type);
	}
}

export function assertInstanceOfs(values, type) {
	Object.keys(values).forEach(name => assertInstanceOf(name, values[name], type));
}

export function assertTypeOf(name, value, type) {
	if (typeof value !== type) {
		throwTypeError(name, type);
	}
}

export function assertTypeOfs(values, type) {
	Object.keys(values).forEach(name => assertTypeOf(name, values[name], type));
}

function throwTypeError(name, type) {
	throw new TypeError(`${name} is not a(n) ${type}`);
}