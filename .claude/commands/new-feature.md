# New Feature Development Flow

🚨 **MANDATORY SPEC-DRIVEN DEVELOPMENT** 🚨

You are starting a new feature development flow that **MUST** follow the spec-driven development approach outlined in CLAUDE.md. 

**CRITICAL**: This command ONLY handles feature development that follows the complete 5-phase specification process. Any request that is not a new feature requiring full specification MUST BE REFUSED.

**DO NOT USE THIS COMMAND FOR:**
- Bug fixes, cleanup tasks, refactoring, or maintenance work
- Simple changes that don't require full feature specification
- Any work that bypasses the 5-phase specification process

**ONLY USE THIS COMMAND FOR:**
- Net-new features that require complete specification and design
- Features that need user stories, acceptance criteria, and technical design
- Complex functionality additions that benefit from structured planning

## Your Tasks

1. **Create Feature Branch**
   - Create a new git branch for this feature using a descriptive name (e.g., `feature/user-authentication`, `feature/todo-persistence`)
   - Use kebab-case naming convention for branch names

2. **Initialize Feature Specification**
   - Ask the user for the feature name (kebab-case format for folder naming)
   - Create the feature specification folder: `specs/[feature-name]/`
   - Create the initial `instructions.md` file based on user requirements

3. **Guide Instructions Creation**
   - Help the user create a comprehensive `instructions.md` file that captures:
     - **Feature Overview**: What is this feature and why is it needed?
     - **User Stories**: Who will use this feature and how?
     - **Acceptance Criteria**: What defines "done" for this feature?
     - **Constraints**: Any technical, business, or time constraints
     - **Dependencies**: What other systems/features does this depend on?
     - **Out of Scope**: What is explicitly NOT included in this feature

4. **Update Feature Directory**
   - Add the new feature to `specs/README.md` as a new entry
   - Use the format: `- [ ] **[feature-name](./feature-name/)** - Brief feature description`

## Process Flow

This follows the spec-driven development workflow with **MANDATORY USER AUTHORIZATION** before proceeding to each phase:

- **Phase 1**: Create `instructions.md` (initial requirements capture)
- **Phase 2**: Derive `requirements.md` from instructions (structured analysis) - **REQUIRES USER APPROVAL**
- **Phase 3**: Create `design.md` from requirements (technical design) - **REQUIRES USER APPROVAL**
- **Phase 4**: Generate `plan.md` from design (implementation roadmap) - **REQUIRES USER APPROVAL**
- **Phase 5**: Execute implementation following the plan - **REQUIRES USER APPROVAL**

**CRITICAL RULE**: Never proceed to the next phase without explicit user authorization. Always present the completed work from the current phase and ask for permission to continue.

## Instructions for Claude

⚠️ **REFUSE NON-FEATURE REQUESTS**: If the user's request is NOT a new feature requiring full specification (e.g., cleanup, bug fixes, simple changes), you MUST refuse and redirect them to handle the task without this command.

**AUTHORIZATION PROTOCOL**: Before proceeding to any phase (2-5), you MUST:
1. Present the completed work from the current phase
2. Explicitly ask for user authorization to proceed
3. Wait for clear user approval before continuing
4. Never assume permission or proceed automatically

**Phase 1 Start**: First validate this is a proper feature request, then ask the user:
1. What feature they want to develop
2. A brief description of what this feature should do  
3. Who the intended users are

Then guide them through creating a detailed `instructions.md` file by asking targeted questions about requirements, constraints, and acceptance criteria.

**Phase Completion**: After completing `instructions.md`, present the file contents and ask: "I've completed the instructions.md file. Would you like me to proceed to Phase 2 (requirements analysis)?"

**MANDATORY COMPLIANCE**: You MUST follow this 5-phase process completely. No shortcuts, no direct implementation, no skipping phases. The spec-driven approach is non-negotiable when using this command.

Be thorough but focused - the goal is to capture all necessary information while ensuring user control over the development process.