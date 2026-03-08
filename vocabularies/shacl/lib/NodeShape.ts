import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { sh } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Sh from '../index.js';
import { ShapeMixin } from './Shape.js';

export interface NodeShape<D extends RDF.DatasetCore = RDF.DatasetCore> extends Sh.Shape<D>, rdfine.RdfResource<D> {
  ignoredProperties: Array<RDF.Term>;
}

export function NodeShapeMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<NodeShape & RdfResourceCore> & Base {
  @rdfine.namespace(sh)
  class NodeShapeClass extends ShapeMixin(Resource) {
    @rdfine.property({ values: 'list' })
    ignoredProperties!: Array<RDF.Term>;
  }
  return NodeShapeClass as any
}
NodeShapeMixin.appliesTo = sh.NodeShape
NodeShapeMixin.createFactory = (env: RdfineEnvironment) => createFactory<NodeShape>([ShapeMixin, NodeShapeMixin], { types: [sh.NodeShape] }, env)
