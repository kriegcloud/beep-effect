import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { as } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as As from '../index.js';
import { ActivityMixin } from './Activity.js';

export interface Announce<D extends RDF.DatasetCore = RDF.DatasetCore> extends As.Activity<D>, rdfine.RdfResource<D> {
}

export function AnnounceMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Announce & RdfResourceCore> & Base {
  @rdfine.namespace(as)
  class AnnounceClass extends ActivityMixin(Resource) {
  }
  return AnnounceClass as any
}
AnnounceMixin.appliesTo = as.Announce
AnnounceMixin.createFactory = (env: RdfineEnvironment) => createFactory<Announce>([ActivityMixin, AnnounceMixin], { types: [as.Announce] }, env)
