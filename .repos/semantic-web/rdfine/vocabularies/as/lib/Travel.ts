import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { as } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as As from '../index.js';
import { IntransitiveActivityMixin } from './IntransitiveActivity.js';

export interface Travel<D extends RDF.DatasetCore = RDF.DatasetCore> extends As.IntransitiveActivity<D>, rdfine.RdfResource<D> {
}

export function TravelMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Travel & RdfResourceCore> & Base {
  @rdfine.namespace(as)
  class TravelClass extends IntransitiveActivityMixin(Resource) {
  }
  return TravelClass as any
}
TravelMixin.appliesTo = as.Travel
TravelMixin.createFactory = (env: RdfineEnvironment) => createFactory<Travel>([IntransitiveActivityMixin, TravelMixin], { types: [as.Travel] }, env)
