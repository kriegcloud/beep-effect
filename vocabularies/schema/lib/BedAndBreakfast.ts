import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { LodgingBusinessMixin } from './LodgingBusiness.js';

export interface BedAndBreakfast<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.LodgingBusiness<D>, rdfine.RdfResource<D> {
}

export function BedAndBreakfastMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<BedAndBreakfast & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class BedAndBreakfastClass extends LodgingBusinessMixin(Resource) {
  }
  return BedAndBreakfastClass as any
}
BedAndBreakfastMixin.appliesTo = schema.BedAndBreakfast
BedAndBreakfastMixin.createFactory = (env: RdfineEnvironment) => createFactory<BedAndBreakfast>([LodgingBusinessMixin, BedAndBreakfastMixin], { types: [schema.BedAndBreakfast] }, env)
