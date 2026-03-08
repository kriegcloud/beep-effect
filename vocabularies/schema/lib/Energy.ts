import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { QuantityMixin } from './Quantity.js';

export interface Energy<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Quantity<D>, rdfine.RdfResource<D> {
}

export function EnergyMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Energy & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class EnergyClass extends QuantityMixin(Resource) {
  }
  return EnergyClass as any
}
EnergyMixin.appliesTo = schema.Energy
EnergyMixin.createFactory = (env: RdfineEnvironment) => createFactory<Energy>([QuantityMixin, EnergyMixin], { types: [schema.Energy] }, env)
