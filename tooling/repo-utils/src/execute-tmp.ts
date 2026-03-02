import * as TSMorph from "ts-morph";
import { Console } from "effect";
import * as A from "effect/Array";
import { BunRuntime } from "@effect/platform-bun";

const project = new TSMorph.Project({
	tsConfigFilePath: "/home/elpresidank/YeeBois/projects/beep-effect3/tooling/repo-utils/tsconfig.json",
	libFolderPath: "/home/elpresidank/YeeBois/projects/beep-effect3/node_modules/typescript/lib"
})

const JSDocFilePath = "/home/elpresidank/YeeBois/projects/beep-effect3/tooling/repo-utils/src/JSDoc/JSDoc.ts";

const getJSDocParamJsDocs = () => {
	const sourceFile = project.getSourceFileOrThrow(JSDocFilePath);
	const jsDocParamClass = sourceFile.getClassOrThrow("JSDocParam");

	return A.map(jsDocParamClass.getJsDocs(), (jsDoc) => jsDoc.getStructure());
};

const program = Console.log(JSON.stringify(getJSDocParamJsDocs(), null, 2));

BunRuntime.runMain(program);
