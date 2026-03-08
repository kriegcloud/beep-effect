import { AstCoreFactory } from '../AstCoreFactory.js';
import type { SourceLocationInlinedSource } from '../types.js';
import { traqulaIndentation, traqulaNewlineAlternative } from '../utils.js';
import type { GenRuleMap } from './builderTypes.js';
import type { GeneratorRule, RuleDefArg } from './generatorTypes.js';

export interface GeneratorContext {
  [traqulaIndentation]?: number;
  [traqulaNewlineAlternative]?: string;
}

export class DynamicGenerator<Context, Names extends string, RuleDefs extends GenRuleMap<Names>> {
  protected readonly factory = new AstCoreFactory();
  protected __context: Context | undefined = undefined;
  protected origSource = '';
  /**
   * Reference to the latest SourceLocationInlinedSource this generator handled (used for idempotency)
   * @protected
   */
  protected handledInlineSource: SourceLocationInlinedSource | undefined;
  protected generatedUntil = 0;
  protected toEnsure: ((willPrint: string) => void)[] = [];
  /**
   * Should not contain empty strings
   * @protected
   */
  protected readonly stringBuilder: string[] = [];

  public constructor(protected rules: RuleDefs) {
    // eslint-disable-next-line ts/no-unnecessary-type-assertion
    for (const rule of <GeneratorRule[]> Object.values(rules)) {
      // Define function implementation
      this[<keyof (typeof this)> rule.name] =
        <any> ((input: any, context: Context & { origSource: string; offset?: number }, args: any) => {
          this.stringBuilder.length = 0;
          this.origSource = context.origSource;
          this.generatedUntil = context?.offset ?? 0;
          this.setContext(context);

          this.subrule(rule, input, args);

          this.catchup(this.origSource.length);

          return this.stringBuilder.join('');
        });
    }
  }

  public setContext(context: Context): void {
    this.__context = context;
  }

  protected getSafeContext(): Context & GeneratorContext {
    return <Context & GeneratorContext> this.__context;
  }

  protected readonly subrule: RuleDefArg['SUBRULE'] = (cstDef, ast, ...arg) => {
    const def = this.rules[<Names> cstDef.name];
    if (!def) {
      throw new Error(`Rule ${cstDef.name} not found`);
    }

    const generate = (): void => def.gImpl({
      SUBRULE: this.subrule,
      PRINT: this.print,
      ENSURE: this.ensure,
      ENSURE_EITHER: this.ensureEither,
      NEW_LINE: this.newLine,
      HANDLE_LOC: this.handleLoc,
      CATCHUP: this.catchup,

      PRINT_WORD: this.printWord,
      PRINT_WORDS: this.printWords,
      PRINT_ON_EMPTY: this.printOnEmpty,
      PRINT_ON_OWN_LINE: this.printOnOwnLine,
    })(ast, this.getSafeContext(), ...arg);

    if (this.factory.isLocalized(ast)) {
      this.handleLoc(ast, generate);
    } else {
      generate();
    }
  };

  protected readonly handleLoc: RuleDefArg['HANDLE_LOC'] = (localized, handle) => {
    if (this.factory.isSourceLocationNoMaterialize(localized.loc)) {
      return;
    }
    if (this.factory.isSourceLocationStringReplace(localized.loc)) {
      this.catchup(localized.loc.start);
      this.print(localized.loc.newSource);
      this.generatedUntil = localized.loc.end;
      return;
    }
    if (this.factory.isSourceLocationNodeReplace(localized.loc)) {
      this.catchup(localized.loc.start);
      this.generatedUntil = localized.loc.end;
    }
    if (this.factory.isSourceLocationSource(localized.loc)) {
      this.catchup(localized.loc.start);
    }
    if (this.factory.isSourceLocationInlinedSource(localized.loc) && this.handledInlineSource !== localized.loc) {
      // Idempotence: calling handleLoc on the same AST multiple times should be the same as doing it once.
      this.handledInlineSource = localized.loc;
      // Like normal, catch up until the start of what this node represents.
      this.catchup(localized.loc.start);
      // Save pointer location of current source and register new source.
      const origSource = this.origSource;
      const origPointer = this.generatedUntil;
      this.origSource = localized.loc.newSource;
      this.generatedUntil = 0;
      // Catchup the new source to where this node starts representing the source.
      this.catchup(localized.loc.startOnNew);

      const ret = this.handleLoc(localized.loc, handle);

      // Catchup so the entire new source is generated outside what this node represents.
      this.generatedUntil = localized.loc.endOnNew;
      this.catchup(this.origSource.length);
      // Recover the original source and register that you generated the range of this node.
      this.origSource = origSource;
      this.generatedUntil = Math.max(origPointer, localized.loc.end);
      return ret;
    }
    // If autoGenerate - do nothing

    const ret = handle();

    if (this.factory.isSourceLocationSource(localized.loc)) {
      this.catchup(localized.loc.end);
    }
    return ret;
  };

  /**
   * Catchup until, excluding
   */
  protected readonly catchup: RuleDefArg['CATCHUP'] = (until) => {
    const start = this.generatedUntil;
    if (start < until) {
      this.print(this.origSource.slice(start, until));
    }
    this.generatedUntil = Math.max(this.generatedUntil, until);
  };

  private handeEnsured(toPrint: string): void {
    for (const callBack of this.toEnsure) {
      callBack(toPrint);
    }
    this.toEnsure.length = 0;
  }

  protected readonly print: RuleDefArg['PRINT'] = (...args) => {
    const joined = args.join('');
    this.handeEnsured(joined);
    this.stringBuilder.push(joined);
  };

  private doesEndWith(subsStr: string): boolean {
    const len = subsStr.length;
    let temp = '';
    while (temp.length < len && this.stringBuilder.length > 0) {
      temp = this.stringBuilder.pop() + temp;
    }
    this.stringBuilder.push(temp);
    return temp.endsWith(subsStr);
  }

  protected readonly ensure: RuleDefArg['ENSURE'] = (...args) => {
    // Check whether already present
    const toEnsure = args.join('');
    if (!this.doesEndWith(toEnsure)) {
      this.toEnsure.push((willPrint) => {
        if (!willPrint.startsWith(toEnsure) && !this.doesEndWith(toEnsure)) {
          this.stringBuilder.push(toEnsure);
        }
      });
    }
  };

  protected readonly ensureEither: RuleDefArg['ENSURE_EITHER'] = (...args) => {
    if (args.length === 1) {
      this.ensure(...args);
    } else if (args.length > 1 &&
      // Not already matched?
      !args.some(subStr => this.doesEndWith(subStr))) {
      this.toEnsure.push((willPrint) => {
        if (!args.some(subStr => willPrint.startsWith(subStr)) && !args.some(subStr => this.doesEndWith(subStr))) {
          this.stringBuilder.push(args[0]);
        }
      });
    }
  };

  private pruneEndingBlanks(): void {
    let temp = '';
    while (/^[ \t]*$/u.test(temp) && this.stringBuilder.length > 0) {
      temp = this.stringBuilder.pop() + temp;
    }
    this.print(temp.trimEnd());
  }

  protected readonly newLine: RuleDefArg['NEW_LINE'] = (arg) => {
    const indentation = this.getSafeContext()[traqulaIndentation] ?? 0;
    const force = arg?.force ?? false;
    if (indentation < 0) {
      const newlineAlternative = this.getSafeContext()[traqulaNewlineAlternative];
      if (newlineAlternative !== undefined &&
        // If we force, it means we would print \n no matter. - otherwise check whether we have printed the char
        (force || (this.stringBuilder.at(-1) !== newlineAlternative))) {
        this.print(newlineAlternative);
      }
      return;
    }
    this.pruneEndingBlanks();
    if (force) {
      this.print('\n', ' '.repeat(indentation));
    } else {
      let temp = '';
      while (!temp.includes('\n') && this.stringBuilder.length > 0) {
        temp = this.stringBuilder.pop() + temp;
      }
      if (/\n[ \t]*$/u.test(temp)) {
        // Pointer is on empty newline -> set correct indentation
        temp = temp.replace(/\n[ \t]*$/u, `\n${' '.repeat(indentation)}`);
        this.print(temp);
      } else {
        // Pointer not on empty newline, print newline.
        this.print(temp, '\n', ' '.repeat(indentation));
      }
    }
  };

  private readonly printWord: RuleDefArg['PRINT_WORD'] = (...args) => {
    this.ensureEither(' ', '\n');
    this.print(...args);
    this.ensureEither(' ', '\n');
  };

  private readonly printWords: RuleDefArg['PRINT_WORD'] = (...args) => {
    for (const arg of args) {
      this.printWord(arg);
    }
  };

  private readonly printOnEmpty: RuleDefArg['PRINT_ON_EMPTY'] = (...args) => {
    this.newLine();
    this.print(...args);
  };

  private readonly printOnOwnLine: RuleDefArg['PRINT_ON_OWN_LINE'] = (...args) => {
    this.newLine();
    this.print(...args);
    this.newLine();
  };
}
