import type { Typed } from '../types.js';
import type { TransformContext, VisitContext } from './TransformerObject.js';
import { TransformerObject } from './TransformerObject.js';

export type Safeness = 'safe' | 'unsafe';
export type SafeWrap<Safe extends Safeness, obj extends object> =
  Safe extends 'safe' ? {[key in keyof obj]: unknown } : obj;

export type DefaultNodePreVisitor<Nodes extends Typed> = {[T in Nodes['type']]?: TransformContext };

export class TransformerTyped<Nodes extends Typed> extends TransformerObject {
  public constructor(
    defaultContext: TransformContext = {},
    protected defaultNodePreVisitor: DefaultNodePreVisitor<Nodes> = {},
  ) {
    super(defaultContext);
  };

  public override clone(
    newDefaultContext: TransformContext = {},
    newDefaultNodePreVisitor: DefaultNodePreVisitor<Nodes> = {},
  ): TransformerTyped<Nodes> {
    return new TransformerTyped(
      { ...this.defaultContext, ...newDefaultContext },
      { ...this.defaultNodePreVisitor, ...newDefaultNodePreVisitor },
    );
  }

  /**
   * Transform a single node ({@link Typed}).
   * @param startObject the object from which we will start the transformation,
   *   potentially visiting and transforming its descendants along the way.
   * @param nodeCallBacks a dictionary mapping the various node types to objects optionally
   *    containing preVisitor and transformer.
   *    The preVisitor allows you to provide {@link TransformContext} for the current object,
   *    altering how it will be transformed.
   *    The transformer allows you to manipulate the copy of the current object,
   *    and expects you to return the value that should take the current objects place.
   * @return the result of transforming the requested descendant operations (based on the preVisitor)
   * using a transformer that works its way back up from the descendant to the startObject.
   */
  public transformNode<Safe extends Safeness = 'safe', OutType = unknown>(
    startObject: object,
    nodeCallBacks: {[T in Nodes['type']]?: {
      transform?: (copy: SafeWrap<Safe, Extract<Nodes, Typed<T>>>, orig: Extract<Nodes, Typed<T>>) => unknown;
      preVisitor?: (orig: Extract<Nodes, Typed<T>>) => TransformContext;
    }},
  ): Safe extends 'unsafe' ? OutType : unknown {
    const transformWrapper = (copy: object, orig: object): unknown => {
      let ogTransform: ((copy: any, orig: any) => unknown) | undefined;
      const casted = <Typed<Nodes['type']>>copy;
      if (casted.type) {
        ogTransform = nodeCallBacks[casted.type]?.transform;
      }
      return ogTransform ? ogTransform(casted, orig) : copy;
    };
    const nodeDefaults = this.defaultNodePreVisitor;
    const preVisitWrapper = (curObject: object): VisitContext => {
      let ogPreVisit: ((node: any) => VisitContext) | undefined;
      let nodeContext: VisitContext = {};
      const casted = <Typed<Nodes['type']>>curObject;
      if (casted.type) {
        ogPreVisit = nodeCallBacks[casted.type]?.preVisitor;
        nodeContext = nodeDefaults[casted.type] ?? nodeContext;
      }
      return ogPreVisit ? { ...nodeContext, ...ogPreVisit(casted) } : nodeContext;
    };
    return <any> this.transformObject(startObject, transformWrapper, preVisitWrapper);
  }

  /**
   * Visit a selected subTree given a startObject, steering the visits based on {@link Typed} nodes.
   * Will first call the preVisitor on the project and notice it should not iterate on its descendants.
   * It then visits the project, and the outermost distinct, printing '21'.
   * The pre-visitor visits starting from the root, going deeper, while the actual visitor goes in reverse.
   * @param startObject the object from which we will start visiting,
   *   potentially visiting its descendants along the way.
   * @param nodeCallBacks a dictionary mapping the various operation types to objects optionally
   *    containing preVisitor and visitor.
   *    The preVisitor allows you to provide {@link VisitContext} for the current object,
   *    altering how it will be visited.
   *    The visitor allows you to visit the object from deepest to the outermost object.
   *    This is useful if you for example want to manipulate the objects you visit during your visits,
   *    similar to {@link this.transformNode}.
   */
  public visitNode(
    startObject: object,
    nodeCallBacks: {[T in Nodes['type']]?: {
      visitor?: (op: Extract<Nodes, Typed<T>>) => void;
      preVisitor?: (op: Extract<Nodes, Typed<T>>) => VisitContext;
    }},
  ): void {
    const visitorWrapper = (curObject: object): void => {
      const casted = <Typed<Nodes['type']>>curObject;
      if (casted.type) {
        const ogTransform = nodeCallBacks[casted.type]?.visitor;
        if (ogTransform) {
          ogTransform(<any> casted);
        }
      }
    };
    const nodeDefaults = this.defaultNodePreVisitor;
    const preVisitWrapper = (curObject: object): VisitContext => {
      let ogPreVisit: ((node: any) => VisitContext) | undefined;
      let nodeContext: VisitContext = {};
      const casted = <Typed<Nodes['type']>>curObject;
      if (casted.type) {
        ogPreVisit = nodeCallBacks[casted.type]?.preVisitor;
        nodeContext = nodeDefaults[casted.type] ?? nodeContext;
      }
      return ogPreVisit ? { ...nodeContext, ...ogPreVisit(casted) } : nodeContext;
    };
    return this.visitObject(startObject, visitorWrapper, preVisitWrapper);
  }
}
