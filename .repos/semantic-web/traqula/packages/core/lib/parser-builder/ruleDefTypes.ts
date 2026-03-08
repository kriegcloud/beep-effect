import type {
  AtLeastOneSepMethodOpts,
  DSLMethodOpts,
  DSLMethodOptsWithErr,
  GrammarAction,
  IOrAlt,
  ManySepMethodOpts,
  OrMethodOpts,
  ConsumeMethodOpts,
  IToken,
  TokenType,
} from '@traqula/chevrotain';

/**
 * Get the return-type of a RuleDef
 */
export type RuleDefReturn<T extends ParserRule> = T extends ParserRule<any, string, infer Ret> ? Ret : never;

/**
 * Type used to declare grammar rules.
 */
export type ParserRule<
  /**
   * Context object available in rule implementation.
   */
  Context = any,
  /**
   * Name of grammar rule, should be a strict subtype of string like 'myGrammarRule'.
   */
  NameType extends string = string,
  /**
   * Type that will be returned after a correct parse of this rule.
   * This type will be the return type of calling SUBRULE with this grammar rule.
   */
  ReturnType = unknown,
  /**
   * Function arguments that can be given to convey the state of the current parse operation.
   */
  ParamType extends any[] = any[],
> = {
  name: NameType;
  impl: (def: ImplArgs) => (context: Context, ...params: ParamType) => ReturnType;
};

/**
 * Type expected by grammar rules in the main `impl` function.
 */
export interface ImplArgs extends CstDef {
  cache: WeakMap<ParserRule, unknown>;
}

/**
 * Type definition used by {@link CstDef.SUBRULE} and family.
 */
type SubRuleFunc = <T extends string, U = unknown, ARGS extends any[] = any>(
  cstDef: ParserRule<any, T, U, ARGS>,
  ...argument: ARGS
) => U;
/**
 * Type definition used by {@link CstDef.BACKTRACK}.
 */
type BacktrackFunc = <T extends string, U = unknown, ARGS extends any[] = any>(
  cstDef: ParserRule<any, T, U, ARGS>,
  ...argument: ARGS
) => () => boolean;

/**
 * Mainly a repetition of the functions exposed by the {@link EmbeddedActionsParser},
 * with some small adjustments that allow for the API changes made by traqula.
 * Specifically changes are made to the {@link CstDef.SUBRULE} (and family) interface,
 * and to the {@link CstDef.BACKTRACK} interface.
 */
export interface CstDef {
  /**
   *
   * A Parsing DSL method use to consume a single Token.
   * In EBNF terms this is equivalent to a Terminal.
   *
   * A Token will be consumed, IFF the next token in the token vector matches `tokType`.
   * otherwise the parser may attempt to perform error recovery (if enabled).
   *
   * The index in the method name indicates the unique occurrence of a terminal consumption
   * inside a the top level rule. What this means is that if a terminal appears
   * more than once in a single rule, each appearance must have a **different** index.
   *
   * For example:
   * ```
   *   this.RULE("qualifiedName", () => {
   *   this.CONSUME1(Identifier);
   *     this.MANY(() => {
   *       this.CONSUME1(Dot);
   *       // here we use CONSUME2 because the terminal
   *       // 'Identifier' has already appeared previously in the
   *       // the rule 'parseQualifiedName'
   *       this.CONSUME2(Identifier);
   *     });
   *   })
   * ```
   *
   * - See more details on the [unique suffixes requirement](http://chevrotain.io/docs/FAQ.html#NUMERICAL_SUFFIXES).
   *
   * @param tokType - The Type of the token to be consumed.
   * @param options - optional properties to modify the behavior of CONSUME.
   */
  CONSUME: (tokType: TokenType, options?: ConsumeMethodOpts) => IToken;
  CONSUME1: (tokType: TokenType, options?: ConsumeMethodOpts) => IToken;
  CONSUME2: (tokType: TokenType, options?: ConsumeMethodOpts) => IToken;
  CONSUME3: (tokType: TokenType, options?: ConsumeMethodOpts) => IToken;
  CONSUME4: (tokType: TokenType, options?: ConsumeMethodOpts) => IToken;
  CONSUME5: (tokType: TokenType, options?: ConsumeMethodOpts) => IToken;
  CONSUME6: (tokType: TokenType, options?: ConsumeMethodOpts) => IToken;
  CONSUME7: (tokType: TokenType, options?: ConsumeMethodOpts) => IToken;
  CONSUME8: (tokType: TokenType, options?: ConsumeMethodOpts) => IToken;
  CONSUME9: (tokType: TokenType, options?: ConsumeMethodOpts) => IToken;
  /**
   * Parsing DSL Method that Indicates an Optional production.
   * in EBNF notation this is equivalent to: "[...]".
   *
   * Note that there are two syntax forms:
   * - Passing the grammar action directly:
   *   ```
   *     this.OPTION(() => {
   *       this.CONSUME(Digit)}
   *     );
   *   ```
   *
   * - using an "options" object:
   *   ```
   *     this.OPTION({
   *       GATE:predicateFunc,
   *       DEF: () => {
   *         this.CONSUME(Digit)
   *     }});
   *   ```
   *
   * The optional 'GATE' property in "options" object form can be used to add constraints
   * to invoking the grammar action.
   *
   * As in CONSUME the index in the method name indicates the occurrence
   * of the optional production in it's top rule.
   *
   * @param  actionORMethodDef - The grammar action to optionally invoke once
   *                             or an "OPTIONS" object describing the grammar action and optional properties.
   *
   * @returns The `GrammarAction` return value (OUT) if the optional syntax is encountered
   *          or `undefined` if not.
   */
  OPTION: <OUT>(
    actionORMethodDef: GrammarAction<OUT> | DSLMethodOpts<OUT>,
  ) => OUT | undefined;
  OPTION1: <OUT>(
    actionORMethodDef: GrammarAction<OUT> | DSLMethodOpts<OUT>,
  ) => OUT | undefined;
  OPTION2: <OUT>(
    actionORMethodDef: GrammarAction<OUT> | DSLMethodOpts<OUT>,
  ) => OUT | undefined;
  OPTION3: <OUT>(
    actionORMethodDef: GrammarAction<OUT> | DSLMethodOpts<OUT>,
  ) => OUT | undefined;
  OPTION4: <OUT>(
    actionORMethodDef: GrammarAction<OUT> | DSLMethodOpts<OUT>,
  ) => OUT | undefined;
  OPTION5: <OUT>(
    actionORMethodDef: GrammarAction<OUT> | DSLMethodOpts<OUT>,
  ) => OUT | undefined;
  OPTION6: <OUT>(
    actionORMethodDef: GrammarAction<OUT> | DSLMethodOpts<OUT>,
  ) => OUT | undefined;
  OPTION7: <OUT>(
    actionORMethodDef: GrammarAction<OUT> | DSLMethodOpts<OUT>,
  ) => OUT | undefined;
  OPTION8: <OUT>(
    actionORMethodDef: GrammarAction<OUT> | DSLMethodOpts<OUT>,
  ) => OUT | undefined;
  OPTION9: <OUT>(
    actionORMethodDef: GrammarAction<OUT> | DSLMethodOpts<OUT>,
  ) => OUT | undefined;
  /**
   * Parsing DSL method that indicates a choice between a set of alternatives must be made.
   * This is equivalent to an EBNF alternation (A | B | C | D ...), except
   * that the alternatives are ordered like in a PEG grammar.
   * This means that the **first** matching alternative is always chosen.
   *
   * There are several forms for the inner alternatives array:
   *
   * - Passing alternatives array directly:
   *   ```
   *     this.OR([
   *       { ALT:() => { this.CONSUME(One) }},
   *       { ALT:() => { this.CONSUME(Two) }},
   *       { ALT:() => { this.CONSUME(Three) }}
   *     ])
   *   ```
   *
   * - Passing alternative array directly with predicates (GATE):
   *   ```
   *     this.OR([
   *       { GATE: predicateFunc1, ALT:() => { this.CONSUME(One) }},
   *       { GATE: predicateFuncX, ALT:() => { this.CONSUME(Two) }},
   *       { GATE: predicateFuncX, ALT:() => { this.CONSUME(Three) }}
   *     ])
   *   ```
   *
   * - These syntax forms can also be mixed:
   *   ```
   *     this.OR([
   *       {
   *         GATE: predicateFunc1,
   *         ALT:() => { this.CONSUME(One) }
   *       },
   *       { ALT:() => { this.CONSUME(Two) }},
   *       { ALT:() => { this.CONSUME(Three) }}
   *     ])
   *   ```
   *
   * - Additionally an "options" object may be used:
   *   ```
   *     this.OR({
   *       DEF:[
   *         { ALT:() => { this.CONSUME(One) }},
   *         { ALT:() => { this.CONSUME(Two) }},
   *         { ALT:() => { this.CONSUME(Three) }}
   *       ],
   *       // OPTIONAL property
   *       ERR_MSG: "A Number"
   *     })
   *   ```
   *
   * The 'predicateFuncX' in the long form can be used to add constraints to choosing the alternative.
   *
   * As in CONSUME the index in the method name indicates the occurrence
   * of the alternation production in it's top rule.
   *
   * @param altsOrOpts - A set of alternatives or an "OPTIONS" object describing the alternatives
   * and optional properties.
   *
   * @returns The result of invoking the chosen alternative.
   */
  OR: <T>(altsOrOpts: IOrAlt<T>[] | OrMethodOpts<T>) => T;
  OR1: <T>(altsOrOpts: IOrAlt<T>[] | OrMethodOpts<T>) => T;
  OR2: <T>(altsOrOpts: IOrAlt<T>[] | OrMethodOpts<T>) => T;
  OR3: <T>(altsOrOpts: IOrAlt<T>[] | OrMethodOpts<T>) => T;
  OR4: <T>(altsOrOpts: IOrAlt<T>[] | OrMethodOpts<T>) => T;
  OR5: <T>(altsOrOpts: IOrAlt<T>[] | OrMethodOpts<T>) => T;
  OR6: <T>(altsOrOpts: IOrAlt<T>[] | OrMethodOpts<T>) => T;
  OR7: <T>(altsOrOpts: IOrAlt<T>[] | OrMethodOpts<T>) => T;
  OR8: <T>(altsOrOpts: IOrAlt<T>[] | OrMethodOpts<T>) => T;
  OR9: <T>(altsOrOpts: IOrAlt<T>[] | OrMethodOpts<T>) => T;
  /**
   * Parsing DSL method, that indicates a repetition of zero or more.
   * This is equivalent to EBNF repetition \{...\}.
   *
   * Note that there are two syntax forms:
   * - Passing the grammar action directly:
   *   ```
   *     this.MANY(() => {
   *       this.CONSUME(Comma)
   *       this.CONSUME(Digit)
   *      })
   *   ```
   *
   * - using an "options" object:
   *   ```
   *     this.MANY({
   *       GATE: predicateFunc,
   *       DEF: () => {
   *              this.CONSUME(Comma)
   *              this.CONSUME(Digit)
   *            }
   *     });
   *   ```
   *
   * The optional 'GATE' property in "options" object form can be used to add constraints
   * to invoking the grammar action.
   *
   * As in CONSUME the index in the method name indicates the occurrence
   * of the repetition production in it's top rule.
   *
   * @param actionORMethodDef - The grammar action to optionally invoke multiple times
   *                             or an "OPTIONS" object describing the grammar action and optional properties.
   *
   */
  MANY: (
    actionORMethodDef: GrammarAction<any> | DSLMethodOpts<any>,
  ) => void;
  MANY1: (
    actionORMethodDef: GrammarAction<any> | DSLMethodOpts<any>,
  ) => void;
  MANY2: (
    actionORMethodDef: GrammarAction<any> | DSLMethodOpts<any>,
  ) => void;
  MANY3: (
    actionORMethodDef: GrammarAction<any> | DSLMethodOpts<any>,
  ) => void;
  MANY4: (
    actionORMethodDef: GrammarAction<any> | DSLMethodOpts<any>,
  ) => void;
  MANY5: (
    actionORMethodDef: GrammarAction<any> | DSLMethodOpts<any>,
  ) => void;
  MANY6: (
    actionORMethodDef: GrammarAction<any> | DSLMethodOpts<any>,
  ) => void;
  MANY7: (
    actionORMethodDef: GrammarAction<any> | DSLMethodOpts<any>,
  ) => void;
  MANY8: (
    actionORMethodDef: GrammarAction<any> | DSLMethodOpts<any>,
  ) => void;
  MANY9: (
    actionORMethodDef: GrammarAction<any> | DSLMethodOpts<any>,
  ) => void;
  /**
   * Parsing DSL method, that indicates a repetition of zero or more with a separator
   * Token between the repetitions.
   *
   * Example:
   *
   * ```
   *     this.MANY_SEP({
   *         SEP:Comma,
   *         DEF: () => {
   *             this.CONSUME(Number};
   *             // ...
   *         })
   * ```
   *
   * Note that because this DSL method always requires more than one argument the options object is always required
   * and it is not possible to use a shorter form like in the MANY DSL method.
   *
   * Note that for the purposes of deciding on whether or not another iteration exists
   * Only a single Token is examined (The separator). Therefore if the grammar being implemented is
   * so "crazy" to require multiple tokens to identify an item separator please use the more basic DSL methods
   * to implement it.
   *
   * As in CONSUME the index in the method name indicates the occurrence
   * of the repetition production in it's top rule.
   *
   * @param options - An object defining the grammar of each iteration and the separator between iterations
   *
   */
  MANY_SEP: (options: ManySepMethodOpts<any>) => void;
  MANY_SEP1: (options: ManySepMethodOpts<any>) => void;
  MANY_SEP2: (options: ManySepMethodOpts<any>) => void;
  MANY_SEP3: (options: ManySepMethodOpts<any>) => void;
  MANY_SEP4: (options: ManySepMethodOpts<any>) => void;
  MANY_SEP5: (options: ManySepMethodOpts<any>) => void;
  MANY_SEP6: (options: ManySepMethodOpts<any>) => void;
  MANY_SEP7: (options: ManySepMethodOpts<any>) => void;
  MANY_SEP8: (options: ManySepMethodOpts<any>) => void;
  MANY_SEP9: (options: ManySepMethodOpts<any>) => void;
  /**
   * Convenience method, same as MANY but the repetition is of one or more.
   * failing to match at least one repetition will result in a parsing error and
   * cause a parsing error.
   *
   * @see MANY
   *
   * @param actionORMethodDef  - The grammar action to optionally invoke multiple times
   *                             or an "OPTIONS" object describing the grammar action and optional properties.
   *
   */
  AT_LEAST_ONE: (
    actionORMethodDef: GrammarAction<any> | DSLMethodOptsWithErr<any>,
  ) => void;
  AT_LEAST_ONE1: (
    actionORMethodDef: GrammarAction<any> | DSLMethodOptsWithErr<any>,
  ) => void;
  AT_LEAST_ONE2: (
    actionORMethodDef: GrammarAction<any> | DSLMethodOptsWithErr<any>,
  ) => void;
  AT_LEAST_ONE3: (
    actionORMethodDef: GrammarAction<any> | DSLMethodOptsWithErr<any>,
  ) => void;
  AT_LEAST_ONE4: (
    actionORMethodDef: GrammarAction<any> | DSLMethodOptsWithErr<any>,
  ) => void;
  AT_LEAST_ONE5: (
    actionORMethodDef: GrammarAction<any> | DSLMethodOptsWithErr<any>,
  ) => void;
  AT_LEAST_ONE6: (
    actionORMethodDef: GrammarAction<any> | DSLMethodOptsWithErr<any>,
  ) => void;
  AT_LEAST_ONE7: (
    actionORMethodDef: GrammarAction<any> | DSLMethodOptsWithErr<any>,
  ) => void;
  AT_LEAST_ONE8: (
    actionORMethodDef: GrammarAction<any> | DSLMethodOptsWithErr<any>,
  ) => void;
  AT_LEAST_ONE9: (
    actionORMethodDef: GrammarAction<any> | DSLMethodOptsWithErr<any>,
  ) => void;
  /**
   * Convenience method, same as MANY_SEP but the repetition is of one or more.
   * failing to match at least one repetition will result in a parsing error and
   * cause the parser to attempt error recovery.
   *
   * Note that an additional optional property ERR_MSG can be used to provide custom error messages.
   *
   * @see MANY_SEP
   *
   * @param options - An object defining the grammar of each iteration and the separator between iterations
   *
   * @return ISeparatedIterationResult<OUT>
   */
  AT_LEAST_ONE_SEP: (options: AtLeastOneSepMethodOpts<any>) => void;
  AT_LEAST_ONE_SEP1: (options: AtLeastOneSepMethodOpts<any>) => void;
  AT_LEAST_ONE_SEP2: (options: AtLeastOneSepMethodOpts<any>) => void;
  AT_LEAST_ONE_SEP3: (options: AtLeastOneSepMethodOpts<any>) => void;
  AT_LEAST_ONE_SEP4: (options: AtLeastOneSepMethodOpts<any>) => void;
  AT_LEAST_ONE_SEP5: (options: AtLeastOneSepMethodOpts<any>) => void;
  AT_LEAST_ONE_SEP6: (options: AtLeastOneSepMethodOpts<any>) => void;
  AT_LEAST_ONE_SEP7: (options: AtLeastOneSepMethodOpts<any>) => void;
  AT_LEAST_ONE_SEP8: (options: AtLeastOneSepMethodOpts<any>) => void;
  AT_LEAST_ONE_SEP9: (options: AtLeastOneSepMethodOpts<any>) => void;
  /**
   * Perform an action that is only executed during actual parsing and not during parser initialization.
   * (When a lot of this secretly return null)
   * @param impl
   * @constructor
   */
  ACTION: <T>(impl: () => T) => T;
  BACKTRACK: BacktrackFunc;
  SUBRULE: SubRuleFunc;
  SUBRULE1: SubRuleFunc;
  SUBRULE2: SubRuleFunc;
  SUBRULE3: SubRuleFunc;
  SUBRULE4: SubRuleFunc;
  SUBRULE5: SubRuleFunc;
  SUBRULE6: SubRuleFunc;
  SUBRULE7: SubRuleFunc;
  SUBRULE8: SubRuleFunc;
  SUBRULE9: SubRuleFunc;
}
