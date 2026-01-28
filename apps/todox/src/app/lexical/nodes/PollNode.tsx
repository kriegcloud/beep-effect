import * as Either from "effect/Either";
import * as O from "effect/Option";
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

function cloneOption(option: Option, text: string, votes?: undefined | Array<string>): Option {
  return {
    text,
    uid: option.uid,
    votes: votes || Array.from(option.votes),
  };
}

export type SerializedPollNode = Spread<
  {
    question: string;
    options: Options;
  },
  SerializedLexicalNode
>;

function $convertPollElement(domNode: HTMLSpanElement): DOMConversionOutput | null {
  const question = O.fromNullable(domNode.getAttribute("data-lexical-poll-question"));
  const optionsAttr = O.fromNullable(domNode.getAttribute("data-lexical-poll-options"));

  return O.getOrNull(
    O.flatMap(O.all([question, optionsAttr]), ([q, opts]) =>
      O.map(Either.getRight(Either.try(() => JSON.parse(opts))), (parsed) => ({
        node: $createPollNode(q, parseOptions(parsed)),
      }))
    )
  );
}

function parseOptions(json: unknown): Options {
  const options = [];
  if (Array.isArray(json)) {
    for (const row of json) {
      if (
        row &&
        typeof row.text === "string" &&
        typeof row.uid === "string" &&
        Array.isArray(row.votes) &&
        row.votes.every((v: unknown) => typeof v === "string")
      ) {
        options.push(row);
      }
    }
  }
  return options;
}

const questionState = createState("question", {
  parse: (v) => (typeof v === "string" ? v : ""),
});
const optionsState = createState("options", {
  isEqual: (a, b) => a.length === b.length && JSON.stringify(a) === JSON.stringify(b),
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
    return this.setOptions((prevOptions) => {
      const index = prevOptions.indexOf(option);
      if (index === -1) {
        return prevOptions;
      }
      const options = Array.from(prevOptions);
      options.splice(index, 1);
      return options;
    });
  }

  setOptionText(option: Option, text: string): this {
    return this.setOptions((prevOptions) => {
      const clonedOption = cloneOption(option, text);
      const options = Array.from(prevOptions);
      const index = options.indexOf(option);
      options[index] = clonedOption;
      return options;
    });
  }

  toggleVote(option: Option, username: string): this {
    return this.setOptions((prevOptions) => {
      const index = prevOptions.indexOf(option);
      if (index === -1) {
        return prevOptions;
      }
      const votes = option.votes;
      const votesClone = Array.from(votes);
      const voteIndex = votes.indexOf(username);
      if (voteIndex === -1) {
        votesClone.push(username);
      } else {
        votesClone.splice(voteIndex, 1);
      }
      const clonedOption = cloneOption(option, option.text, votesClone);
      const options = Array.from(prevOptions);
      options[index] = clonedOption;
      return options;
    });
  }

  override exportDOM(): DOMExportOutput {
    const element = document.createElement("span");
    element.setAttribute("data-lexical-poll-question", this.getQuestion());
    element.setAttribute("data-lexical-poll-options", JSON.stringify(this.getOptions()));
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
