import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { ThingMixin } from './Thing.js';

export interface RecordResource<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.Thing<D>, rdfine.RdfResource<D> {
  authenticityNote: RDF.Literal | undefined;
  classification: RDF.Literal | undefined;
  conditionsOfAccess: RDF.Literal | undefined;
  conditionsOfUse: RDF.Literal | undefined;
  describesOrDescribed: Rico.Thing<D> | undefined;
  documents: Rico.Activity<D> | undefined;
  evidences: Rico.Relation<D> | undefined;
  expressesOrExpressed: Rico.Rule<D> | undefined;
  hasAccumulator: Rico.Agent<D> | undefined;
  hasAddressee: Rico.Agent<D> | undefined;
  hasCollector: Rico.Agent<D> | undefined;
  hasCopy: Rico.RecordResource<D> | undefined;
  hasCreationDate: Rico.Date<D> | undefined;
  hasCreator: Rico.Agent<D> | undefined;
  hasGeneticLinkToRecordResource: Rico.RecordResource<D> | undefined;
  hasOrganicOrFunctionalProvenance: Rico.Activity<D> | Rico.Agent<D> | undefined;
  hasOrganicProvenance: Rico.Agent<D> | undefined;
  hasOrHadAnalogueInstantiation: Rico.Instantiation<D> | undefined;
  hasOrHadDigitalInstantiation: Rico.Instantiation<D> | undefined;
  hasOrHadHolder: Rico.Agent<D> | undefined;
  hasOrHadInstantiation: Rico.Instantiation<D> | undefined;
  hasOrHadIntellectualPropertyRightsHolder: Rico.Group<D> | Rico.Person<D> | Rico.Position<D> | undefined;
  hasOrHadMainSubject: Rico.Thing<D> | undefined;
  hasOrHadManager: Rico.Agent<D> | undefined;
  hasOrHadSubject: Rico.Thing<D> | undefined;
  hasOrHadTitle: Rico.Title<D> | undefined;
  hasPublicationDate: Rico.Date<D> | undefined;
  hasPublisher: Rico.Agent<D> | undefined;
  hasReceiver: Rico.Agent<D> | undefined;
  hasReply: Rico.RecordResource<D> | undefined;
  hasSender: Rico.Agent<D> | undefined;
  history: RDF.Literal | undefined;
  integrityNote: RDF.Literal | undefined;
  isCopyOf: Rico.RecordResource<D> | undefined;
  isRecordResourceAssociatedWithRecordResource: Rico.RecordResource<D> | undefined;
  isReplyTo: Rico.RecordResource<D> | undefined;
  physicalOrLogicalExtent: RDF.Literal | undefined;
  publicationDate: RDF.Literal | undefined;
  recordResourceExtent: RDF.Literal | undefined;
  recordResourceStructure: RDF.Literal | undefined;
  scopeAndContent: RDF.Literal | undefined;
  structure: RDF.Literal | undefined;
  title: RDF.Literal | undefined;
}

export function RecordResourceMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<RecordResource & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class RecordResourceClass extends ThingMixin(Resource) {
    @rdfine.property()
    authenticityNote: RDF.Literal | undefined;
    @rdfine.property()
    classification: RDF.Literal | undefined;
    @rdfine.property()
    conditionsOfAccess: RDF.Literal | undefined;
    @rdfine.property()
    conditionsOfUse: RDF.Literal | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Thing] })
    describesOrDescribed: Rico.Thing | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Activity] })
    documents: Rico.Activity | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Relation] })
    evidences: Rico.Relation | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Rule] })
    expressesOrExpressed: Rico.Rule | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Agent] })
    hasAccumulator: Rico.Agent | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Agent] })
    hasAddressee: Rico.Agent | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Agent] })
    hasCollector: Rico.Agent | undefined;
    @rdfine.property.resource({ as: [RecordResourceMixin] })
    hasCopy: Rico.RecordResource | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Date] })
    hasCreationDate: Rico.Date | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Agent] })
    hasCreator: Rico.Agent | undefined;
    @rdfine.property.resource({ as: [RecordResourceMixin] })
    hasGeneticLinkToRecordResource: Rico.RecordResource | undefined;
    @rdfine.property.resource()
    hasOrganicOrFunctionalProvenance: Rico.Activity | Rico.Agent | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Agent] })
    hasOrganicProvenance: Rico.Agent | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Instantiation] })
    hasOrHadAnalogueInstantiation: Rico.Instantiation | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Instantiation] })
    hasOrHadDigitalInstantiation: Rico.Instantiation | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Agent] })
    hasOrHadHolder: Rico.Agent | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Instantiation] })
    hasOrHadInstantiation: Rico.Instantiation | undefined;
    @rdfine.property.resource()
    hasOrHadIntellectualPropertyRightsHolder: Rico.Group | Rico.Person | Rico.Position | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Thing] })
    hasOrHadMainSubject: Rico.Thing | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Agent] })
    hasOrHadManager: Rico.Agent | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Thing] })
    hasOrHadSubject: Rico.Thing | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Title] })
    hasOrHadTitle: Rico.Title | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Date] })
    hasPublicationDate: Rico.Date | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Agent] })
    hasPublisher: Rico.Agent | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Agent] })
    hasReceiver: Rico.Agent | undefined;
    @rdfine.property.resource({ as: [RecordResourceMixin] })
    hasReply: Rico.RecordResource | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Agent] })
    hasSender: Rico.Agent | undefined;
    @rdfine.property()
    history: RDF.Literal | undefined;
    @rdfine.property()
    integrityNote: RDF.Literal | undefined;
    @rdfine.property.resource({ as: [RecordResourceMixin] })
    isCopyOf: Rico.RecordResource | undefined;
    @rdfine.property.resource({ as: [RecordResourceMixin] })
    isRecordResourceAssociatedWithRecordResource: Rico.RecordResource | undefined;
    @rdfine.property.resource({ as: [RecordResourceMixin] })
    isReplyTo: Rico.RecordResource | undefined;
    @rdfine.property()
    physicalOrLogicalExtent: RDF.Literal | undefined;
    @rdfine.property()
    publicationDate: RDF.Literal | undefined;
    @rdfine.property()
    recordResourceExtent: RDF.Literal | undefined;
    @rdfine.property()
    recordResourceStructure: RDF.Literal | undefined;
    @rdfine.property()
    scopeAndContent: RDF.Literal | undefined;
    @rdfine.property()
    structure: RDF.Literal | undefined;
    @rdfine.property()
    title: RDF.Literal | undefined;
  }
  return RecordResourceClass as any
}
RecordResourceMixin.appliesTo = rico.RecordResource
RecordResourceMixin.createFactory = (env: RdfineEnvironment) => createFactory<RecordResource>([ThingMixin, RecordResourceMixin], { types: [rico.RecordResource] }, env)
