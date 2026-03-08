import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { BioChemEntityMixin } from './BioChemEntity.js';

export interface MolecularEntity<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.BioChemEntity<D>, rdfine.RdfResource<D> {
  chemicalRole: RDF.Term | undefined;
  inChI: string | undefined;
  inChIKey: string | undefined;
  iupacName: string | undefined;
  molecularFormula: string | undefined;
  molecularWeight: Schema.QuantitativeValue<D> | undefined;
  molecularWeightLiteral: string | undefined;
  monoisotopicMolecularWeight: Schema.QuantitativeValue<D> | undefined;
  monoisotopicMolecularWeightLiteral: string | undefined;
  potentialUse: RDF.Term | undefined;
  smiles: string | undefined;
}

export function MolecularEntityMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MolecularEntity & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MolecularEntityClass extends BioChemEntityMixin(Resource) {
    @rdfine.property()
    chemicalRole: RDF.Term | undefined;
    @rdfine.property.literal()
    inChI: string | undefined;
    @rdfine.property.literal()
    inChIKey: string | undefined;
    @rdfine.property.literal()
    iupacName: string | undefined;
    @rdfine.property.literal()
    molecularFormula: string | undefined;
    @rdfine.property.resource()
    molecularWeight: Schema.QuantitativeValue | undefined;
    @rdfine.property.literal({ path: schema.molecularWeight })
    molecularWeightLiteral: string | undefined;
    @rdfine.property.resource()
    monoisotopicMolecularWeight: Schema.QuantitativeValue | undefined;
    @rdfine.property.literal({ path: schema.monoisotopicMolecularWeight })
    monoisotopicMolecularWeightLiteral: string | undefined;
    @rdfine.property()
    potentialUse: RDF.Term | undefined;
    @rdfine.property.literal()
    smiles: string | undefined;
  }
  return MolecularEntityClass as any
}
MolecularEntityMixin.appliesTo = schema.MolecularEntity
MolecularEntityMixin.createFactory = (env: RdfineEnvironment) => createFactory<MolecularEntity>([BioChemEntityMixin, MolecularEntityMixin], { types: [schema.MolecularEntity] }, env)
