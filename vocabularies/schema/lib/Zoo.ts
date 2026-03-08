import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CivicStructureMixin } from './CivicStructure.js';

export interface Zoo<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CivicStructure<D>, rdfine.RdfResource<D> {
}

export function ZooMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Zoo & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ZooClass extends CivicStructureMixin(Resource) {
  }
  return ZooClass as any
}
ZooMixin.appliesTo = schema.Zoo
ZooMixin.createFactory = (env: RdfineEnvironment) => createFactory<Zoo>([CivicStructureMixin, ZooMixin], { types: [schema.Zoo] }, env)
