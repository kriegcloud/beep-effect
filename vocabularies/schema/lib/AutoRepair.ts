import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { AutomotiveBusinessMixin } from './AutomotiveBusiness.js';

export interface AutoRepair<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.AutomotiveBusiness<D>, rdfine.RdfResource<D> {
}

export function AutoRepairMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<AutoRepair & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class AutoRepairClass extends AutomotiveBusinessMixin(Resource) {
  }
  return AutoRepairClass as any
}
AutoRepairMixin.appliesTo = schema.AutoRepair
AutoRepairMixin.createFactory = (env: RdfineEnvironment) => createFactory<AutoRepair>([AutomotiveBusinessMixin, AutoRepairMixin], { types: [schema.AutoRepair] }, env)
