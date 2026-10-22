/**
 * The MDX node vocabulary: the JSX element pair, their attribute carriers,
 * the expression pair and the ESM block, shaped to the mdast-util-mdx
 * contracts.
 *
 * **Details**
 *
 * The parser never produces these nodes (MDX syntax is not parsed); they
 * exist so a synthesized tree can carry them and `Markdown.stringify` can
 * emit valid MDX. Construct with `X.make` like every node.
 *
 * **Gotchas**
 *
 * This leaf separates only the export surface. The schemas are defined
 * beside the core nodes, and the core content unions in
 * `@beep/markdown/MarkdownNode` (`FlowContent`, `PhrasingContent`,
 * `MarkdownNode`) include them, so importing the core leaf loads these
 * schemas too (D-43, option M3).
 *
 * @packageDocumentation
 * @since 0.0.0
 */

export {
  /**
   * MdxFlowExpression — an expression in flow (block) position (`{a + b}` on its own lines); `value` holds
   * the expression source text between the braces.
   *
   * @category models
   * @since 0.0.0
   */
  MdxFlowExpression,
  /**
   * MdxJsxAttribute — a named JSX attribute (`<a b="c" />`). `value` is a string literal, a {@link
   * MdxJsxAttributeValueExpression}, or — for a boolean attribute (`<a b />`) — absent or `null`, both of
   * which the mdast-util-mdx-jsx contract spells (its parser writes `null`; absence is the constructed-tree
   * spelling). The serializer treats the two identically.
   *
   * @category models
   * @since 0.0.0
   */
  MdxJsxAttribute,
  /**
   * The union of every node that may appear in a JSX element's `attributes` array. A real `Schema.Union`, as
   * documented on `RowContent`.
   *
   * @category schemas
   * @since 0.0.0
   */
  MdxJsxAttributeContent,
  /**
   * MdxJsxAttributeValueExpression — a JSX attribute value written as an expression (`<a b={c} />`); `value`
   * holds the expression source text between the braces, never evaluated or parsed.
   *
   * @category models
   * @since 0.0.0
   */
  MdxJsxAttributeValueExpression,
  /**
   * MdxJsxExpressionAttribute — a JSX attribute written whole as an expression (`<a {...b} />`); `value`
   * holds the expression source text between the braces.
   *
   * @category models
   * @since 0.0.0
   */
  MdxJsxExpressionAttribute,
  /**
   * MdxJsxFlowElement — a JSX element in flow (block) position (`<Component />` on its own lines). `name` is
   * `null` for a fragment (`<></>`); children are flow content, per the oracle's `BlockContent |
   * DefinitionContent` model.
   *
   * @category models
   * @since 0.0.0
   */
  MdxJsxFlowElement,
  /**
   * MdxJsxTextElement — a JSX element in text (phrasing) position (`a <b>c</b> d`). `name` is `null` for a
   * fragment; children are phrasing content. Refuses attributes on a fragment and an empty-string name, on
   * the same terms as {@link MdxJsxFlowElement}.
   *
   * @category models
   * @since 0.0.0
   */
  MdxJsxTextElement,
  /**
   * MdxjsEsm — an MDX ESM block (`import`/`export` statements); `value` holds the statement source verbatim.
   *
   * @category models
   * @since 0.0.0
   */
  MdxjsEsm,
  /**
   * MdxTextExpression — an expression in text (phrasing) position (`a {b} c`); `value` holds the expression
   * source text between the braces.
   *
   * @category models
   * @since 0.0.0
   */
  MdxTextExpression,
} from "./internal/nodes.ts";
export type {
  /**
   * The encoded (wire) shape of {@link MdxJsxAttributeContent}.
   *
   * @category type-level
   * @since 0.0.0
   */
  MdxJsxAttributeContentEncoded,
} from "./internal/nodes.ts";
