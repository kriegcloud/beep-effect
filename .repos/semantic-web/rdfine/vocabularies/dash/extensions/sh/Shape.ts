import * as rdfine from '@tpluscode/rdfine';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { sh } from '@tpluscode/rdf-ns-builders';
import { dash } from '../../lib/namespace.js';
import type * as Dash from '../../index.js';
import type * as Rdfs from '@rdfine/rdfs';
import type * as Shacl from '@rdfine/shacl';
import { ClassMixin as RdfsClassMixin } from '@rdfine/rdfs/lib/Class';

interface ShapeEx<D extends RDF.DatasetCore = RDF.DatasetCore> {
  applicableToClass: Array<Rdfs.Class<D>>;
}

declare module '@rdfine/shacl/lib/Shape' {
  interface Shape<D extends RDF.DatasetCore> extends ShapeEx<D> {
  }
}

export function ShapeMixinEx<Base extends rdfine.ExtendingConstructor<Shacl.Shape, ShapeEx>>(Resource: Base): rdfine.Constructor<ShapeEx & RdfResourceCore> & Base {
  @rdfine.namespace(dash)
  class Impl extends Resource implements ShapeEx {
    @rdfine.property.resource({ values: 'array', as: [RdfsClassMixin] })
    applicableToClass!: Array<Rdfs.Class>;
  }
  return Impl
}
ShapeMixinEx.appliesTo = sh.Shape
