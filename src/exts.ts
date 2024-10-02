export const jsToTSExts = {
	'.cjs': '.cts',
	'.mjs': '.mts',
	'.js': '.ts',
	'.jsx': '.tsx',
} as const;
export const suspectExts = {
	'': '.js',
	...jsToTSExts,
} as const;
export type SuspectExt = keyof typeof suspectExts;
export type JSExt = keyof typeof jsToTSExts;
export const jsExts = Object.keys(jsToTSExts) as Array<JSExt>;
export const tsExts = Object.values(jsToTSExts);
export type TSExt = typeof tsExts[number];

export const dExts = [
	'.d.cts',
	'.d.ts',
	'.d.mts',
] as const;
export type DExt = typeof dExts[number];

export const extSets = new Set([
	jsExts,
	tsExts,
	dExts,
]);
