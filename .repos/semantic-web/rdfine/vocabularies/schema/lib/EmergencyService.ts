import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { LocalBusinessMixin } from './LocalBusiness.js';

export interface EmergencyService<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.LocalBusiness<D>, rdfine.RdfResource<D> {
}

export function EmergencyServiceMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<EmergencyService & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class EmergencyServiceClass extends LocalBusinessMixin(Resource) {
  }
  return EmergencyServiceClass as any
}
EmergencyServiceMixin.appliesTo = schema.EmergencyService
EmergencyServiceMixin.createFactory = (env: RdfineEnvironment) => createFactory<EmergencyService>([LocalBusinessMixin, EmergencyServiceMixin], { types: [schema.EmergencyService] }, env)
