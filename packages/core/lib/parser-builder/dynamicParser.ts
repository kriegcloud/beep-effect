import { EmbeddedActionsParser } from '@traqula/chevrotain';
import type { IParserConfig, TokenVocabulary } from '@traqula/chevrotain';
import type { ParseRuleMap } from './builderTypes.js';
import type { CstDef, ImplArgs, ParserRule } from './ruleDefTypes.js';

export class DynamicParser<Context, Names extends string, RuleDefs extends ParseRuleMap<Names>>
  extends EmbeddedActionsParser {
  private context: Context | undefined;

  public setContext(context: Context): void {
    this.context = context;
  }

  public constructor(rules: RuleDefs, tokenVocabulary: TokenVocabulary, config: IParserConfig = {}) {
    super(tokenVocabulary, {
      // RecoveryEnabled: true,
      maxLookahead: 1,
      skipValidations: true,
      dynamicTokensEnabled: false,
      ...config,
    });
    this.context = undefined;
    const selfRef = this.constructSelfRef();
    const implArgs: ImplArgs = {
      ...selfRef,
      cache: new WeakMap(),
    };

    for (const rule of Object.values(<Record<string, ParserRule<Context>>>rules)) {
      // Function implementation itself - this function is called AFTER lexing
      this[<keyof (typeof this)>rule.name] = <any> this.RULE(rule.name, rule.impl(implArgs));
    }
    this.performSelfAnalysis();
  }

  private constructSelfRef(): CstDef {
    const subRuleImpl = (chevrotainSubrule: typeof this.SUBRULE): CstDef['SUBRULE'] =>
      ((cstDef, ...arg) =>
        chevrotainSubrule(<any> this[<keyof (typeof this)>cstDef.name], <any>{ ARGS: [ this.context, ...arg ]})
      ) satisfies CstDef['SUBRULE'];
    return {
      CONSUME: (tokenType, option) => this.CONSUME(tokenType, option),
      CONSUME1: (tokenType, option) => this.CONSUME1(tokenType, option),
      CONSUME2: (tokenType, option) => this.CONSUME2(tokenType, option),
      CONSUME3: (tokenType, option) => this.CONSUME3(tokenType, option),
      CONSUME4: (tokenType, option) => this.CONSUME4(tokenType, option),
      CONSUME5: (tokenType, option) => this.CONSUME5(tokenType, option),
      CONSUME6: (tokenType, option) => this.CONSUME6(tokenType, option),
      CONSUME7: (tokenType, option) => this.CONSUME7(tokenType, option),
      CONSUME8: (tokenType, option) => this.CONSUME8(tokenType, option),
      CONSUME9: (tokenType, option) => this.CONSUME9(tokenType, option),
      OPTION: actionORMethodDef => this.OPTION(actionORMethodDef),
      OPTION1: actionORMethodDef => this.OPTION1(actionORMethodDef),
      OPTION2: actionORMethodDef => this.OPTION2(actionORMethodDef),
      OPTION3: actionORMethodDef => this.OPTION3(actionORMethodDef),
      OPTION4: actionORMethodDef => this.OPTION4(actionORMethodDef),
      OPTION5: actionORMethodDef => this.OPTION5(actionORMethodDef),
      OPTION6: actionORMethodDef => this.OPTION6(actionORMethodDef),
      OPTION7: actionORMethodDef => this.OPTION7(actionORMethodDef),
      OPTION8: actionORMethodDef => this.OPTION8(actionORMethodDef),
      OPTION9: actionORMethodDef => this.OPTION9(actionORMethodDef),
      OR: altsOrOpts => this.OR(altsOrOpts),
      OR1: altsOrOpts => this.OR1(altsOrOpts),
      OR2: altsOrOpts => this.OR2(altsOrOpts),
      OR3: altsOrOpts => this.OR3(altsOrOpts),
      OR4: altsOrOpts => this.OR4(altsOrOpts),
      OR5: altsOrOpts => this.OR5(altsOrOpts),
      OR6: altsOrOpts => this.OR6(altsOrOpts),
      OR7: altsOrOpts => this.OR7(altsOrOpts),
      OR8: altsOrOpts => this.OR8(altsOrOpts),
      OR9: altsOrOpts => this.OR9(altsOrOpts),
      MANY: actionORMethodDef => this.MANY(actionORMethodDef),
      MANY1: actionORMethodDef => this.MANY1(actionORMethodDef),
      MANY2: actionORMethodDef => this.MANY2(actionORMethodDef),
      MANY3: actionORMethodDef => this.MANY3(actionORMethodDef),
      MANY4: actionORMethodDef => this.MANY4(actionORMethodDef),
      MANY5: actionORMethodDef => this.MANY5(actionORMethodDef),
      MANY6: actionORMethodDef => this.MANY6(actionORMethodDef),
      MANY7: actionORMethodDef => this.MANY7(actionORMethodDef),
      MANY8: actionORMethodDef => this.MANY8(actionORMethodDef),
      MANY9: actionORMethodDef => this.MANY9(actionORMethodDef),
      MANY_SEP: options => this.MANY_SEP(options),
      MANY_SEP1: options => this.MANY_SEP1(options),
      MANY_SEP2: options => this.MANY_SEP2(options),
      MANY_SEP3: options => this.MANY_SEP3(options),
      MANY_SEP4: options => this.MANY_SEP4(options),
      MANY_SEP5: options => this.MANY_SEP5(options),
      MANY_SEP6: options => this.MANY_SEP6(options),
      MANY_SEP7: options => this.MANY_SEP7(options),
      MANY_SEP8: options => this.MANY_SEP8(options),
      MANY_SEP9: options => this.MANY_SEP9(options),
      AT_LEAST_ONE: actionORMethodDef => this.AT_LEAST_ONE(actionORMethodDef),
      AT_LEAST_ONE1: actionORMethodDef => this.AT_LEAST_ONE1(actionORMethodDef),
      AT_LEAST_ONE2: actionORMethodDef => this.AT_LEAST_ONE2(actionORMethodDef),
      AT_LEAST_ONE3: actionORMethodDef => this.AT_LEAST_ONE3(actionORMethodDef),
      AT_LEAST_ONE4: actionORMethodDef => this.AT_LEAST_ONE4(actionORMethodDef),
      AT_LEAST_ONE5: actionORMethodDef => this.AT_LEAST_ONE5(actionORMethodDef),
      AT_LEAST_ONE6: actionORMethodDef => this.AT_LEAST_ONE6(actionORMethodDef),
      AT_LEAST_ONE7: actionORMethodDef => this.AT_LEAST_ONE7(actionORMethodDef),
      AT_LEAST_ONE8: actionORMethodDef => this.AT_LEAST_ONE8(actionORMethodDef),
      AT_LEAST_ONE9: actionORMethodDef => this.AT_LEAST_ONE9(actionORMethodDef),
      AT_LEAST_ONE_SEP: options => this.AT_LEAST_ONE_SEP(options),
      AT_LEAST_ONE_SEP1: options => this.AT_LEAST_ONE_SEP1(options),
      AT_LEAST_ONE_SEP2: options => this.AT_LEAST_ONE_SEP2(options),
      AT_LEAST_ONE_SEP3: options => this.AT_LEAST_ONE_SEP3(options),
      AT_LEAST_ONE_SEP4: options => this.AT_LEAST_ONE_SEP4(options),
      AT_LEAST_ONE_SEP5: options => this.AT_LEAST_ONE_SEP5(options),
      AT_LEAST_ONE_SEP6: options => this.AT_LEAST_ONE_SEP6(options),
      AT_LEAST_ONE_SEP7: options => this.AT_LEAST_ONE_SEP7(options),
      AT_LEAST_ONE_SEP8: options => this.AT_LEAST_ONE_SEP8(options),
      AT_LEAST_ONE_SEP9: options => this.AT_LEAST_ONE_SEP9(options),
      ACTION: func => this.ACTION(func),
      BACKTRACK: (cstDef, ...args) =>
        this.BACKTRACK(<any> this[<keyof (typeof this)>cstDef.name], <any>{ ARGS: args }),
      SUBRULE: subRuleImpl((rule, args) => this.SUBRULE(rule, args)),
      SUBRULE1: subRuleImpl((rule, args) => this.SUBRULE1(rule, args)),
      SUBRULE2: subRuleImpl((rule, args) => this.SUBRULE2(rule, args)),
      SUBRULE3: subRuleImpl((rule, args) => this.SUBRULE3(rule, args)),
      SUBRULE4: subRuleImpl((rule, args) => this.SUBRULE4(rule, args)),
      SUBRULE5: subRuleImpl((rule, args) => this.SUBRULE5(rule, args)),
      SUBRULE6: subRuleImpl((rule, args) => this.SUBRULE6(rule, args)),
      SUBRULE7: subRuleImpl((rule, args) => this.SUBRULE7(rule, args)),
      SUBRULE8: subRuleImpl((rule, args) => this.SUBRULE8(rule, args)),
      SUBRULE9: subRuleImpl((rule, args) => this.SUBRULE9(rule, args)),
    };
  }
}
