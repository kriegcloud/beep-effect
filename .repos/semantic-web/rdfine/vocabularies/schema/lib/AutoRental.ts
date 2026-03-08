import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { AutomotiveBusinessMixin } from './AutomotiveBusiness.js';

export interface AutoRental<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.AutomotiveBusiness<D>, rdfine.RdfResource<D> {
}

export function AutoRentalMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<AutoRental & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class AutoRentalClass extends AutomotiveBusinessMixin(Resource) {
  }
  return AutoRentalClass as any
}
AutoRentalMixin.appliesTo = schema.AutoRental
AutoRentalMixin.createFactory = (env: RdfineEnvironment) => createFactory<AutoRental>([AutomotiveBusinessMixin, AutoRentalMixin], { types: [schema.AutoRental] }, env)
