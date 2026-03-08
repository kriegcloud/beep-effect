import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CivicStructureMixin } from './CivicStructure.js';

export interface BoatTerminal<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CivicStructure<D>, rdfine.RdfResource<D> {
}

export function BoatTerminalMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<BoatTerminal & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class BoatTerminalClass extends CivicStructureMixin(Resource) {
  }
  return BoatTerminalClass as any
}
BoatTerminalMixin.appliesTo = schema.BoatTerminal
BoatTerminalMixin.createFactory = (env: RdfineEnvironment) => createFactory<BoatTerminal>([CivicStructureMixin, BoatTerminalMixin], { types: [schema.BoatTerminal] }, env)
