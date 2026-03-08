import type { Localized } from '../types.js';

/**
 * Type used to declare generator rules.
 */
export type GeneratorRule<
  /**
   * Context object available in rule implementation.
   */
  Context = any,
  /**
   * Name of grammar rule, should be a strict subtype of string like 'myGrammarRule'.
   */
  NameType extends string = string,
  /**
   * Type that of the AST that we will generate the string for.
   * This type will be the provided when calling SUBRULE with this generator rule.
   * Generation happens on a per AST node basis.
   * The core will implement the generation as such. If this ever changes, we will cross that bridge when we get there.
   */
  AstType = any,
  /**
   * Function arguments that can be given to convey the state of the current parse operation.
   */
  ParamType extends any[] = any[],
> = {
  name: NameType;
  gImpl: (def: RuleDefArg) =>
  (ast: AstType, context: Context, ...params: ParamType) => void;
};

export interface RuleDefArg {
  /**
   * Call another generator rule so it can generate its string representation.
   * @param rule the rule to be called
   * @param input the ast input to work on
   * @param arg the remaining parameters required by this rule.
   */
  SUBRULE: <T, U extends any[]>(rule: GeneratorRule<any, any, T, U>, input: T, ...arg: U) => void;
  /**
   * Print the characters to the output string
   * @param args arguments to be printed
   */
  PRINT: (...args: string[]) => void;
  /**
   * Ensures the requested characters are printed at the current location.
   * Will not change the constructed string in case either:
   *  1. The string builder ends in the to ensure string.
   *  2: The next printed string starts with the ensure string.
   * Otherwise, prints the sting.
   */
  ENSURE: (...args: string[]) => void;
  /**
   * Ensures either one of the provided strings. If no string can be ensured, it will print the first argument.
   */
  ENSURE_EITHER: (...args: string[]) => void;
  /**
   * Create a new line, will ensure the previous line does not end in blank characters.
   * Will only print a newline if the pointer is not currently on a new line.
   * When the traqulaIndentation is changed in the meanwhile, this will ensure the indentation of teh pointer updated.
   */
  NEW_LINE: (arg?: {
    /**
     * Whether the newline should be printed regardless of the pointer is already on an empty newline.
     */
    force?: boolean;
  }) => void;
  /**
   * Handles the location of a node as if it was generated using a SUBRULE.
   * Can be used to generate many nodes within a single subrule call while still having correct localization handling.
   * @param loc
   * @param nodeHandle
   * @constructor
   */
  HANDLE_LOC: <T>(loc: Localized, nodeHandle: () => T) => T | undefined;
  /**
   * Catchup the string until a given length,
   * printing everything from the current catchup location until the index you provide.
   * @param until
   * @constructor
   */
  CATCHUP: (until: number) => void;

  // Derivations from the above fundamental functions
  /**
   * Prints all arguments as one word, ensuring it has a space before and behind each word
   * @param args
   */
  PRINT_WORD: (...args: string[]) => void;
  /**
   * Prints all arguments as words, ensuring they all have a space before and behind them.
   * @param args
   */
  PRINT_WORDS: (...args: string[]) => void;
  /**
   * Start a newline to print arguments on
   */
  PRINT_ON_EMPTY: (...args: string[]) => void;
  /**
   * Prints arguments on its own (shared) line
   */
  PRINT_ON_OWN_LINE: (...args: string[]) => void;
}
