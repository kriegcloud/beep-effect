import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { ThingMixin } from './Thing.js';

export interface Agent<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.Thing<D>, rdfine.RdfResource<D> {
  agentHasOrHadLocation: Rico.Place<D> | undefined;
  authorizedBy: Rico.Mandate<D> | undefined;
  authorizingMandate: RDF.Literal | undefined;
  hadSubordinate: Rico.Agent<D> | undefined;
  hasDirectSubordinate: Rico.Agent<D> | undefined;
  hasOrHadAgentName: Rico.AgentName<D> | undefined;
  hasOrHadAuthorityOver: Rico.Thing<D> | undefined;
  hasOrHadController: Rico.Agent<D> | undefined;
  hasOrHadJurisdiction: Rico.Place<D> | undefined;
  hasOrHadLanguage: Rico.Language<D> | undefined;
  hasOrHadLegalStatus: Rico.LegalStatus<D> | undefined;
  hasOrHadSubordinate: Rico.Agent<D> | undefined;
  hasOrHadWorkRelationWith: Rico.Agent<D> | undefined;
  hasSubordinateTransitive: Rico.Agent<D> | undefined;
  hasSuccessor: Rico.Agent<D> | undefined;
  history: RDF.Literal | undefined;
  isAccumulatorOf: Rico.Instantiation<D> | Rico.RecordResource<D> | undefined;
  isAddresseeOf: Rico.Instantiation<D> | Rico.RecordResource<D> | undefined;
  isAgentAssociatedWithAgent: Rico.Agent<D> | undefined;
  isAgentAssociatedWithPlace: Rico.Place<D> | undefined;
  isAuthorizingAgentInMandateRelation: Rico.MandateRelation<D> | undefined;
  isCollectorOf: Rico.Instantiation<D> | Rico.RecordResource<D> | undefined;
  isCreatorOf: Rico.Instantiation<D> | Rico.RecordResource<D> | undefined;
  isDirectSubordinateTo: Rico.Agent<D> | undefined;
  isOrganicOrFunctionalProvenanceOf: Rico.Instantiation<D> | Rico.RecordResource<D> | undefined;
  isOrganicProvenanceOf: Rico.Instantiation<D> | Rico.RecordResource<D> | undefined;
  isOrWasControllerOf: Rico.Agent<D> | undefined;
  isOrWasHolderOf: Rico.Instantiation<D> | Rico.RecordResource<D> | undefined;
  isOrWasManagerOf: Rico.Instantiation<D> | Rico.RecordResource<D> | undefined;
  isOrWasResponsibleForEnforcing: Rico.Rule<D> | undefined;
  isOrWasSubordinateTo: Rico.Agent<D> | undefined;
  isPublisherOf: Rico.RecordResource<D> | undefined;
  isReceiverOf: Rico.Instantiation<D> | Rico.RecordResource<D> | undefined;
  isResponsibleForIssuing: Rico.Rule<D> | undefined;
  isSenderOf: Rico.Instantiation<D> | Rico.RecordResource<D> | undefined;
  isSubordinateToTransitive: Rico.Agent<D> | undefined;
  isSuccessorOf: Rico.Agent<D> | undefined;
  performsOrPerformed: Rico.Activity<D> | undefined;
  wasSubordinateTo: Rico.Agent<D> | undefined;
}

export function AgentMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Agent & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class AgentClass extends ThingMixin(Resource) {
    @rdfine.property.resource({ implicitTypes: [rico.Place] })
    agentHasOrHadLocation: Rico.Place | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Mandate] })
    authorizedBy: Rico.Mandate | undefined;
    @rdfine.property()
    authorizingMandate: RDF.Literal | undefined;
    @rdfine.property.resource({ as: [AgentMixin] })
    hadSubordinate: Rico.Agent | undefined;
    @rdfine.property.resource({ as: [AgentMixin] })
    hasDirectSubordinate: Rico.Agent | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.AgentName] })
    hasOrHadAgentName: Rico.AgentName | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Thing] })
    hasOrHadAuthorityOver: Rico.Thing | undefined;
    @rdfine.property.resource({ as: [AgentMixin] })
    hasOrHadController: Rico.Agent | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Place] })
    hasOrHadJurisdiction: Rico.Place | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Language] })
    hasOrHadLanguage: Rico.Language | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.LegalStatus] })
    hasOrHadLegalStatus: Rico.LegalStatus | undefined;
    @rdfine.property.resource({ as: [AgentMixin] })
    hasOrHadSubordinate: Rico.Agent | undefined;
    @rdfine.property.resource({ as: [AgentMixin] })
    hasOrHadWorkRelationWith: Rico.Agent | undefined;
    @rdfine.property.resource({ as: [AgentMixin] })
    hasSubordinateTransitive: Rico.Agent | undefined;
    @rdfine.property.resource({ as: [AgentMixin] })
    hasSuccessor: Rico.Agent | undefined;
    @rdfine.property()
    history: RDF.Literal | undefined;
    @rdfine.property.resource()
    isAccumulatorOf: Rico.Instantiation | Rico.RecordResource | undefined;
    @rdfine.property.resource()
    isAddresseeOf: Rico.Instantiation | Rico.RecordResource | undefined;
    @rdfine.property.resource({ as: [AgentMixin] })
    isAgentAssociatedWithAgent: Rico.Agent | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Place] })
    isAgentAssociatedWithPlace: Rico.Place | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.MandateRelation] })
    isAuthorizingAgentInMandateRelation: Rico.MandateRelation | undefined;
    @rdfine.property.resource()
    isCollectorOf: Rico.Instantiation | Rico.RecordResource | undefined;
    @rdfine.property.resource()
    isCreatorOf: Rico.Instantiation | Rico.RecordResource | undefined;
    @rdfine.property.resource({ as: [AgentMixin] })
    isDirectSubordinateTo: Rico.Agent | undefined;
    @rdfine.property.resource()
    isOrganicOrFunctionalProvenanceOf: Rico.Instantiation | Rico.RecordResource | undefined;
    @rdfine.property.resource()
    isOrganicProvenanceOf: Rico.Instantiation | Rico.RecordResource | undefined;
    @rdfine.property.resource({ as: [AgentMixin] })
    isOrWasControllerOf: Rico.Agent | undefined;
    @rdfine.property.resource()
    isOrWasHolderOf: Rico.Instantiation | Rico.RecordResource | undefined;
    @rdfine.property.resource()
    isOrWasManagerOf: Rico.Instantiation | Rico.RecordResource | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Rule] })
    isOrWasResponsibleForEnforcing: Rico.Rule | undefined;
    @rdfine.property.resource({ as: [AgentMixin] })
    isOrWasSubordinateTo: Rico.Agent | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.RecordResource] })
    isPublisherOf: Rico.RecordResource | undefined;
    @rdfine.property.resource()
    isReceiverOf: Rico.Instantiation | Rico.RecordResource | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Rule] })
    isResponsibleForIssuing: Rico.Rule | undefined;
    @rdfine.property.resource()
    isSenderOf: Rico.Instantiation | Rico.RecordResource | undefined;
    @rdfine.property.resource({ as: [AgentMixin] })
    isSubordinateToTransitive: Rico.Agent | undefined;
    @rdfine.property.resource({ as: [AgentMixin] })
    isSuccessorOf: Rico.Agent | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Activity] })
    performsOrPerformed: Rico.Activity | undefined;
    @rdfine.property.resource({ as: [AgentMixin] })
    wasSubordinateTo: Rico.Agent | undefined;
  }
  return AgentClass as any
}
AgentMixin.appliesTo = rico.Agent
AgentMixin.createFactory = (env: RdfineEnvironment) => createFactory<Agent>([ThingMixin, AgentMixin], { types: [rico.Agent] }, env)
