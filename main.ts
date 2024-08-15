import { access, constants } from 'node:fs/promises';
import { extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	type ASTPath,
	type Collection,
	type FileInfo,
	type ImportDeclaration,
	default as j,
} from 'jscodeshift';


type ResolvedSpecifier = URL['href'];
type UnresolvedSpecifier = URL['pathname'] | ResolvedSpecifier;

export default function transform(
	file: FileInfo,
) {
	return j(file.source)
		.find(j.ImportDeclaration)
		.filter(specifierContainsJSExt)
		.replaceWith(async (result) => await processSpecifierWithJSExts(result, file.path))
		.toSource();
}

export const specifierContainsJSExt: Parameters<Collection<ImportDeclaration>['filter']>[0] = ({
	value: { source: { value } },
}) => typeof value === 'string' && extname(value) in exts;

const processSpecifierWithJSExts = async (
	match: ASTPath<ImportDeclaration>,
	filePath: FileInfo['path'],
) => {
	const specifier = match.value.source.value;

	log('log', `specifier ${specifier}`);

	if (typeof specifier !== 'string') {
		log('error', `Unexpected '${specifier}' within ${filePath}`)
		return match; // shit happened?
	}

	let replacement = await replaceJSExtWithTSExt(filePath, specifier);

	console.log('replacement', replacement);

	if (replacement) {
		log('log', `replacement found ${replacement}`)
		if (await fexists(filePath, specifier)) {
			log('warn', [
				`Import specifier '${specifier}' within ${filePath} contains a JS extension AND a file`,
				`with the corresponding TS extension exists. Impossible to disambiguate (skipping).`,
			].join(' '));

			return match;
		}

		console.log('using replacement', replacement);
		const reimport = j.importDeclaration(
			[j.importSpecifier(j.identifier(replacement))],
			match.value.source,
		);

		console.log('reimport', reimport)

		return reimport;
	}

	replacement = await replaceJSExtWithTSExt(filePath, specifier, undefined, '.d.ts');

	if (replacement) {
		return j.importDeclaration(
			[j.importSpecifier(j.identifier(replacement))],
			match.value.source,
		);
	}

	log('error', `Could not figure out what to do for '${specifier}' within ${filePath}`);

	return match;
}

const replaceJSExtWithTSExt = async (
	filePath: ResolvedSpecifier,
	specifier: UnresolvedSpecifier,
	oExt = extname(specifier) as JSExts, // Don't like this here
	rExt: TSExts | '.d.ts' = exts[oExt],
) => {
	const specifierWithTSExt = specifier.replace(oExt, rExt!);

	if (await fexists(filePath, specifierWithTSExt)) return specifierWithTSExt;

	return null;
};

const fexists = (
	parent: ResolvedSpecifier,
	specifier: UnresolvedSpecifier,
) => access(
		fileURLToPath(import.meta.resolve(specifier, parent)), // Can't be done before → effects the replacement
		constants.F_OK,
	)
	.then(
		() => true,
		() => false,
	);

const exts = {
	'.cjs': '.cts',
	'.mjs': '.mts',
	'.js': '.ts',
	'.jsx': '.tsx',
} as const;
type JSExts = keyof typeof exts;
type TSExts = typeof exts[JSExts];

const log = (
	type: 'error' | 'log' | 'warn',
	msg: string,
) => console[type](`[Codemod: correct-ts-extensions]: ${msg}`);
