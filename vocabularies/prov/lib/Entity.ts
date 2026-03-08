import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { prov } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Prov from '../index.js';

export interface Entity<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
  alternateOf: Prov.Entity<D> | undefined;
  asInBundle: Prov.Bundle<D> | undefined;
  atLocation: Prov.Location<D> | undefined;
  generatedAtTime: Date | undefined;
  hadPrimarySource: Prov.Entity<D> | undefined;
  invalidatedAtTime: Date | undefined;
  mentionOf: Prov.Entity<D> | undefined;
  qualifiedAttribution: Prov.Attribution<D> | undefined;
  qualifiedDerivation: Prov.Derivation<D> | undefined;
  qualifiedGeneration: Prov.Generation<D> | undefined;
  qualifiedInfluence: Prov.Influence<D> | undefined;
  qualifiedInvalidation: Prov.Invalidation<D> | undefined;
  qualifiedPrimarySource: Prov.PrimarySource<D> | undefined;
  qualifiedQuotation: Prov.Quotation<D> | undefined;
  qualifiedRevision: Prov.Revision<D> | undefined;
  specializationOf: Prov.Entity<D> | undefined;
  value: RDF.Term | undefined;
  wasAttributedTo: Prov.Agent<D> | undefined;
  wasDerivedFrom: Prov.Entity<D> | undefined;
  wasGeneratedBy: Prov.Activity<D> | undefined;
  wasInfluencedBy: Prov.Activity<D> | Prov.Agent<D> | Prov.Entity<D> | undefined;
  wasInvalidatedBy: Prov.Activity<D> | undefined;
  wasQuotedFrom: Prov.Entity<D> | undefined;
  wasRevisionOf: Prov.Entity<D> | undefined;
}

export function EntityMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Entity & RdfResourceCore> & Base {
  @rdfine.namespace(prov)
  class EntityClass extends Resource {
    @rdfine.property.resource({ as: [EntityMixin] })
    alternateOf: Prov.Entity | undefined;
    @rdfine.property.resource({ implicitTypes: [prov.Bundle] })
    asInBundle: Prov.Bundle | undefined;
    @rdfine.property.resource({ implicitTypes: [prov.Location] })
    atLocation: Prov.Location | undefined;
    @rdfine.property.literal({ type: Date })
    generatedAtTime: Date | undefined;
    @rdfine.property.resource({ as: [EntityMixin] })
    hadPrimarySource: Prov.Entity | undefined;
    @rdfine.property.literal({ type: Date })
    invalidatedAtTime: Date | undefined;
    @rdfine.property.resource({ as: [EntityMixin] })
    mentionOf: Prov.Entity | undefined;
    @rdfine.property.resource({ implicitTypes: [prov.Attribution] })
    qualifiedAttribution: Prov.Attribution | undefined;
    @rdfine.property.resource({ implicitTypes: [prov.Derivation] })
    qualifiedDerivation: Prov.Derivation | undefined;
    @rdfine.property.resource({ implicitTypes: [prov.Generation] })
    qualifiedGeneration: Prov.Generation | undefined;
    @rdfine.property.resource({ implicitTypes: [prov.Influence] })
    qualifiedInfluence: Prov.Influence | undefined;
    @rdfine.property.resource({ implicitTypes: [prov.Invalidation] })
    qualifiedInvalidation: Prov.Invalidation | undefined;
    @rdfine.property.resource({ implicitTypes: [prov.PrimarySource] })
    qualifiedPrimarySource: Prov.PrimarySource | undefined;
    @rdfine.property.resource({ implicitTypes: [prov.Quotation] })
    qualifiedQuotation: Prov.Quotation | undefined;
    @rdfine.property.resource({ implicitTypes: [prov.Revision] })
    qualifiedRevision: Prov.Revision | undefined;
    @rdfine.property.resource({ as: [EntityMixin] })
    specializationOf: Prov.Entity | undefined;
    @rdfine.property()
    value: RDF.Term | undefined;
    @rdfine.property.resource({ implicitTypes: [prov.Agent] })
    wasAttributedTo: Prov.Agent | undefined;
    @rdfine.property.resource({ as: [EntityMixin] })
    wasDerivedFrom: Prov.Entity | undefined;
    @rdfine.property.resource({ implicitTypes: [prov.Activity] })
    wasGeneratedBy: Prov.Activity | undefined;
    @rdfine.property.resource()
    wasInfluencedBy: Prov.Activity | Prov.Agent | Prov.Entity | undefined;
    @rdfine.property.resource({ implicitTypes: [prov.Activity] })
    wasInvalidatedBy: Prov.Activity | undefined;
    @rdfine.property.resource({ as: [EntityMixin] })
    wasQuotedFrom: Prov.Entity | undefined;
    @rdfine.property.resource({ as: [EntityMixin] })
    wasRevisionOf: Prov.Entity | undefined;
  }
  return EntityClass as any
}
EntityMixin.appliesTo = prov.Entity
EntityMixin.createFactory = (env: RdfineEnvironment) => createFactory<Entity>([EntityMixin], { types: [prov.Entity] }, env)
