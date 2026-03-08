import type { IndirDef, IndirDefArg, IndirectionMap } from './helpers.js';

export class DynamicIndirect<Context, Names extends string, RuleDefs extends IndirectionMap<Names>> {
  protected __context: Context | undefined = undefined;

  public constructor(protected rules: RuleDefs) {
    for (const rule of Object.values(<Record<string, IndirDef<Context>>>rules)) {
      this[<keyof (typeof this)>rule.name] = <any> ((context: Context, ...args: any): any => {
        this.setContext(context);
        return this.subrule(rule, ...args);
      });
    }
  }

  public setContext(context: Context): void {
    this.__context = context;
  }

  protected getSafeContext(): Context {
    return <Context> this.__context;
  }

  protected readonly subrule: IndirDefArg['SUBRULE'] = (cstDef, ...args) => {
    const def = this.rules[<Names> <unknown> cstDef.name];
    if (!def) {
      throw new Error(`Rule ${cstDef.name} not found`);
    }

    return <any> def.fun({
      SUBRULE: this.subrule,
    })(this.getSafeContext(), ...args);
  };
}
