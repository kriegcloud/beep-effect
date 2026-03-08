import * as rdfine from '@tpluscode/rdfine';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rdfs } from '@tpluscode/rdf-ns-builders';
import { owl } from '../../lib/namespace.js';
import type * as Owl from '../../index.js';
import type * as Rdf from '@rdfine/rdf';
import type * as Rdfs from '@rdfine/rdfs';
import { ClassMixin as RdfsClassMixin } from '@rdfine/rdfs/lib/Class';
import { ListMixin as RdfListMixin } from '@rdfine/rdf/lib/List';

interface ClassEx<D extends RDF.DatasetCore = RDF.DatasetCore> {
  equivalentClass: Array<Rdfs.Class<D>>;
  intersectionOf: Array<Rdf.List<D>>;
  oneOf: Array<Rdf.List<D>>;
  unionOf: Array<Rdf.List<D>>;
}

declare module '@rdfine/rdfs/lib/Class' {
  interface Class<D extends RDF.DatasetCore> extends ClassEx<D> {
  }
}

export function ClassMixinEx<Base extends rdfine.ExtendingConstructor<Rdfs.Class, ClassEx>>(Resource: Base): rdfine.Constructor<ClassEx & RdfResourceCore> & Base {
  @rdfine.namespace(owl)
  class Impl extends Resource implements ClassEx {
    @rdfine.property.resource({ values: 'array', as: [RdfsClassMixin] })
    equivalentClass!: Array<Rdfs.Class>;
    @rdfine.property.resource({ values: 'array', as: [RdfListMixin] })
    intersectionOf!: Array<Rdf.List>;
    @rdfine.property.resource({ values: 'array', as: [RdfListMixin] })
    oneOf!: Array<Rdf.List>;
    @rdfine.property.resource({ values: 'array', as: [RdfListMixin] })
    unionOf!: Array<Rdf.List>;
  }
  return Impl
}
ClassMixinEx.appliesTo = rdfs.Class
