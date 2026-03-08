import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { as } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as As from '../index.js';
import { ActivityMixin } from './Activity.js';

export interface Flag<D extends RDF.DatasetCore = RDF.DatasetCore> extends As.Activity<D>, rdfine.RdfResource<D> {
}

export function FlagMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Flag & RdfResourceCore> & Base {
  @rdfine.namespace(as)
  class FlagClass extends ActivityMixin(Resource) {
  }
  return FlagClass as any
}
FlagMixin.appliesTo = as.Flag
FlagMixin.createFactory = (env: RdfineEnvironment) => createFactory<Flag>([ActivityMixin, FlagMixin], { types: [as.Flag] }, env)
