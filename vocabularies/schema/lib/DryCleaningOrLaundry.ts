import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { LocalBusinessMixin } from './LocalBusiness.js';

export interface DryCleaningOrLaundry<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.LocalBusiness<D>, rdfine.RdfResource<D> {
}

export function DryCleaningOrLaundryMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<DryCleaningOrLaundry & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class DryCleaningOrLaundryClass extends LocalBusinessMixin(Resource) {
  }
  return DryCleaningOrLaundryClass as any
}
DryCleaningOrLaundryMixin.appliesTo = schema.DryCleaningOrLaundry
DryCleaningOrLaundryMixin.createFactory = (env: RdfineEnvironment) => createFactory<DryCleaningOrLaundry>([LocalBusinessMixin, DryCleaningOrLaundryMixin], { types: [schema.DryCleaningOrLaundry] }, env)
