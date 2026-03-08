import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { prov } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Prov from '../index.js';
import { RoleMixin } from './Role.js';

export interface Publisher<D extends RDF.DatasetCore = RDF.DatasetCore> extends Prov.Role<D>, rdfine.RdfResource<D> {
}

export function PublisherMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Publisher & RdfResourceCore> & Base {
  @rdfine.namespace(prov)
  class PublisherClass extends RoleMixin(Resource) {
  }
  return PublisherClass as any
}
PublisherMixin.appliesTo = prov.Publisher
PublisherMixin.createFactory = (env: RdfineEnvironment) => createFactory<Publisher>([RoleMixin, PublisherMixin], { types: [prov.Publisher] }, env)
