/**
 * @param {'error' | 'log' | 'warn'} type
 * @param {string} msg
 */
export const logger = (
	type,
	msg,
) => console[type](`[Codemod: correct-ts-extensions]: ${msg}`);
