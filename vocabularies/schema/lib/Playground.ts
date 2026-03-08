import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CivicStructureMixin } from './CivicStructure.js';

export interface Playground<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CivicStructure<D>, rdfine.RdfResource<D> {
}

export function PlaygroundMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Playground & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class PlaygroundClass extends CivicStructureMixin(Resource) {
  }
  return PlaygroundClass as any
}
PlaygroundMixin.appliesTo = schema.Playground
PlaygroundMixin.createFactory = (env: RdfineEnvironment) => createFactory<Playground>([CivicStructureMixin, PlaygroundMixin], { types: [schema.Playground] }, env)
