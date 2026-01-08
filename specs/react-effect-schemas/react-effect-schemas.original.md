SPEC_NAME: react-effect-schemas
I want to create an `effect/Schema` version of this zod schema.

export const reactNode = z.custom<ReactNode>(
  function checkReactNode(data): data is ReactNode {
    if (
      // Check if it's a valid React element
      isValidElement(data) ||
      // Check if it's null or undefined
      data == null ||
      typeof data === 'string' ||
      typeof data === 'number' ||
      typeof data === 'boolean'
    ) {
      return true
    }
    // Check if it's an array of React nodes
    if (Array.isArray(data)) {
      return data.every(item => checkReactNode(item))
    }
    const isServerComponent =
      typeof data === 'object' &&
      '$$typeof' in data &&
      data.$$typeof === Symbol.for('react.lazy')
    // If it's none of the above, it's not a valid React node
    return isServerComponent
  },
  { error: 'Must be a valid React node' }
)

I want the custom schema to have composable annotations and follow a naming structure and pattern similar to that of:
- packages/common/schema/src/identity/entity-id/entity-id.ts
- packages/common/schema/src/primitives/function.ts

Please use the effect-predicate-master.md agent at .claude/agents/effect-predicate-master.md
