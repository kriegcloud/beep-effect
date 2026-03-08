import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { ThingMixin } from './Thing.js';

export interface Instantiation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.Thing<D>, rdfine.RdfResource<D> {
  authenticityNote: RDF.Literal | undefined;
  carrierExtent: RDF.Literal | undefined;
  conditionsOfAccess: RDF.Literal | undefined;
  conditionsOfUse: RDF.Literal | undefined;
  documents: Rico.Activity<D> | undefined;
  hadComponent: Rico.Instantiation<D> | undefined;
  hasAccumulator: Rico.Agent<D> | undefined;
  hasAddressee: Rico.Agent<D> | undefined;
  hasCarrierType: Rico.CarrierType<D> | undefined;
  hasCollector: Rico.Agent<D> | undefined;
  hasComponentTransitive: Rico.Instantiation<D> | undefined;
  hasCreationDate: Rico.Date<D> | undefined;
  hasCreator: Rico.Agent<D> | undefined;
  hasDirectComponent: Rico.Instantiation<D> | undefined;
  hasOrganicOrFunctionalProvenance: Rico.Activity<D> | Rico.Agent<D> | undefined;
  hasOrganicProvenance: Rico.Agent<D> | undefined;
  hasOrHadComponent: Rico.Instantiation<D> | undefined;
  hasOrHadDerivedInstantiation: Rico.Instantiation<D> | undefined;
  hasOrHadHolder: Rico.Agent<D> | undefined;
  hasOrHadIntellectualPropertyRightsHolder: Rico.Group<D> | Rico.Person<D> | Rico.Position<D> | undefined;
  hasOrHadManager: Rico.Agent<D> | undefined;
  hasOrHadTitle: Rico.Title<D> | undefined;
  hasProductionTechniqueType: Rico.ProductionTechniqueType<D> | undefined;
  hasReceiver: Rico.Agent<D> | undefined;
  hasRepresentationType: Rico.RepresentationType<D> | undefined;
  hasSender: Rico.Agent<D> | undefined;
  history: RDF.Literal | undefined;
  instantiationExtent: RDF.Literal | undefined;
  instantiationStructure: RDF.Literal | undefined;
  isComponentOfTransitive: Rico.Instantiation<D> | undefined;
  isDirectComponentOf: Rico.Instantiation<D> | undefined;
  isFunctionallyEquivalentTo: Rico.Instantiation<D> | undefined;
  isInstantiationAssociatedWithInstantiation: Rico.Instantiation<D> | undefined;
  isOrWasAnalogueInstantiationOf: Rico.RecordResource<D> | undefined;
  isOrWasComponentOf: Rico.Instantiation<D> | undefined;
  isOrWasDerivedFromInstantiation: Rico.Instantiation<D> | undefined;
  isOrWasDigitalInstantiationOf: Rico.RecordResource<D> | undefined;
  isOrWasInstantiationOf: Rico.RecordResource<D> | undefined;
  migratedFrom: Rico.Instantiation<D> | undefined;
  migratedInto: Rico.Instantiation<D> | undefined;
  physicalCharacteristicsNote: RDF.Literal | undefined;
  physicalOrLogicalExtent: RDF.Literal | undefined;
  productionTechnique: RDF.Literal | undefined;
  qualityOfRepresentationNote: RDF.Literal | undefined;
  structure: RDF.Literal | undefined;
  title: RDF.Literal | undefined;
  wasComponentOf: Rico.Instantiation<D> | undefined;
}

export function InstantiationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Instantiation & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class InstantiationClass extends ThingMixin(Resource) {
    @rdfine.property()
    authenticityNote: RDF.Literal | undefined;
    @rdfine.property()
    carrierExtent: RDF.Literal | undefined;
    @rdfine.property()
    conditionsOfAccess: RDF.Literal | undefined;
    @rdfine.property()
    conditionsOfUse: RDF.Literal | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Activity] })
    documents: Rico.Activity | undefined;
    @rdfine.property.resource({ as: [InstantiationMixin] })
    hadComponent: Rico.Instantiation | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Agent] })
    hasAccumulator: Rico.Agent | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Agent] })
    hasAddressee: Rico.Agent | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.CarrierType] })
    hasCarrierType: Rico.CarrierType | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Agent] })
    hasCollector: Rico.Agent | undefined;
    @rdfine.property.resource({ as: [InstantiationMixin] })
    hasComponentTransitive: Rico.Instantiation | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Date] })
    hasCreationDate: Rico.Date | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Agent] })
    hasCreator: Rico.Agent | undefined;
    @rdfine.property.resource({ as: [InstantiationMixin] })
    hasDirectComponent: Rico.Instantiation | undefined;
    @rdfine.property.resource()
    hasOrganicOrFunctionalProvenance: Rico.Activity | Rico.Agent | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Agent] })
    hasOrganicProvenance: Rico.Agent | undefined;
    @rdfine.property.resource({ as: [InstantiationMixin] })
    hasOrHadComponent: Rico.Instantiation | undefined;
    @rdfine.property.resource({ as: [InstantiationMixin] })
    hasOrHadDerivedInstantiation: Rico.Instantiation | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Agent] })
    hasOrHadHolder: Rico.Agent | undefined;
    @rdfine.property.resource()
    hasOrHadIntellectualPropertyRightsHolder: Rico.Group | Rico.Person | Rico.Position | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Agent] })
    hasOrHadManager: Rico.Agent | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Title] })
    hasOrHadTitle: Rico.Title | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.ProductionTechniqueType] })
    hasProductionTechniqueType: Rico.ProductionTechniqueType | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Agent] })
    hasReceiver: Rico.Agent | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.RepresentationType] })
    hasRepresentationType: Rico.RepresentationType | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Agent] })
    hasSender: Rico.Agent | undefined;
    @rdfine.property()
    history: RDF.Literal | undefined;
    @rdfine.property()
    instantiationExtent: RDF.Literal | undefined;
    @rdfine.property()
    instantiationStructure: RDF.Literal | undefined;
    @rdfine.property.resource({ as: [InstantiationMixin] })
    isComponentOfTransitive: Rico.Instantiation | undefined;
    @rdfine.property.resource({ as: [InstantiationMixin] })
    isDirectComponentOf: Rico.Instantiation | undefined;
    @rdfine.property.resource({ as: [InstantiationMixin] })
    isFunctionallyEquivalentTo: Rico.Instantiation | undefined;
    @rdfine.property.resource({ as: [InstantiationMixin] })
    isInstantiationAssociatedWithInstantiation: Rico.Instantiation | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.RecordResource] })
    isOrWasAnalogueInstantiationOf: Rico.RecordResource | undefined;
    @rdfine.property.resource({ as: [InstantiationMixin] })
    isOrWasComponentOf: Rico.Instantiation | undefined;
    @rdfine.property.resource({ as: [InstantiationMixin] })
    isOrWasDerivedFromInstantiation: Rico.Instantiation | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.RecordResource] })
    isOrWasDigitalInstantiationOf: Rico.RecordResource | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.RecordResource] })
    isOrWasInstantiationOf: Rico.RecordResource | undefined;
    @rdfine.property.resource({ as: [InstantiationMixin] })
    migratedFrom: Rico.Instantiation | undefined;
    @rdfine.property.resource({ as: [InstantiationMixin] })
    migratedInto: Rico.Instantiation | undefined;
    @rdfine.property()
    physicalCharacteristicsNote: RDF.Literal | undefined;
    @rdfine.property()
    physicalOrLogicalExtent: RDF.Literal | undefined;
    @rdfine.property()
    productionTechnique: RDF.Literal | undefined;
    @rdfine.property()
    qualityOfRepresentationNote: RDF.Literal | undefined;
    @rdfine.property()
    structure: RDF.Literal | undefined;
    @rdfine.property()
    title: RDF.Literal | undefined;
    @rdfine.property.resource({ as: [InstantiationMixin] })
    wasComponentOf: Rico.Instantiation | undefined;
  }
  return InstantiationClass as any
}
InstantiationMixin.appliesTo = rico.Instantiation
InstantiationMixin.createFactory = (env: RdfineEnvironment) => createFactory<Instantiation>([ThingMixin, InstantiationMixin], { types: [rico.Instantiation] }, env)
