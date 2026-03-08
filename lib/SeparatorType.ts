/**
 * A type of JSON separator.
 */
export class SeparatorType {

  public static readonly COMMA = new SeparatorType(',');
  public static readonly OBJECT_START = new SeparatorType('{');
  public static readonly OBJECT_END = new SeparatorType('}');
  public static readonly OBJECT_END_COMMA = new SeparatorType('},');
  public static readonly ARRAY_START = new SeparatorType('[');
  public static readonly ARRAY_END = new SeparatorType(']');
  public static readonly ARRAY_END_COMMA = new SeparatorType('],');
  public static readonly GRAPH_FIELD_NONCOMPACT = new SeparatorType('"@graph": [');
  public static readonly GRAPH_FIELD_COMPACT = new SeparatorType('"@graph":[');
  public static readonly CONTEXT_FIELD = new SeparatorType('"@context":');

  public readonly label: string;

  private constructor(label: string) {
    this.label = label;
  }
}
