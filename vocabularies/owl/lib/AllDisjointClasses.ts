import '../extensions/rdfs/Resource.js';
import { ResourceMixinEx } from '../extensions/rdfs/Resource.js';
import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { owl } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Owl from '../index.js';
import type * as Rdfs from '@rdfine/rdfs';
import { ResourceMixin as RdfsResourceMixin } from '@rdfine/rdfs/lib/Resource';

export interface AllDisjointClasses<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rdfs.Resource<D>, rdfine.RdfResource<D> {
}

export function AllDisjointClassesMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<AllDisjointClasses & RdfResourceCore> & Base {
  @rdfine.namespace(owl)
  class AllDisjointClassesClass extends ResourceMixinEx(RdfsResourceMixin(Resource)) {
  }
  return AllDisjointClassesClass as any
}
AllDisjointClassesMixin.appliesTo = owl.AllDisjointClasses
AllDisjointClassesMixin.createFactory = (env: RdfineEnvironment) => createFactory<AllDisjointClasses>([RdfsResourceMixin, AllDisjointClassesMixin], { types: [owl.AllDisjointClasses] }, env)
