import { AsyncReducerFunction, HttpContext } from '@jambon/core';
import { join, parse as parsePath } from 'path';
import { parse as parseUrl } from 'url';
import { createReadStream, readFileSync, statSync } from 'fs';
import { renderFile } from 'pug';

export function pug (file : string) : AsyncReducerFunction {
	return async function pug (context : HttpContext) : Promise<HttpContext> {
		return {
			...context,
			response: {
				...context.response,
				body: new Buffer(renderFile(file, context))
			}
		};
	}
}
