import type { _DefaultCamelCaseOptions, CamelCaseOptions } from "./camel-case";
import type { ApplyDefaultOptions } from "./internal/index";
import type { PascalCase } from "./pascal-case";

/**
Convert object properties to pascal case but not recursively.

This can be useful when, for example, converting some API types from a different style.

@see {@link PascalCase}
@see {@link PascalCasedPropertiesDeep}

@example
```
import type {PascalCasedProperties} from 'type-fest';

type User = {
	userId: number;
	userName: string;
};

const result: PascalCasedProperties<User> = {
	UserId: 1,
	UserName: 'Tom',
};

const preserveConsecutiveUppercase: PascalCasedProperties<{fooBAR: string}, {preserveConsecutiveUppercase: true}> = {
	FooBAR: 'string',
};
```

@category Change case
@category Template literal
@category Object
*/
export type PascalCasedProperties<Value, Options extends CamelCaseOptions = {}> = Value extends Function
  ? Value
  : Value extends Array<infer _U>
    ? Value
    : {
        [K in keyof Value as PascalCase<
          K,
          ApplyDefaultOptions<CamelCaseOptions, _DefaultCamelCaseOptions, Options>
        >]: Value[K];
      };
