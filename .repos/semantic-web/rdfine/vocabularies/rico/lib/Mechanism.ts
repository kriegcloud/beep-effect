import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { AgentMixin } from './Agent.js';

export interface Mechanism<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.Agent<D>, rdfine.RdfResource<D> {
  technicalCharacteristics: RDF.Literal | undefined;
}

export function MechanismMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Mechanism & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class MechanismClass extends AgentMixin(Resource) {
    @rdfine.property()
    technicalCharacteristics: RDF.Literal | undefined;
  }
  return MechanismClass as any
}
MechanismMixin.appliesTo = rico.Mechanism
MechanismMixin.createFactory = (env: RdfineEnvironment) => createFactory<Mechanism>([AgentMixin, MechanismMixin], { types: [rico.Mechanism] }, env)
