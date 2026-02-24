import type { _DefaultCamelCaseOptions, CamelCase, CamelCaseOptions } from "./camel-case";
import type { ApplyDefaultOptions } from "./internal/index";

/**
Convert object properties to camel case but not recursively.

This can be useful when, for example, converting some API types from a different style.

@see {@link CamelCasedPropertiesDeep}
@see {@link CamelCase}

@example
```
import type {CamelCasedProperties} from 'type-fest';

type User = {
	UserId: number;
	UserName: string;
};

const result: CamelCasedProperties<User> = {
	userId: 1,
	userName: 'Tom',
};

const preserveConsecutiveUppercase: CamelCasedProperties<{fooBAR: string}, {preserveConsecutiveUppercase: true}> = {
	fooBAR: 'string',
};
```

@category Change case
@category Template literal
@category Object
*/
export type CamelCasedProperties<Value, Options extends CamelCaseOptions = {}> = Value extends Function
  ? Value
  : Value extends Array<infer _U>
    ? Value
    : {
        [K in keyof Value as CamelCase<
          K,
          ApplyDefaultOptions<CamelCaseOptions, _DefaultCamelCaseOptions, Options>
        >]: Value[K];
      };
