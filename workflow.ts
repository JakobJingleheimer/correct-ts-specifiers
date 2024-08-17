import type { Api } from "@codemod.com/workflow";

import { mapImports } from 'map-imports.ts';


export async function workflow({ contexts, files }: Api) {
	await files("**/*.{cjs,mjs,js,jsx,(d.)?cts,(d.)?mts,(d.)?ts,tsx}").jsFam(async ({ astGrep }) => {
		const filepath = contexts.getFileContext().file; // absolute fs path
    await astGrep`rule:
  any:
    - kind: import_statement
    - kind: export_statement
      has:
        kind: string`
		.replace(async ({ getNode }) => {
      const statement = getNode();
      const importSpecifier = statement.find({
        rule: {
          kind: "string_fragment",
          inside: {
            kind: "string",
          },
        },
      });

      if (!importSpecifier) return;

      const { isType, replacement } = await mapImports(filepath, importSpecifier.text());

      if (!replacement) return;

      const edits = [importSpecifier.replace(replacement)];

      if (
        isType
        &&
        !statement.children().some((node) => node.kind() === 'type')
      ) {
        const clause = statement.find({
          rule: {
            any: [
              { kind: 'import_clause' },
              { kind: 'export_clause' },
            ],
          },
        });

        if (clause) edits[1] = clause.replace(`type ${clause.text()}`);
      }

      return statement.commitEdits(edits);
    });
  });
}
