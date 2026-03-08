import type { SubTyped, Typed } from '../types.js';
import type {
  TransformContext,
  VisitContext,
} from './TransformerObject.js';
import type { DefaultNodePreVisitor, Safeness, SafeWrap } from './TransformerTyped.js';
import { TransformerTyped } from './TransformerTyped.js';

export class TransformerSubTyped<Nodes extends Typed> extends TransformerTyped<Nodes> {
  public constructor(
    defaultContext: TransformContext = {},
    defaultNodePreVisitor: DefaultNodePreVisitor<Nodes> = {},
  ) {
    super(defaultContext, defaultNodePreVisitor);
  };

  public override clone(
    newDefaultContext: TransformContext = {},
    newDefaultNodePreVisitor: DefaultNodePreVisitor<Nodes> = {},
  ): TransformerSubTyped<Nodes> {
    return new TransformerSubTyped(
      { ...this.defaultContext, ...newDefaultContext },
      { ...this.defaultNodePreVisitor, ...newDefaultNodePreVisitor },
    );
  }

  /**
   * Transform a single node ({@link Typed}).
   * Similar to {@link this.transformNode} but also allowing you to target the subTypes.
   * @param startObject the object from which we will start the transformation,
   *   potentially visiting and transforming its descendants along the way.
   * @param nodeCallBacks a dictionary mapping the various operation types to objects optionally
   *    containing preVisitor and transformer.
   *    The preVisitor allows you to provide {@link TransformContext} for the current object,
   *    altering how it will be transformed.
   *    The transformer allows you to manipulate the copy of the current object,
   *    and expects you to return the value that should take the current objects place.
   * @param nodeSpecificCallBacks Same as nodeCallBacks but using an additional level of indirection to
   *     indicate the subType.
   * @return the result of transforming the requested descendant operations (based on the preVisitor)
   * using a transformer that works its way back up from the descendant to the startObject.
   */
  public transformNodeSpecific<Safe extends Safeness = 'safe', OutType = unknown>(
    startObject: object,
    nodeCallBacks: {[T in Nodes['type']]?: {
      transform?: (copy: SafeWrap<Safe, Extract<Nodes, Typed<T>>>, orig: Extract<Nodes, Typed<T>>) => unknown;
      preVisitor?: (orig: Extract<Nodes, Typed<T>>) => TransformContext;
    }},
    nodeSpecificCallBacks: {[Type in Nodes['type']]?: {
      [SubType in Extract<Nodes, SubTyped<Type>>['subType']]?: {
        transform?: (op: SafeWrap<Safe, Extract<Nodes, SubTyped<Type, SubType>>>) => unknown;
        preVisitor?: (op: Extract<Nodes, SubTyped<Type, SubType>>) => TransformContext;
      }}},
  ): Safe extends 'unsafe' ? OutType : unknown {
    const transformWrapper = (copy: object, orig: object): unknown => {
      let ogTransform: ((copy: any, orig: any) => unknown) | undefined;
      const casted = <SubTyped<Nodes['type']>>copy;
      if (casted.type && casted.subType) {
        const specific = nodeSpecificCallBacks[casted.type];
        if (specific) {
          ogTransform = specific[<keyof typeof specific> casted.subType]?.transform;
        }
        if (!ogTransform) {
          ogTransform = nodeCallBacks[casted.type]?.transform;
        }
      }
      return ogTransform ? ogTransform(casted, orig) : copy;
    };
    const preVisitWrapper = (curObject: object): VisitContext => {
      let ogPreVisit: ((node: any) => VisitContext) | undefined;
      const casted = <SubTyped<Nodes['type']>>curObject;
      if (casted.type && casted.subType) {
        const specific = nodeSpecificCallBacks[casted.type];
        if (specific) {
          ogPreVisit = specific[<keyof typeof specific> casted.subType]?.preVisitor;
        }
        if (!ogPreVisit) {
          ogPreVisit = nodeCallBacks[casted.type]?.preVisitor;
        }
      }
      return ogPreVisit ? ogPreVisit(casted) : {};
    };
    return <any> this.transformObject(startObject, transformWrapper, preVisitWrapper);
  }

  /**
   * Visit a selected subTree given a startObject, steering the visits based on {@link Typed} nodes.
   * Similar to {@link this.visitNode}, but also allowing you to target subTypes.
   * Will call the preVisitor on the outer distinct, then the visitor of the special distinct,
   * followed by the visiting the outer distinct, printing '231'.
   * The pre-visitor visits starting from the root, going deeper, while the actual visitor goes in reverse.
   * @param startObject the object from which we will start visiting,
   *   potentially visiting its descendants along the way.
   * @param nodeCallBacks a dictionary mapping the various operation types to objects optionally
   *    containing preVisitor and visitor.
   *    The preVisitor allows you to provide {@link VisitContext} for the current object,
   *    altering how it will be visited.
   *    The visitor allows you to visit the object from deepest to the outermost object.
   *    This is useful if you for example want to manipulate the objects you visit during your visits,
   *    similar to {@link mapOperation}.
   * @param nodeSpecificCallBacks Same as nodeCallBacks but using an additional level of indirection to
   *     indicate the subType.
   */
  public visitNodeSpecific(
    startObject: object,
    nodeCallBacks: {[T in Nodes['type']]?: {
      visitor?: (op: Extract<Nodes, Typed<T>>) => void;
      preVisitor?: (op: Extract<Nodes, Typed<T>>) => VisitContext;
    }},
    nodeSpecificCallBacks: {[Type in Nodes['type']]?:
      {[Subtype in Extract<Nodes, SubTyped<Type>>['subType']]?: {
        visitor?: (op: Extract<Nodes, SubTyped<Type, Subtype>>) => void;
        preVisitor?: (op: Extract<Nodes, SubTyped<Type, Subtype>>) => VisitContext;
      }}},
  ): void {
    const visitWrapper = (curObject: object): void => {
      let ogTransform: ((node: any) => void) | undefined;
      const casted = <SubTyped<Nodes['type']>>curObject;
      if (casted.type && casted.subType) {
        const specific = nodeSpecificCallBacks[casted.type];
        if (specific) {
          ogTransform = specific[<keyof typeof specific> casted.subType]?.visitor;
        }
        if (!ogTransform) {
          ogTransform = nodeCallBacks[casted.type]?.visitor;
        }
      }
      if (ogTransform) {
        ogTransform(casted);
      }
    };
    const preVisitWrapper = (curObject: object): VisitContext => {
      let ogPreVisit: ((node: any) => VisitContext) | undefined;
      const casted = <SubTyped<Nodes['type']>>curObject;
      if (casted.type && casted.subType) {
        const specific = nodeSpecificCallBacks[casted.type];
        if (specific) {
          ogPreVisit = specific[<keyof typeof specific> casted.subType]?.preVisitor;
        }
        if (!ogPreVisit) {
          ogPreVisit = nodeCallBacks[casted.type]?.preVisitor;
        }
      }
      return ogPreVisit ? ogPreVisit(casted) : {};
    };
    this.visitObject(startObject, visitWrapper, preVisitWrapper);
  }
}
