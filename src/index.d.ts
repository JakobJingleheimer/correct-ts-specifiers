// import type { sep } from 'node:path';
/**
 * @example 'foo'
 */
type FSPathSegment = string;
/**
 * @example '/foo/bar.js'
 */
// export type FSAbsolutePath = string & `${typeof sep}${FSPathSegment}`;
export type FSAbsolutePath = string;
/**
 * @example 'file:///foo/bar.js'
 */
export type ResolvedSpecifier = URL['href'];
/**
 * @example './bar.js'
 */
export type Specifier = URL['pathname'] | ResolvedSpecifier;

export type NodeError = Error & { code?: string };
