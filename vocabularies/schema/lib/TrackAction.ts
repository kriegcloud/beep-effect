import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { FindActionMixin } from './FindAction.js';

export interface TrackAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.FindAction<D>, rdfine.RdfResource<D> {
  deliveryMethod: Schema.DeliveryMethod | undefined;
}

export function TrackActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<TrackAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class TrackActionClass extends FindActionMixin(Resource) {
    @rdfine.property()
    deliveryMethod: Schema.DeliveryMethod | undefined;
  }
  return TrackActionClass as any
}
TrackActionMixin.appliesTo = schema.TrackAction
TrackActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<TrackAction>([FindActionMixin, TrackActionMixin], { types: [schema.TrackAction] }, env)
