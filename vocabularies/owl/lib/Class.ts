import '../extensions/rdfs/Class.js';
import { ClassMixinEx } from '../extensions/rdfs/Class.js';
import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { owl } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Owl from '../index.js';
import type * as Rdf from '@rdfine/rdf';
import type * as Rdfs from '@rdfine/rdfs';
import { ClassMixin as RdfsClassMixin } from '@rdfine/rdfs/lib/Class';
import { ListMixin as RdfListMixin } from '@rdfine/rdf/lib/List';

export interface Class<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rdfs.Class<D>, rdfine.RdfResource<D> {
  complementOf: Owl.Class<D> | undefined;
  disjointUnionOf: Rdf.List<D> | undefined;
  disjointWith: Owl.Class<D> | undefined;
  hasKey: Rdf.List<D> | undefined;
}

export function ClassMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Class & RdfResourceCore> & Base {
  @rdfine.namespace(owl)
  class ClassClass extends ClassMixinEx(RdfsClassMixin(Resource)) {
    @rdfine.property.resource({ as: [ClassMixin] })
    complementOf: Owl.Class | undefined;
    @rdfine.property.resource({ as: [RdfListMixin] })
    disjointUnionOf: Rdf.List | undefined;
    @rdfine.property.resource({ as: [ClassMixin] })
    disjointWith: Owl.Class | undefined;
    @rdfine.property.resource({ as: [RdfListMixin] })
    hasKey: Rdf.List | undefined;
  }
  return ClassClass as any
}
ClassMixin.appliesTo = owl.Class
ClassMixin.createFactory = (env: RdfineEnvironment) => createFactory<Class>([RdfsClassMixin, ClassMixin], { types: [owl.Class] }, env)
