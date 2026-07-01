import {OWLObjectProperty} from "@beep/ontology/Ontology.models";
import { BunRuntime } from "@effect/platform-bun";
import { Ontology } from "@beep/ontology";
import { Console, Effect, SchemaGetter, pipe } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const prettyJson = SchemaGetter.stringifyJson({ space: 2 });

const stringifyPrettyJson = (value: unknown) =>
  pipe(
    prettyJson.run(O.some(value), { errors: "all" }),
    Effect.map(O.getOrElse(() => "undefined"))
  );

const program = Effect.gen(function* () {
  const document = S.toJsonSchemaDocument(Ontology.OWLObjectProperty);

	const identifier = Ontology.GraphInfo.pipe(S.resolveAnnotations, O.fromNullishOr, O.map((annotations) => annotations.identifier), O.getOrThrowWith(

	));
  yield* Console.log(yield* stringifyPrettyJson(document));
});

BunRuntime.runMain(program);
