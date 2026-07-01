// import {OWLClass, OWLObjectProperty} from "@beep/ontology/Ontology.models";
import { BunRuntime } from "@effect/platform-bun";
import { Ontology } from "@beep/ontology";
import {
	Console,
	Effect,
	// SchemaGetter,
	//pipe
} from "effect";
import { SchemaUtils } from "@beep/schema";
import { $ScratchpadId } from "@beep/identity"
import { P, O } from "@beep/utils";
import * as S from "effect/Schema";

const $I = $ScratchpadId.create("index")

// const prettyJson = SchemaGetter.stringifyJson({ space: 2 });

// const stringifyPrettyJson = (value: unknown) =>
//   pipe(
//     prettyJson.run(O.some(value), { errors: "all" }),
//     Effect.map(O.getOrElse(() => "undefined"))
//   );

export class DomainError extends S.Class<DomainError>($I`DomainError`)(
	{
		cause: S.Defect({ includeStack: true }).pipe(S.OptionFromOptionalKey, SchemaUtils.withNoneDefault)
	},
	$I.annote("DomainError", {
		description: "A domain error"
	})
) {}

const program = Effect.gen(function* () {
  // const document = S.toJsonSchemaDocument(Ontology.OWLClass);

	const identifier = yield* Ontology.OWLClass.pipe(
		S.resolveAnnotations,
		O.fromNullishOr,
		O.map((annotations) => annotations.identifier),
		O.flatMap(O.liftPredicate(P.isNotUndefined)),
		O.match(
		{
			onNone: () => Effect.fail(DomainError.make()),
			onSome: Effect.succeed,
		}
	));
  yield* Console.log(identifier);
});

BunRuntime.runMain(program);
