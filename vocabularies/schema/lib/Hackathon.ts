import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { EventMixin } from './Event.js';

export interface Hackathon<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Event<D>, rdfine.RdfResource<D> {
}

export function HackathonMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Hackathon & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class HackathonClass extends EventMixin(Resource) {
  }
  return HackathonClass as any
}
HackathonMixin.appliesTo = schema.Hackathon
HackathonMixin.createFactory = (env: RdfineEnvironment) => createFactory<Hackathon>([EventMixin, HackathonMixin], { types: [schema.Hackathon] }, env)
