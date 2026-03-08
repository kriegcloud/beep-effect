import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ThingMixin } from './Thing.js';

export interface BioChemEntity<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Thing<D>, rdfine.RdfResource<D> {
  associatedDisease: Schema.MedicalCondition<D> | Schema.PropertyValue<D> | undefined;
  bioChemInteraction: Schema.BioChemEntity<D> | undefined;
  bioChemSimilarity: Schema.BioChemEntity<D> | undefined;
  biologicalRole: RDF.Term | undefined;
  funding: Schema.Grant<D> | undefined;
  hasBioChemEntityPart: Schema.BioChemEntity<D> | undefined;
  hasMolecularFunction: Schema.PropertyValue<D> | undefined;
  hasRepresentation: Schema.PropertyValue<D> | undefined;
  hasRepresentationLiteral: string | undefined;
  isEncodedByBioChemEntity: Schema.Gene<D> | undefined;
  isInvolvedInBiologicalProcess: Schema.PropertyValue<D> | undefined;
  isLocatedInSubcellularLocation: Schema.PropertyValue<D> | undefined;
  isPartOfBioChemEntity: Schema.BioChemEntity<D> | undefined;
  taxonomicRange: Schema.Taxon<D> | undefined;
  taxonomicRangeLiteral: string | undefined;
}

export function BioChemEntityMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<BioChemEntity & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class BioChemEntityClass extends ThingMixin(Resource) {
    @rdfine.property.resource()
    associatedDisease: Schema.MedicalCondition | Schema.PropertyValue | undefined;
    @rdfine.property.resource()
    bioChemInteraction: Schema.BioChemEntity | undefined;
    @rdfine.property.resource()
    bioChemSimilarity: Schema.BioChemEntity | undefined;
    @rdfine.property()
    biologicalRole: RDF.Term | undefined;
    @rdfine.property.resource()
    funding: Schema.Grant | undefined;
    @rdfine.property.resource()
    hasBioChemEntityPart: Schema.BioChemEntity | undefined;
    @rdfine.property.resource()
    hasMolecularFunction: Schema.PropertyValue | undefined;
    @rdfine.property.resource()
    hasRepresentation: Schema.PropertyValue | undefined;
    @rdfine.property.literal({ path: schema.hasRepresentation })
    hasRepresentationLiteral: string | undefined;
    @rdfine.property.resource()
    isEncodedByBioChemEntity: Schema.Gene | undefined;
    @rdfine.property.resource()
    isInvolvedInBiologicalProcess: Schema.PropertyValue | undefined;
    @rdfine.property.resource()
    isLocatedInSubcellularLocation: Schema.PropertyValue | undefined;
    @rdfine.property.resource()
    isPartOfBioChemEntity: Schema.BioChemEntity | undefined;
    @rdfine.property.resource()
    taxonomicRange: Schema.Taxon | undefined;
    @rdfine.property.literal({ path: schema.taxonomicRange })
    taxonomicRangeLiteral: string | undefined;
  }
  return BioChemEntityClass as any
}
BioChemEntityMixin.appliesTo = schema.BioChemEntity
BioChemEntityMixin.createFactory = (env: RdfineEnvironment) => createFactory<BioChemEntity>([ThingMixin, BioChemEntityMixin], { types: [schema.BioChemEntity] }, env)
