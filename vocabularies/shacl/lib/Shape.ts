import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { sh } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Sh from '../index.js';
import type * as Rdf from '@rdfine/rdf';
import type * as Rdfs from '@rdfine/rdfs';
import { ResourceMixin as RdfsResourceMixin } from '@rdfine/rdfs/lib/Resource';
import { ClassMixin as RdfsClassMixin } from '@rdfine/rdfs/lib/Class';
import { PropertyMixin as RdfPropertyMixin } from '@rdfine/rdf/lib/Property';

export interface Shape<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rdfs.Resource<D>, rdfine.RdfResource<D> {
  and: Array<Sh.Shape<D>>;
  class: Rdfs.Class<D> | undefined;
  closed: boolean | undefined;
  in: Array<RDF.Term>;
  node: Sh.NodeShape<D> | undefined;
  nodeKind: Sh.NodeKind | undefined;
  or: Array<Sh.Shape<D>>;
  property: Array<Sh.PropertyShape<D>>;
  rule: Sh.Rule<D> | undefined;
  severity: Sh.Severity<D> | undefined;
  sparql: Sh.SPARQLConstraint<D> | undefined;
  target: Sh.Target<D> | undefined;
  targetClass: Array<Rdfs.Class<D>>;
  targetNode: Array<RDF.Term>;
  targetObjectsOf: Rdf.Property<D> | undefined;
  targetSubjectsOf: Rdf.Property<D> | undefined;
  xone: Array<Sh.Shape<D>>;
}

export function ShapeMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Shape & RdfResourceCore> & Base {
  @rdfine.namespace(sh)
  class ShapeClass extends RdfsResourceMixin(Resource) {
    @rdfine.property.resource({ values: 'list', as: [ShapeMixin] })
    and!: Array<Sh.Shape>;
    @rdfine.property.resource({ as: [RdfsClassMixin] })
    class: Rdfs.Class | undefined;
    @rdfine.property.literal({ type: Boolean })
    closed: boolean | undefined;
    @rdfine.property({ values: 'list' })
    in!: Array<RDF.Term>;
    @rdfine.property.resource({ implicitTypes: [sh.NodeShape] })
    node: Sh.NodeShape | undefined;
    @rdfine.property()
    nodeKind: Sh.NodeKind | undefined;
    @rdfine.property.resource({ values: 'list', as: [ShapeMixin] })
    or!: Array<Sh.Shape>;
    @rdfine.property.resource({ values: 'array', implicitTypes: [sh.PropertyShape] })
    property!: Array<Sh.PropertyShape>;
    @rdfine.property.resource({ implicitTypes: [sh.Rule] })
    rule: Sh.Rule | undefined;
    @rdfine.property.resource({ implicitTypes: [sh.Severity] })
    severity: Sh.Severity | undefined;
    @rdfine.property.resource({ implicitTypes: [sh.SPARQLConstraint] })
    sparql: Sh.SPARQLConstraint | undefined;
    @rdfine.property.resource({ implicitTypes: [sh.Target] })
    target: Sh.Target | undefined;
    @rdfine.property.resource({ values: 'array', as: [RdfsClassMixin] })
    targetClass!: Array<Rdfs.Class>;
    @rdfine.property({ values: 'array' })
    targetNode!: Array<RDF.Term>;
    @rdfine.property.resource({ as: [RdfPropertyMixin] })
    targetObjectsOf: Rdf.Property | undefined;
    @rdfine.property.resource({ as: [RdfPropertyMixin] })
    targetSubjectsOf: Rdf.Property | undefined;
    @rdfine.property.resource({ values: 'list', as: [ShapeMixin] })
    xone!: Array<Sh.Shape>;
  }
  return ShapeClass as any
}
ShapeMixin.appliesTo = sh.Shape
ShapeMixin.createFactory = (env: RdfineEnvironment) => createFactory<Shape>([RdfsResourceMixin, ShapeMixin], { types: [sh.Shape] }, env)
