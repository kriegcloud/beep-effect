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

export interface AllDisjointProperties<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rdfs.Resource<D>, rdfine.RdfResource<D> {
}

export function AllDisjointPropertiesMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<AllDisjointProperties & RdfResourceCore> & Base {
  @rdfine.namespace(owl)
  class AllDisjointPropertiesClass extends ResourceMixinEx(RdfsResourceMixin(Resource)) {
  }
  return AllDisjointPropertiesClass as any
}
AllDisjointPropertiesMixin.appliesTo = owl.AllDisjointProperties
AllDisjointPropertiesMixin.createFactory = (env: RdfineEnvironment) => createFactory<AllDisjointProperties>([RdfsResourceMixin, AllDisjointPropertiesMixin], { types: [owl.AllDisjointProperties] }, env)
