import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { invariant } from "@/app/tech-interview/invariant";
export const errorMessageWithFormattedIssue = F.flow((message) => (issue) => F.pipe(message, Str.concat(`: ${ParseResult.TreeFormatter.formatIssueSync(issue)}`)));
export class EntityIdFormatSchema extends S.NonEmptyTrimmedString.pipe(S.pattern(/^[^\x00-\x1F\x7F]+$/, {
    message: errorMessageWithFormattedIssue("EntityId must not contain control characters")
}), 
// alpha characters only refinement
S.pattern(/^[a-zA-Z]+$/, {
    message: errorMessageWithFormattedIssue("EntityId must be alpha characters only")
}), S.capitalized({ message: errorMessageWithFormattedIssue("EntityId must be capitalized") }), S.endsWith("Id", {
    message: errorMessageWithFormattedIssue("EntityId must end with `Id`")
})) {
    static enforceInvariant = (input) => {
        invariant(S.is(EntityIdFormatSchema)(input), "[Invariant Violation]: Invalid EntityId format");
        return input;
    };
}
const makeEntityIdTitleAnnotation = (brand) => F.pipe(F.pipe(brand, Str.split("Id"), A.head), O.getOrThrowWith(() => new Error("Invalid EntityId Format")), (entityName) => Str.concat(" Id")(Str.capitalize(entityName)));
export const makeEntityId = (brand, annotations) => {
    EntityIdFormatSchema.enforceInvariant(brand);
    return S.NonNegativeInt.pipe(S.brand(brand)).annotations({
        identifier: brand,
        title: makeEntityIdTitleAnnotation(brand),
        description: annotations.description,
        arbitrary: () => (fc) => fc.integer({
            min: 0,
            max: Number.MAX_SAFE_INTEGER,
        }).map((i) => i)
    });
};
//# sourceMappingURL=utils.js.map