import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CivicStructureMixin } from './CivicStructure.js';

export interface Cemetery<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CivicStructure<D>, rdfine.RdfResource<D> {
}

export function CemeteryMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Cemetery & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class CemeteryClass extends CivicStructureMixin(Resource) {
  }
  return CemeteryClass as any
}
CemeteryMixin.appliesTo = schema.Cemetery
CemeteryMixin.createFactory = (env: RdfineEnvironment) => createFactory<Cemetery>([CivicStructureMixin, CemeteryMixin], { types: [schema.Cemetery] }, env)
