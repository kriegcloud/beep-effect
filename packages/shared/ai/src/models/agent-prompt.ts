import { $SharedAiId } from "@beep/identity/packages";
import * as A from "effect/Array";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { SKILLS_INSTRUCTIONS } from "../prompts/shared";
import { ChatMessage, ChatMessageRole, ConversationMessages, SystemChatMessage, UserChatMessage } from "./message.ts";

const $I = $SharedAiId.create("models/agent-prompt");

export class TemplateNotFoundError extends S.TaggedError<TemplateNotFoundError>($I`TemplateNotFoundError`)(
  "TemplateNotFoundError",
  {
    name: S.String,
  }
) {
  static readonly new = (name: string) => new TemplateNotFoundError({ name });

  override get message() {
    return `Template not found: ${this.name}`;
  }
}

/**
 * User-Agent Client Hints brand information
 * @see https://developer.mozilla.org/en-US/docs/Web/API/NavigatorUAData
 */
interface NavigatorUABrand {
  readonly brand: string;
  readonly version: string;
}

/**
 * User-Agent Client Hints API data
 * @see https://developer.mozilla.org/en-US/docs/Web/API/NavigatorUAData
 */
interface NavigatorUAData {
  readonly brands: ReadonlyArray<NavigatorUABrand>;
  readonly mobile: boolean;
  readonly platform: string;
}

/**
 * Extended Navigator interface with User-Agent Client Hints
 */
interface NavigatorWithUAData extends Navigator {
  readonly userAgentData?: undefined | NavigatorUAData;
}

/**
 * System information gathered from the browser environment
 */
interface SystemInfo {
  readonly currentDate: string;
  readonly systemInfo: string;
  readonly userInfo: string;
  readonly workingDirectory: string;
}

export class AgentPromptTemplate extends S.Class<AgentPromptTemplate>($I`AgentPromptTemplate`)(
  {
    name: S.String,
    description: S.String,
    systemPrompt: S.String,
    userPromptTemplate: S.String,
  },
  $I.annotations("AgentPromptTemplate", {
    description: "Agent Prompt Template",
  })
) {}

export class KnownSkill extends S.Class<KnownSkill>($I`KnownSkill`)(
  {
    name: S.String,
    description: S.String,
    path: S.String,
  },
  $I.annotations("KnownSkill", {
    description: "Agent Prompt Template",
  })
) {}

export class AgentPromptOptions extends S.Class<AgentPromptOptions>($I`AgentPromptOptions`)(
  {
    agentName: S.String,
    agentDescription: S.String,
    userInput: S.String,
    conversationHistory: S.optionalWith(S.Array(ChatMessage), { default: A.empty<ChatMessage.Type> }),
    toolNames: S.optionalWith(S.Array(S.String), { default: A.empty<string> }),
    availableTools: S.optionalWith(S.Record({ key: S.String, value: S.String }), { as: "Option" }),
    knownSkills: S.optionalWith(S.Array(KnownSkill), { default: A.empty<KnownSkill> }),
  },
  $I.annotations("AgentPromptOptions", {
    description: "Agent Prompt Options",
  })
) {}

export class AgentPromptBuilder extends S.Class<AgentPromptBuilder>($I`AgentPromptBuilder`)(
  {
    templates: S.Record({
      key: S.String,
      value: AgentPromptTemplate,
    }),
  },
  $I.annotations("AgentPromptBuilder", {
    description: "Agent Prompt Builder",
  })
) {
  readonly getTemplate = (name: string): O.Option<AgentPromptTemplate> => R.get(name)(this.templates);

  readonly listTemplates = () => R.keys(this.templates);

  /**
   * Detect OS from user agent string using pattern matching
   */
  private static readonly detectOsFromUserAgent = (userAgent: string): string =>
    F.pipe(
      userAgent,
      Match.value,
      Match.when(Str.includes("Win"), () => "Windows" as const),
      Match.when(Str.includes("Mac"), () => "macOS" as const),
      Match.when(Str.includes("Linux"), () => "Linux" as const),
      Match.orElse(() => "unknown" as const)
    );

  /**
   * Extract system info from User-Agent Client Hints API if available
   */
  private static readonly getSystemInfoFromUAData = (uaData: NavigatorUAData): string => {
    const brandName = F.pipe(
      A.head(uaData.brands),
      O.map((brand) => brand.brand),
      O.getOrElse(() => "browser")
    );
    return `${uaData.platform} (${brandName})`;
  };

  /**
   * Get current system information including date and browser/OS details
   * Browser-compatible version with proper type safety
   */
  private getSystemInfo = (): Effect.Effect<SystemInfo> =>
    Effect.sync(() => {
      const nav = navigator as NavigatorWithUAData;

      const currentDate = DateTime.unsafeNow().pipe(DateTime.toUtc).toString();

      const platform = O.fromNullable(nav.platform).pipe(O.getOrElse(() => "unknown"));
      const userAgent = nav.userAgent;

      const systemInfo = F.pipe(
        O.fromNullable(nav.userAgentData),
        O.map(AgentPromptBuilder.getSystemInfoFromUAData),
        O.getOrElse(() => `${platform} (${AgentPromptBuilder.detectOsFromUserAgent(userAgent)})`)
      );

      const userInfo = F.pipe(
        O.fromNullable(nav.language),
        O.getOrElse(() => "en"),
        (lang) => `user (${lang})`
      );

      const workingDirectory = window.location.pathname;

      return { currentDate, systemInfo, userInfo, workingDirectory };
    });

  readonly buildSystemPrompt = (opts: {
    readonly templateName: string;
    readonly options: AgentPromptOptions;
  }): Effect.Effect<string, TemplateNotFoundError> => {
    const templateOpt = this.getTemplate(opts.templateName);
    const getSystemInfoEffect = this.getSystemInfo();
    return Effect.gen(function* () {
      const { currentDate, systemInfo, userInfo } = yield* getSystemInfoEffect;
      const systemPrompt = yield* F.pipe(
        templateOpt,
        O.map((template) =>
          F.pipe(
            template.systemPrompt,
            Str.replace("{agentName}", opts.options.agentName),
            Str.replace("{agentDescription}", opts.options.agentDescription),
            Str.replace("{currentDate}", currentDate),
            Str.replace("{systemInfo}", systemInfo),
            Str.replace("{userInfo}", userInfo)
          )
        ),
        O.match({
          onNone: () => TemplateNotFoundError.new(opts.templateName),
          onSome: Effect.succeed,
        })
      );

      return F.pipe(
        opts.options.knownSkills,
        O.liftPredicate(A.isNonEmptyReadonlyArray),
        O.map((knownSkills) =>
          F.pipe(
            knownSkills,
            A.map(
              (s) =>
                `  <skill>\n    <name>${s.name}</name>\n    <description>${s.description}</description>\n  </skill>`
            ),
            A.join("\n")
          )
        ),
        O.match({
          onNone: () => systemPrompt,
          onSome: (skillsXml) => {
            const skillsSection = `
${SKILLS_INSTRUCTIONS}
<available_skills>
${skillsXml}
</available_skills>
`;

            return `${systemPrompt}${skillsSection}`;
          },
        })
      );
    });
  };

  readonly buildUserPrompt = (opts: {
    readonly templateName: string;
    readonly options: AgentPromptOptions;
  }): Effect.Effect<string, TemplateNotFoundError> => {
    const templateOpt = this.getTemplate(opts.templateName);

    return Effect.gen(function* () {
      const template = yield* templateOpt.pipe(
        O.match({
          onNone: () => TemplateNotFoundError.new(opts.templateName),
          onSome: Effect.succeed,
        })
      );

      return Str.replace("{userInput}", opts.options.userInput)(template.userPromptTemplate);
    });
  };

  readonly buildAgentMessages = (opts: { readonly templateName: string; readonly options: AgentPromptOptions }) => {
    const systemPromptEffect = this.buildSystemPrompt(opts);
    const userPromptEffect = this.buildUserPrompt(opts);

    return Effect.gen(function* () {
      const systemPrompt = yield* systemPromptEffect;
      const userPrompt = yield* userPromptEffect;
      const messages = ConversationMessages.init(
        new SystemChatMessage({
          content: systemPrompt,
          name: O.none(),
          toolCallId: O.none(),
          toolCalls: O.none(),
        })
      );

      if (A.isNonEmptyReadonlyArray(opts.options.conversationHistory)) {
        const filteredHistory = F.pipe(
          opts.options.conversationHistory,
          A.filter((msg) => !ChatMessageRole.is.system(msg.role))
        );

        messages.push(...filteredHistory);
      }

      if (
        F.pipe(
          opts.options.conversationHistory,
          A.get(A.length(opts.options.conversationHistory) - 1),
          O.flatMap(O.liftPredicate(P.not(ChatMessageRole.is.user))),
          O.isSome
        )
      ) {
        if (userPrompt && Str.isNonEmpty(userPrompt)) {
          messages.push(
            new UserChatMessage({
              content: userPrompt,
              name: O.none(),
              toolCallId: O.none(),
              toolCalls: O.none(),
            })
          );
        } else {
          messages.push(
            new UserChatMessage({
              content: opts.options.userInput,
              name: O.none(),
              toolCallId: O.none(),
              toolCalls: O.none(),
            })
          );
        }
      }

      return messages;
    });
  };
}
