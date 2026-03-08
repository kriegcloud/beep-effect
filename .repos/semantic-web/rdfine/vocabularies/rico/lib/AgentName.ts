import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { NameMixin } from './Name.js';

export interface AgentName<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.Name<D>, rdfine.RdfResource<D> {
  isOrWasAgentNameOf: Rico.Agent<D> | undefined;
}

export function AgentNameMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<AgentName & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class AgentNameClass extends NameMixin(Resource) {
    @rdfine.property.resource({ implicitTypes: [rico.Agent] })
    isOrWasAgentNameOf: Rico.Agent | undefined;
  }
  return AgentNameClass as any
}
AgentNameMixin.appliesTo = rico.AgentName
AgentNameMixin.createFactory = (env: RdfineEnvironment) => createFactory<AgentName>([NameMixin, AgentNameMixin], { types: [rico.AgentName] }, env)
