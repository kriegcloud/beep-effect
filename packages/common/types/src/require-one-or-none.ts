import type { If } from "./if";
import type { IfNotAnyOrNever, RequireNone } from "./internal/index";
import type { IsAny } from "./is-any";
import type { IsNever } from "./is-never";
import type { RequireExactlyOne } from "./require-exactly-one";

/**
Create a type that requires exactly one of the given keys and disallows more, or none of the given keys. The remaining keys are kept as is.

@example
```
import type {RequireOneOrNone} from 'type-fest';

type Responder = RequireOneOrNone<{
	text: () => string;
	json: () => string;
	secure: boolean;
}, 'text' | 'json'>;

const responder1: Responder = {
	secure: true,
};

const responder2: Responder = {
	text: () => '{"message": "hi"}',
	secure: true,
};

const responder3: Responder = {
	json: () => '{"message": "ok"}',
	secure: true,
};
```

@category Object
*/
export type RequireOneOrNone<ObjectType, KeysType extends keyof ObjectType = keyof ObjectType> = IfNotAnyOrNever<
  ObjectType,
  If<IsNever<KeysType>, ObjectType, _RequireOneOrNone<ObjectType, If<IsAny<KeysType>, keyof ObjectType, KeysType>>>
>;

type _RequireOneOrNone<ObjectType, KeysType extends keyof ObjectType> = (
  | RequireExactlyOne<ObjectType, KeysType>
  | RequireNone<KeysType>
) &
  Omit<ObjectType, KeysType>; // Ignore unspecified keys.
