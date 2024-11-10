import { pathToFileURL } from 'node:url';

import type { NodeError } from './index.d.ts';


export const getNotFoundUrl = (err: NodeError) => pathToFileURL(err?.url ?? err.message.split('\'')[1])?.href;
