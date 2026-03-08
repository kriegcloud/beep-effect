import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { AutomotiveBusinessMixin } from './AutomotiveBusiness.js';

export interface MotorcycleRepair<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.AutomotiveBusiness<D>, rdfine.RdfResource<D> {
}

export function MotorcycleRepairMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MotorcycleRepair & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MotorcycleRepairClass extends AutomotiveBusinessMixin(Resource) {
  }
  return MotorcycleRepairClass as any
}
MotorcycleRepairMixin.appliesTo = schema.MotorcycleRepair
MotorcycleRepairMixin.createFactory = (env: RdfineEnvironment) => createFactory<MotorcycleRepair>([AutomotiveBusinessMixin, MotorcycleRepairMixin], { types: [schema.MotorcycleRepair] }, env)
