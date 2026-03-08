import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { as } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as As from '../index.js';
import { IntransitiveActivityMixin } from './IntransitiveActivity.js';

export interface Arrive<D extends RDF.DatasetCore = RDF.DatasetCore> extends As.IntransitiveActivity<D>, rdfine.RdfResource<D> {
}

export function ArriveMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Arrive & RdfResourceCore> & Base {
  @rdfine.namespace(as)
  class ArriveClass extends IntransitiveActivityMixin(Resource) {
  }
  return ArriveClass as any
}
ArriveMixin.appliesTo = as.Arrive
ArriveMixin.createFactory = (env: RdfineEnvironment) => createFactory<Arrive>([IntransitiveActivityMixin, ArriveMixin], { types: [as.Arrive] }, env)
