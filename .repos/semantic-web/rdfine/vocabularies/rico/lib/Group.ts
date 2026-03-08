import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { AgentMixin } from './Agent.js';

export interface Group<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.Agent<D>, rdfine.RdfResource<D> {
  hadSubdivision: Rico.Group<D> | undefined;
  hasDirectSubdivision: Rico.Group<D> | undefined;
  hasOrHadDemographicGroup: Rico.DemographicGroup<D> | undefined;
  hasOrHadLeader: Rico.Person<D> | undefined;
  hasOrHadMember: Rico.Person<D> | undefined;
  hasOrHadPosition: Rico.Position<D> | undefined;
  hasOrHadSubdivision: Rico.Group<D> | undefined;
  hasSubdivisionTransitive: Rico.Group<D> | undefined;
  isAuthorOf: Rico.Record<D> | undefined;
  isDirectSubdivisionOf: Rico.Group<D> | undefined;
  isOrWasHolderOfIntellectualPropertyRightsOf: Rico.Instantiation<D> | Rico.RecordResource<D> | undefined;
  isOrWasOwnerOf: Rico.Thing<D> | undefined;
  isOrWasSubdivisionOf: Rico.Group<D> | undefined;
  isSubdivisionOfTransitive: Rico.Group<D> | undefined;
  wasSubdivisionOf: Rico.Group<D> | undefined;
}

export function GroupMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Group & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class GroupClass extends AgentMixin(Resource) {
    @rdfine.property.resource({ as: [GroupMixin] })
    hadSubdivision: Rico.Group | undefined;
    @rdfine.property.resource({ as: [GroupMixin] })
    hasDirectSubdivision: Rico.Group | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.DemographicGroup] })
    hasOrHadDemographicGroup: Rico.DemographicGroup | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Person] })
    hasOrHadLeader: Rico.Person | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Person] })
    hasOrHadMember: Rico.Person | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Position] })
    hasOrHadPosition: Rico.Position | undefined;
    @rdfine.property.resource({ as: [GroupMixin] })
    hasOrHadSubdivision: Rico.Group | undefined;
    @rdfine.property.resource({ as: [GroupMixin] })
    hasSubdivisionTransitive: Rico.Group | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Record] })
    isAuthorOf: Rico.Record | undefined;
    @rdfine.property.resource({ as: [GroupMixin] })
    isDirectSubdivisionOf: Rico.Group | undefined;
    @rdfine.property.resource()
    isOrWasHolderOfIntellectualPropertyRightsOf: Rico.Instantiation | Rico.RecordResource | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Thing] })
    isOrWasOwnerOf: Rico.Thing | undefined;
    @rdfine.property.resource({ as: [GroupMixin] })
    isOrWasSubdivisionOf: Rico.Group | undefined;
    @rdfine.property.resource({ as: [GroupMixin] })
    isSubdivisionOfTransitive: Rico.Group | undefined;
    @rdfine.property.resource({ as: [GroupMixin] })
    wasSubdivisionOf: Rico.Group | undefined;
  }
  return GroupClass as any
}
GroupMixin.appliesTo = rico.Group
GroupMixin.createFactory = (env: RdfineEnvironment) => createFactory<Group>([AgentMixin, GroupMixin], { types: [rico.Group] }, env)
