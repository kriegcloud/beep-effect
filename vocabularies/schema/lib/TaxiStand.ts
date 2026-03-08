import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CivicStructureMixin } from './CivicStructure.js';

export interface TaxiStand<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CivicStructure<D>, rdfine.RdfResource<D> {
}

export function TaxiStandMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<TaxiStand & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class TaxiStandClass extends CivicStructureMixin(Resource) {
  }
  return TaxiStandClass as any
}
TaxiStandMixin.appliesTo = schema.TaxiStand
TaxiStandMixin.createFactory = (env: RdfineEnvironment) => createFactory<TaxiStand>([CivicStructureMixin, TaxiStandMixin], { types: [schema.TaxiStand] }, env)
