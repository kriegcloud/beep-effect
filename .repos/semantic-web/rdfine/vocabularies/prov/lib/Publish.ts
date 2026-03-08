import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { prov } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Prov from '../index.js';
import { ActivityMixin } from './Activity.js';

export interface Publish<D extends RDF.DatasetCore = RDF.DatasetCore> extends Prov.Activity<D>, rdfine.RdfResource<D> {
}

export function PublishMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Publish & RdfResourceCore> & Base {
  @rdfine.namespace(prov)
  class PublishClass extends ActivityMixin(Resource) {
  }
  return PublishClass as any
}
PublishMixin.appliesTo = prov.Publish
PublishMixin.createFactory = (env: RdfineEnvironment) => createFactory<Publish>([ActivityMixin, PublishMixin], { types: [prov.Publish] }, env)
