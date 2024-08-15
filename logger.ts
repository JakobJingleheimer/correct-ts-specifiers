export const logger = (
	type: 'error' | 'log' | 'warn',
	msg: string,
) => console[type](`[Codemod: correct-ts-extensions]: ${msg}`);
