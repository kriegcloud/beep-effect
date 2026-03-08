import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { foaf } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Foaf from '../index.js';
import { AgentMixin } from './Agent.js';

export interface Group<D extends RDF.DatasetCore = RDF.DatasetCore> extends Foaf.Agent<D>, rdfine.RdfResource<D> {
  member: Foaf.Agent<D> | undefined;
}

export function GroupMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Group & RdfResourceCore> & Base {
  @rdfine.namespace(foaf)
  class GroupClass extends AgentMixin(Resource) {
    @rdfine.property.resource({ implicitTypes: [foaf.Agent] })
    member: Foaf.Agent | undefined;
  }
  return GroupClass as any
}
GroupMixin.appliesTo = foaf.Group
GroupMixin.createFactory = (env: RdfineEnvironment) => createFactory<Group>([AgentMixin, GroupMixin], { types: [foaf.Group] }, env)
