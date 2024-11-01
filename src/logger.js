import process from 'node:process';


/**
 * @typedef {string} LogMsg
 */
/**
 * @typedef {'error' | 'log' | 'warn'} LogType
 */
/**
 * Collect log entries and report them at the end, collated by source module.
 *
 * @param {URL['pathname']} source
 * @param {LogType} type
 * @param {LogMsg} msg
 */
export const logger = (
	source,
	type,
	msg,
) => {
	const fileLog = new Set(logs.has(source) ? logs.get(source) : []);

	fileLog.add({ msg, type });
	logs.set(source, fileLog);
};

/**
 * @type {Map<URL['pathname'], Set<Record<LogMsg, LogType>>>}
 */
const logs = new Map();

process.once('beforeExit', emitLogs);

function emitLogs() {
	let hasError = false;

	for (const [sourceFile, fileLog] of logs.entries()) {
		console.log('[Codemod: correct-ts-extensions]:', sourceFile)
		for (const { msg, type } of fileLog) {
			console[type](' •', msg);
			if (type === 'error') hasError = true;
		}
	}

	if (hasError) {
		console.error('[Codemod: correct-ts-extensions]: migration incomplete!');
		process.exitCode = 1;
	}
	else {
		process.exitCode = 0;
		console.log('[Codemod: correct-ts-extensions]: migration complete!');
	}
}
