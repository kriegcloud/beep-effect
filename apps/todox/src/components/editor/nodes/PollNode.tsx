import * as A from "effect/Array";
import * as Either from "effect/Either";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import {
  $getState,
  $setState,
  buildImportMap,
  createState,
  DecoratorNode,
  type DOMConversionOutput,
  type DOMExportOutput,
  type SerializedLexicalNode,
  type Spread,
  type StateConfigValue,
  type StateValueOrUpdater,
} from "lexical";
import type { JSX } from "react";
import * as React from "react";
import type { Option, Options } from "./poll-utils";

// Re-export types and functions from utils for backwards compatibility
export type { Option, Options } from "./poll-utils";
export { createPollOption } from "./poll-utils";

const PollComponent = React.lazy(() => import("./PollComponent"));

// Effect Schema for poll options - used for JSON parsing/encoding
// Wrapped with S.mutable() to return mutable arrays compatible with Options type
const PollOptionSchema = S.mutable(
  S.Struct({
    text: S.String,
    uid: S.String,
    votes: S.mutable(S.Array(S.String)),
  })
);
const PollOptionsSchema = S.mutable(S.Array(PollOptionSchema));
const PollOptionsJsonSchema = S.parseJson(PollOptionsSchema);

function cloneOption(option: Option, text: string, votes?: undefined | Array<string>): Option {
  return {
    text,
    uid: option.uid,
    votes: votes || A.copy(option.votes),
  };
}

export type SerializedPollNode = Spread<
  {
    readonly question: string;
    readonly options: Options;
  },
  SerializedLexicalNode
>;

function $convertPollElement(domNode: HTMLSpanElement): DOMConversionOutput | null {
  const question = O.fromNullable(domNode.getAttribute("data-lexical-poll-question"));
  const optionsAttr = O.fromNullable(domNode.getAttribute("data-lexical-poll-options"));

  return O.getOrNull(
    O.flatMap(O.all([question, optionsAttr]), ([q, opts]) =>
      O.map(Either.getRight(S.decodeUnknownEither(PollOptionsJsonSchema)(opts)), (parsed) => ({
        node: $createPollNode(q, parsed),
      }))
    )
  );
}

function parseOptions(json: unknown): Options {
  return F.pipe(
    S.decodeUnknownEither(PollOptionsSchema)(json),
    Either.getOrElse(() => [] as Options)
  );
}

const questionState = createState("question", {
  parse: F.flow(
    O.liftPredicate(P.isString),
    O.getOrElse(() => "")
  ),
});
const optionsState = createState("options", {
  isEqual: (a, b) =>
    A.length(a) === A.length(b) &&
    A.every(
      A.zip(a, b),
      ([optA, optB]) =>
        optA.uid === optB.uid &&
        optA.text === optB.text &&
        A.length(optA.votes) === A.length(optB.votes) &&
        A.every(A.zip(optA.votes, optB.votes), ([vA, vB]) => vA === vB)
    ),
  parse: parseOptions,
});

export class PollNode extends DecoratorNode<JSX.Element> {
  override $config() {
    return this.config("poll", {
      extends: DecoratorNode,
      importDOM: buildImportMap({
        span: (domNode) =>
          domNode.getAttribute("data-lexical-poll-question") !== null
            ? {
                conversion: $convertPollElement,
                priority: 2,
              }
            : null,
      }),
      stateConfigs: [
        { flat: true, stateConfig: questionState },
        { flat: true, stateConfig: optionsState },
      ],
    });
  }

  getQuestion(): StateConfigValue<typeof questionState> {
    return $getState(this, questionState);
  }
  setQuestion(valueOrUpdater: StateValueOrUpdater<typeof questionState>): this {
    return $setState(this, questionState, valueOrUpdater);
  }
  getOptions(): StateConfigValue<typeof optionsState> {
    return $getState(this, optionsState);
  }
  setOptions(valueOrUpdater: StateValueOrUpdater<typeof optionsState>): this {
    return $setState(this, optionsState, valueOrUpdater);
  }

  addOption(option: Option): this {
    return this.setOptions((options) => [...options, option]);
  }

  deleteOption(option: Option): this {
    return this.setOptions((prevOptions) =>
      F.pipe(
        A.findFirstIndex(prevOptions, (o) => o === option),
        O.map((index) => A.remove(prevOptions, index)),
        O.getOrElse(() => prevOptions)
      )
    );
  }

  setOptionText(option: Option, text: string): this {
    return this.setOptions((prevOptions) => A.map(prevOptions, (o) => (o === option ? cloneOption(option, text) : o)));
  }

  toggleVote(option: Option, username: string): this {
    return this.setOptions((prevOptions) =>
      F.pipe(
        A.findFirstIndex(prevOptions, (o) => o === option),
        O.map((index) => {
          const votes = option.votes;
          const updatedVotes = F.pipe(
            A.findFirstIndex(votes, (v) => v === username),
            O.match({
              onNone: () => A.append(votes, username),
              onSome: (voteIndex) => A.remove(votes, voteIndex),
            })
          );
          const clonedOption = cloneOption(option, option.text, updatedVotes);
          return A.modify(prevOptions, index, () => clonedOption);
        }),
        O.getOrElse(() => prevOptions)
      )
    );
  }

  override exportDOM(): DOMExportOutput {
    const element = document.createElement("span");
    element.setAttribute("data-lexical-poll-question", this.getQuestion());
    const encodedOptions = F.pipe(
      S.encodeUnknownEither(PollOptionsJsonSchema)(this.getOptions()),
      Either.getOrElse(() => "[]")
    );
    element.setAttribute("data-lexical-poll-options", encodedOptions);
    return { element };
  }

  override createDOM(): HTMLElement {
    const elem = document.createElement("span");
    elem.style.display = "inline-block";
    return elem;
  }

  override updateDOM(): false {
    return false;
  }

  override decorate(): JSX.Element {
    return <PollComponent question={this.getQuestion()} options={this.getOptions()} nodeKey={this.__key} />;
  }
}

export function $createPollNode(question: string, options: Options): PollNode {
  return new PollNode().setQuestion(question).setOptions(options);
}

// Re-export from utils to maintain backwards compatibility
export { $isPollNode } from "./poll-utils";
