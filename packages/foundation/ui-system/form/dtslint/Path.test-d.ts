import { getNestedValue, setNestedValue } from "@beep/form/core/Path";
import type { PathErrorMap, Paths, PathValidationResult } from "@beep/form/core/Path";

type ProfileForm = {
  readonly user: {
    readonly name: string;
    readonly addresses: ReadonlyArray<{
      readonly city: string;
    }>;
  };
  readonly tags: ReadonlyArray<string>;
};

const rootPath = "user" satisfies Paths<ProfileForm>;
const nestedPath = "user.name" satisfies Paths<ProfileForm>;
const bracketArrayPath = "user.addresses[0].city" satisfies Paths<ProfileForm>;
const dotArrayPath = "user.addresses.0.city" satisfies Paths<ProfileForm>;
const scalarArrayPath = "tags[0]" satisfies Paths<ProfileForm>;

const errors = {
  "": "Fix the highlighted fields.",
  "user.name": "Required",
  "user.addresses[0].city": "Required",
} satisfies PathErrorMap<ProfileForm>;

const validationResult = {
  tags: "Choose at least one tag.",
} satisfies NonNullable<PathValidationResult<ProfileForm>>;

getNestedValue({ user: { name: "Ada", addresses: [{ city: "London" }] }, tags: ["vip"] }, bracketArrayPath);
setNestedValue(
  { user: { name: "Ada", addresses: [{ city: "London" }] }, tags: ["vip"] },
  { path: nestedPath, value: "Grace" }
);

// @ts-expect-error Paths reject unknown object keys.
const missingObjectPath = "user.missing" satisfies Paths<ProfileForm>;

// @ts-expect-error Paths reject unknown nested object keys after an array segment.
const missingArrayChildPath = "user.addresses[0].postalCode" satisfies Paths<ProfileForm>;

// @ts-expect-error Data-first getters reject unknown paths.
getNestedValue({ user: { name: "Ada", addresses: [{ city: "London" }] }, tags: ["vip"] }, "user.missing");

// @ts-expect-error Path error maps reject unknown keys.
const invalidErrors = { "user.missing": "Nope" } satisfies PathErrorMap<ProfileForm>;

void rootPath;
void dotArrayPath;
void scalarArrayPath;
void errors;
void validationResult;
void missingObjectPath;
void missingArrayChildPath;
void invalidErrors;
