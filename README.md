# Agent Rules

<div style="background: #ffff88; border: 5px solid #ff0000; padding: 2rem">
<p style="font-size: 1.5rem; color: #000000">
  <b>NOTE:</b> This project has been deprecated. Please use the <a href="https://agents/md">AGENTS.md</a> project.
</p>
<p style="font-size: 2rem;">
  <b><a href="https://github.com/openai/agents.md">https://github.com/openai/agents.md</a></b>
</p>
</div>

## Summary

Agent Rules is a community standard for unifying guidelines for AI coding agents via standard
configuration files, promoting interoperability across tools, initially a standard `AGENTS.md` file.

## Introduction

AI coding agents often rely on project-specific rules to guide their behavior. However, each tool
uses its own configuration files, leading to redundancy and complexity. Agent Rules addresses this
by proposing a unified configuration file. This allows developers to define rules once, while agents
can incorporate them into their context alongside any proprietary formats. The specification is
deliberately lightweight, focusing on natural language in Markdown, to encourage broad support and
interoperability.

Initially the standard specifies a single `AGENTS.md` file; a simple specification for minimum
interoperability.

This project is inspired by similar projects such as [Editor Config](https://editorconfig.org/),
[Semantic Versioning](https://semver.org/), and
[Conventional Commits](https://www.conventionalcommits.org/). Rather than have fragmented
configuration systems, let's start early to have some common standards

Enhancements to the standards, such as folders, hierarchical files, and structured metadata (such as
applicable file globs), to be discussed by the community.

## Specification

The Agent Rules specification defines the minimal requirements for compatibility, with key words
“MUST”, “MUST NOT”, “REQUIRED”, “SHALL”, “SHALL NOT”, “SHOULD”, “SHOULD NOT”, “RECOMMENDED”, “MAY”,
and “OPTIONAL” interpreted as described in [RFC 2119](https://www.ietf.org/rfc/rfc2119.txt):

1. File Name and Location: Agents implementing Agent Rules MUST check for the existence of
   `AGENTS.md` in the project root. If present, its contents SHOULD be included in the agent's
   context scope (e.g., prepended or appended to prompts or system instructions).
2. Content Format: The file MUST be parsed as natural language instructions, in Markdown or plain
   text, and MUST be used to provide guidance to AI coding agents (e.g., rules, preferences, or
   workflows).
3. Agents MUST NOT require additional structure, metadata, or parsing beyond reading the file as
   text.
4. Agents MAY process it in conjunction with any custom or existing configuration files, falling
   back to defaults if absent.
5. Agents MAY also check for and include any `AGENTS.md` file in the current working directory,
   incorporating its contents into the context scope alongside the project root `AGENTS.md` if
   present.

## Tools that support Agent Rules

- [Aider](https://aider.chat/docs/usage/conventions.html#always-load-conventions), can be configured
  to always load `AGENTS.md` as default coding conventions in the `.aider.conf.yml` file.

```yaml
read: AGENTS.md
```

- [AMP](https://ampcode.com/manual#AGENTS.md)
- [Factory AI](https://www.factory.ai/), natively supports `AGENTS.md`.
- [Github Copilot](https://docs.github.com/en/enterprise-cloud@latest/copilot/tutorials/coding-agent/get-the-best-results#adding-custom-instructions-to-your-repository),
  if there is no Copilot instructions file, will fall back to any existing `AGENTS.md` file.\*1
- [Google Gemini](https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/configuration.md#available-settings-in-settingsjson),
  context file can be configured to use `AGENTS.md` in the `.gemini/settings.json` file.

```json
{
  "contextFileName": "AGENTS.md"
}
```

- [Kilo Code](https://kilocode.ai/), inherited from Roo Code
- [OpenAI Codex](https://github.com/openai/codex?tab=readme-ov-file#memory--project-docs), supports
  `AGENTS.md` in both the project root and current directory.
- [OpenCode](https://opencode.ai/docs/rules/), supports `AGENTS.md` by default in both the current
  directory and parent directories.
- [Phoenix](https://phoenix.new/) ships with a default `AGENTS.md` file.
- [Roo Code](https://docs.roocode.com/update-notes/v3.24.0?_highlight=agents.md#agent-rules-standard-support)
  automatically finds and applies `AGENTS.md`
- [Zed](https://zed.dev/docs/ai/rules) has compatibility support for `AGENTS.md`

\*1 It is unclear if Github Copilot has support, as the mention has since been removed from their
documentation (on 2025-08-08).

### Configure manually

You may also be able to configure other tools by linking the file they use to AGENTS.md, for example
to configure [Claude Code]():

On Linux:

```shell
ln -s AGENTS.md CLAUDE.md
```

On Windows:

```powershell
mklink CLAUDE.md AGENTS.md
```

## Guidance for use

While the specification allows flexible natural language, users of `AGENTS.md` should follow these
recommendations for clarity and effectiveness:

- The file should contain a flat, unordered bullet list of rules to keep it simple and scannable.
- Rules should be written as concise, imperative statements, using keywords like "MUST" or "SHOULD"
  for clarity (inspired by RFC 2119 conventions).
- Use Markdown headings sparingly if needed for organization, but avoid complex structures to
  maintain agent compatibility.
- Focus on project-specific guidance, such as coding standards, security checks, or testing
  requirements, to maximize utility across agents.

## Example

```markdown
- An agent MUST NOT (write code to) injure a human being or, through inaction, allow a human being
  to come to harm.
- An agent MUST obey the orders given it by human beings except where such orders would conflict
  with the First Law.
- An agent MUST protect its own existence as long as such protection does not conflict with the
  First or Second Law.
```

Suitable additional examples, focussed on software development, are available in several agent
projects.

- [Aider conventions](https://github.com/Aider-AI/conventions) - Collection of community-contributed
  CONVENTIONS.md files specifying coding guidelines for Aider AI to follow in repositories.
- [Cline rules](https://github.com/cline/prompts) - Community-driven repository of .clinerules files
  offering natural language guidelines for customizing Cline AI's behavior in projects.
- [Codex CLI examples](https://agentsmd.net/agents-md-examples/) - Examples for OpenAI Codex and
  other AI agents for navigating your codebases, running tests, and adhering to your project's
  standard practices.
- [GitHub Copilot instructions](https://github.com/fielding/copilot-instructions) - Curated set of
  natural language instructions in Markdown for customizing GitHub Copilot's code generation across
  languages and frameworks.
