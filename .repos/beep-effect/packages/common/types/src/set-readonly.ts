import type { Except } from "./except";
import type { HomomorphicPick } from "./internal/index";
import type { Simplify } from "./simplify";

/**
Create a type that makes the given keys readonly. The remaining keys are kept as is.

Use-case: You want to define a single model where the only thing that changes is whether or not some of the keys are readonly.

@example
```
import type {SetReadonly} from 'type-fest';

type Foo = {
	a: number;
	readonly b: string;
	c: boolean;
};

type SomeReadonly = SetReadonly<Foo, 'b' | 'c'>;
// type SomeReadonly = {
// 	a: number;
// 	readonly b: string; // Was already readonly and still is.
// 	readonly c: boolean; // Is now readonly.
// }
```

@category Object
*/
// biome-ignore lint/suspicious/noExplicitAny: Required for matching function types in type utilities
export type SetReadonly<BaseType, Keys extends keyof BaseType> = (BaseType extends (...arguments_: never) => any
  ? (...arguments_: Parameters<BaseType>) => ReturnType<BaseType>
  : unknown) &
  _SetReadonly<BaseType, Keys>;

export type _SetReadonly<BaseType, Keys extends keyof BaseType> = BaseType extends unknown // To distribute `BaseType` when it's a union type.
  ? Simplify<Except<BaseType, Keys> & Readonly<HomomorphicPick<BaseType, Keys>>>
  : never;
