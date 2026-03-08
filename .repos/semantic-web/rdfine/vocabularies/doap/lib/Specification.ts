import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { doap } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Doap from '../index.js';
import type * as Rdfs from '@rdfine/rdfs';
import { ResourceMixin as RdfsResourceMixin } from '@rdfine/rdfs/lib/Resource';

export interface Specification<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rdfs.Resource<D>, rdfine.RdfResource<D> {
}

export function SpecificationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Specification & RdfResourceCore> & Base {
  @rdfine.namespace(doap)
  class SpecificationClass extends RdfsResourceMixin(Resource) {
  }
  return SpecificationClass as any
}
SpecificationMixin.appliesTo = doap.Specification
SpecificationMixin.createFactory = (env: RdfineEnvironment) => createFactory<Specification>([RdfsResourceMixin, SpecificationMixin], { types: [doap.Specification] }, env)
