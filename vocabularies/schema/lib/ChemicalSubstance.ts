import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { BioChemEntityMixin } from './BioChemEntity.js';

export interface ChemicalSubstance<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.BioChemEntity<D>, rdfine.RdfResource<D> {
  chemicalComposition: string | undefined;
  chemicalRole: RDF.Term | undefined;
  potentialUse: RDF.Term | undefined;
}

export function ChemicalSubstanceMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ChemicalSubstance & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ChemicalSubstanceClass extends BioChemEntityMixin(Resource) {
    @rdfine.property.literal()
    chemicalComposition: string | undefined;
    @rdfine.property()
    chemicalRole: RDF.Term | undefined;
    @rdfine.property()
    potentialUse: RDF.Term | undefined;
  }
  return ChemicalSubstanceClass as any
}
ChemicalSubstanceMixin.appliesTo = schema.ChemicalSubstance
ChemicalSubstanceMixin.createFactory = (env: RdfineEnvironment) => createFactory<ChemicalSubstance>([BioChemEntityMixin, ChemicalSubstanceMixin], { types: [schema.ChemicalSubstance] }, env)
