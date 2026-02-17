import * as O from "effect/Option";
import {readStringProp} from "./readStringProp.ts";
import {resolveStringOrUnknown} from "./resolveStringOrUnknown";

interface ModelMetadata {
    readonly provider: string;
    readonly model: string;
}

export const getModelMetadata = (model: unknown): ModelMetadata => ({
    provider: resolveStringOrUnknown(O.orElse(readStringProp(model, "provider"), () => readStringProp(model, "_tag"))),
    model: resolveStringOrUnknown(
        O.orElse(
            O.orElse(readStringProp(model, "model"), () => readStringProp(model, "modelId")),
            () => readStringProp(model, "id")
        )
    ),
})
