import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { IntangibleMixin } from './Intangible.js';

export interface EnergyConsumptionDetails<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Intangible<D>, rdfine.RdfResource<D> {
  energyEfficiencyScaleMax: Schema.EUEnergyEfficiencyEnumeration | undefined;
  energyEfficiencyScaleMin: Schema.EUEnergyEfficiencyEnumeration | undefined;
  hasEnergyEfficiencyCategory: Schema.EnergyEfficiencyEnumeration | undefined;
}

export function EnergyConsumptionDetailsMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<EnergyConsumptionDetails & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class EnergyConsumptionDetailsClass extends IntangibleMixin(Resource) {
    @rdfine.property()
    energyEfficiencyScaleMax: Schema.EUEnergyEfficiencyEnumeration | undefined;
    @rdfine.property()
    energyEfficiencyScaleMin: Schema.EUEnergyEfficiencyEnumeration | undefined;
    @rdfine.property()
    hasEnergyEfficiencyCategory: Schema.EnergyEfficiencyEnumeration | undefined;
  }
  return EnergyConsumptionDetailsClass as any
}
EnergyConsumptionDetailsMixin.appliesTo = schema.EnergyConsumptionDetails
EnergyConsumptionDetailsMixin.createFactory = (env: RdfineEnvironment) => createFactory<EnergyConsumptionDetails>([IntangibleMixin, EnergyConsumptionDetailsMixin], { types: [schema.EnergyConsumptionDetails] }, env)
