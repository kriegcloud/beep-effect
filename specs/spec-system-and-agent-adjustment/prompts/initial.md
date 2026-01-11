I want to update the documentation in this repo related to spec initialization & execution (you will need to deploy 
sub-agents to identify files which should be updated) to create a systematic handoff process between the orchestration 
agent (the agent I'm directly communicating with as I am with you now) between different phases of spec initialization 
research, design, planning, boilerplating,  implementation, testing & review using a specialized `reflection` agent. Here is a list of what I mean.

# 1. folder structure
come up with a more systematic, efficient & clear folderstructure convention for spec folders such that all spec folders
follow the exact same structure
   - current relevant known files are specs/README.md & specs/SPEC_CREATION_GUIDE.md

# 2. New Specialized Agents
create new specialized agents optimized for tasks which need be performed at each phase of the spec workflow
- `recflector` - see [step 4](#5-reflection-)
- `codebase-researcher` - used to perform codebase exploration relevant to the spec
- `web-researcher` - used to perform research using the web relevant to the spec
- `mcp-researcher` - used to perform research using the mcp tools relevant to the spec
- `code-reviwer` - used to perform code review relevant of files created during spec implementation and should have expertise
- `code-observability-writer` - an expert at using TaggedErrors, `effect/Cause` with compehensive knowledge about effect logging utilities, tracing, spans, metrics, etc. It should be very familiar with this repositories observability tooling. It should be used to improve the logging and debug-ability of code written in the spec.
- `doc-writer` - used to perform documentation creation relevant to the spec whether that is inline jsdoc docstring's or dedicated markdown files. It should be familiar with this repositories documentation related
tooling (see documentation/cli/docgen) as well as the standards for documentation enforced by `docgen`.
- `architecture-pattern-enforcer` - an expert of architecture & code consistency used to enforce and maintain consistent folder structures, layering, naming conventions. Can come up with the ideal folder structure for the spec. how exports should be structured, module surface area, etc.
- `test-writer` - used to write unit & integration tests relevant to the spec. It should be very familiar with `effect` and its testing capabilities namely:
  - `effect/Layer`
  - `effect/Arbitrary` - The Arbitrary.make function allows for the creation of random values that align with a specific Schema<A, I, R>.
  - `effect/FastCheck` - Effect native integration of Property-based testing for JavaScript and TypeScript
  - `effect/TestClock` - allow for the control of time during tests
  - `effect/Config` & `effect/ConfigProvider`  - injecting configs for integration tests as well as this repos internal testing library [@beep/testkit](../../../tooling/testkit/AGENTS.md) for effectful testing

Sub-agents should be used to research and propose what should be included in each new agent's .md file in .claude/agents/. the proposal should be put into a markdown document for review by critic agents
with up to 3 cycles or until no more recommendations, issues or opportunities for improvement are found.

# 3. Phase breakdown
break down the end-to-end spec workflow from prompt-creation through review into phases. Each phase ends with a handoff 
prompt for a new instance of Claude to orchestrate sub-agents to execute the next phase. It is important that each new 
session preserve its context window using all best practices, tools & patterns to do so as each new instance is the 
orchestrator. bellow are some ideas for phases please critique them and come up with a final list of phases after 
performing a cost-benefit analysis of each phase
  - Phase 1: spec-initialization (systematic creation, exploration, planning & orchestration of the spec)
  - Phase 2: research (systematic exlporation to create a `.md` document with a name determined by [step 1](#1-folder-structure) containing a synthesized summary of the research performed by sub-agents deployed during this phase )
  - Phase 3: planning (systematic creation of a `.md` document with a name determined by [step 1](#1-folder-structure) containing a detailed checklist of tasks to track the progress of subsequent phases )
  - Phase 4: boilerplating (deploy code-writer sub-agents to create the initial boilerplate files for the spec. This phase should pass check, build & lint:fix at the end. and should only create files, stubs, types, schemas & utilities & jsdoc docstrings to guide the implementation phase based on the document produced by Phase 3 )
  - Phase 5: implementation (deploy code-writer agents to implement the spec based on the document produced by Phase 3. This phase should pass check, build & lint:fix at the end. )
  - Phase 6: testing (optional ask user if they want to perform testing. If so, deploy test-writer agents to create tests for the spec. This phase should pass check, build & lint:fix at the end. )
  - Phase 7: review (deploy code-reviewer agents to review the spec for alignment with repository guidlines & best practices.)

# 4. Agent outputs
When agents are deployed I want them to produce documents with a names determined by [step 1](#1-folder-structure). These should include but are not limited to:
- `reflection.md`- see [step 5](#5-reflection-)
- `summary.md` - a summary of it's task
- `initial-prompt.md` - the exact copy of the prompt the agent was first given when it was deployed

# 5. Reflection 
Both sub-agents & the orchestrator should create a `reflection.md` file at the end of each phase. The `reflection.md` 
contains essentially a "what worked?", "what didn't work?" and recommendations for how the initial prompt given to the 
Agent could have been improved to help with the orchestrators assigned work / tasks. The `reflection.md` should be 
created in an appropriate location that is intuitive and makes sense as per [step 1](#1-folder-structure). At the end of 
each phase a `reflection` agent will be deployed to analyze the reflections of the sub-agents & the orchestrator to 
provide the prompt for the next phase in addition to improving any documentation in the repo which led to or caused the issues
faced by the orchestrator & sub-agents providing a system of continuous improvement. You will need to perform research on how to
best create a `reflection` agent to perform this task. 

