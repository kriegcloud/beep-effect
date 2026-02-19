# Refine Prompt Command

This command uses the prompt-refiner agent.

See `.claude/agents/prompt-refiner.md` for full implementation.

## Usage

```
/refine-prompt SPEC_NAME: <kebab-case-name>
<raw prompt content>
```

## Example

```
/refine-prompt SPEC_NAME: mock-s3-simulation
I want to create a simulation of uploading a file to s3 using the `createMockS3Layer` in @scratchpad/index.ts using `@effect/platform`.
```

The prompt-refiner agent will:
1. Create `specs/<prompt-name>/` directory
2. Save original to `specs/<prompt-name>/<prompt-name>.original.md`
3. Explore codebase for relevant files and patterns
4. Generate refined prompt at `specs/<prompt-name>/<prompt-name>.prompt.md`
5. Review and iterate up to 3 times
6. Present final refined prompt
