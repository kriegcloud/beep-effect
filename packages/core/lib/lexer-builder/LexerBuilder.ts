import type { ILexerConfig, TokenType } from '@traqula/chevrotain';
import { Lexer } from '@traqula/chevrotain';
import type { CheckOverlap, NamedToken } from '../utils.js';

export class LexerBuilder<NAMES extends string = string> {
  private readonly tokens: TokenType[];

  public static create<U extends LexerBuilder<T>, T extends string = never>(starter?: U): U {
    return <U> new LexerBuilder(starter);
  }

  private constructor(starter?: LexerBuilder<NAMES>) {
    this.tokens = starter?.tokens ? [ ...starter.tokens ] : [];
  }

  public merge<OtherNames extends string, OW extends string>(
    merge: LexerBuilder<OtherNames>,
    overwrite: NamedToken<OW>[] = [],
  ):
    LexerBuilder<NAMES | OtherNames> {
    const extraTokens = merge.tokens.filter((token) => {
      const overwriteToken = overwrite.find(t => t.name === token.name);
      if (overwriteToken) {
        return false;
      }
      const match = this.tokens.find(t => t.name === token.name);
      if (match) {
        if (match !== token) {
          throw new Error(`Token with name ${token.name} already exists. Implementation is different and no overwrite was provided.`);
        }
        return false;
      }
      return true;
    });
    this.tokens.push(...extraTokens);
    return this;
  }

  public add<Name extends string>(...token: CheckOverlap<Name, NAMES, NamedToken<Name>[]>):
  LexerBuilder<Name | NAMES> {
    this.tokens.push(...token);
    return this;
  }

  public addBefore<Name extends string>(
    before: NamedToken<NAMES>,
    ...token: CheckOverlap<Name, NAMES, NamedToken<Name>[]>
  ): LexerBuilder<NAMES | Name> {
    const index = this.tokens.indexOf(before);
    if (index === -1) {
      throw new Error('Token not found');
    }
    this.tokens.splice(index, 0, ...token);
    return this;
  }

  private moveBeforeOrAfter<Name extends string>(
    beforeOrAfter: 'before' | 'after',
    before: NamedToken<NAMES>,
    ...tokens: CheckOverlap<Name, NAMES, never, NamedToken<Name>[]>
  ): LexerBuilder<NAMES> {
    const beforeIndex = this.tokens.indexOf(before) + (beforeOrAfter === 'before' ? 0 : 1);
    if (beforeIndex === -1) {
      throw new Error('BeforeToken not found');
    }
    for (const token of tokens) {
      const tokenIndex = this.tokens.indexOf(token);
      if (tokenIndex === -1) {
        throw new Error('Token not found');
      }
      this.tokens.splice(tokenIndex, 1);
      this.tokens.splice(beforeIndex, 0, token);
    }
    return this;
  }

  /**
   * @param before token to move rest before
   * @param tokens tokens to move before the first token
   */
  public moveBefore<Name extends string>(
    before: NamedToken<NAMES>,
    ...tokens: CheckOverlap<Name, NAMES, never, NamedToken<Name>[]>
  ): LexerBuilder<NAMES> {
    return this.moveBeforeOrAfter('before', before, ...tokens);
  }

  public moveAfter<Name extends string>(
    after: NamedToken<NAMES>,
    ...tokens: CheckOverlap<Name, NAMES, never, NamedToken<Name>[]>
  ): LexerBuilder<NAMES> {
    return this.moveBeforeOrAfter('after', after, ...tokens);
  }

  public addAfter<Name extends string>(
    after: NamedToken<NAMES>,
    ...token: CheckOverlap<Name, NAMES, never, NamedToken<Name>[]>
  ): LexerBuilder<NAMES | Name> {
    const index = this.tokens.indexOf(after);
    if (index === -1) {
      throw new Error('Token not found');
    }
    this.tokens.splice(index + 1, 0, ...token);
    return this;
  }

  public delete<Name extends NAMES>(...token: NamedToken<Name>[]): LexerBuilder<Exclude<NAMES, Name>> {
    for (const t of token) {
      const index = this.tokens.indexOf(t);
      if (index === -1) {
        throw new Error('Token not found');
      }
      this.tokens.splice(index, 1);
    }
    return this;
  }

  public build(lexerConfig?: ILexerConfig): Lexer {
    return new Lexer(this.tokens, {
      positionTracking: 'onlyStart',
      recoveryEnabled: false,
      ensureOptimizations: true,
      // SafeMode: true,
      // SkipValidations: true,
      ...lexerConfig,
    });
  }

  public get tokenVocabulary(): readonly TokenType[] {
    return this.tokens;
  }
}
