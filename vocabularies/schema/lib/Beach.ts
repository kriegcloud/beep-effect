import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CivicStructureMixin } from './CivicStructure.js';

export interface Beach<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CivicStructure<D>, rdfine.RdfResource<D> {
}

export function BeachMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Beach & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class BeachClass extends CivicStructureMixin(Resource) {
  }
  return BeachClass as any
}
BeachMixin.appliesTo = schema.Beach
BeachMixin.createFactory = (env: RdfineEnvironment) => createFactory<Beach>([CivicStructureMixin, BeachMixin], { types: [schema.Beach] }, env)
