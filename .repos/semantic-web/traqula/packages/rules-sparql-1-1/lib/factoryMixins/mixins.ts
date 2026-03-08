/**
 * We use mixins as explained by the official TypeScript documentation:
 * https://www.typescriptlang.org/docs/handbook/mixins.html
 * Mixins are used so we can split into many files.
 * Additionally, it allows type guards and generics, which the is not possible using the indirection builder.
 */

export type Constructor<T = object> = new (...args: any[]) => T;

export type Mixin<Base = object, U extends Base = Base> = (superclass: Constructor<Base>) => Constructor<U>;

export function asArg<T>(arg: T): FlatCall<T> {
  return new FlatCall<T>(arg);
}

class FlatCall<Input> {
  public constructor(private input: Input) {}
  public call<Out>(func: (input: Input) => Out): FlatCall<Out> {
    this.input = <Input> <unknown> func(this.input);
    return <FlatCall<Out>> <unknown> this;
  }

  public returns(): Input {
    return this.input;
  }
}
