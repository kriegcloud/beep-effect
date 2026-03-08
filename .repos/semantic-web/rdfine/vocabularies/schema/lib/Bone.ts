import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { AnatomicalStructureMixin } from './AnatomicalStructure.js';

export interface Bone<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.AnatomicalStructure<D>, rdfine.RdfResource<D> {
}

export function BoneMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Bone & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class BoneClass extends AnatomicalStructureMixin(Resource) {
  }
  return BoneClass as any
}
BoneMixin.appliesTo = schema.Bone
BoneMixin.createFactory = (env: RdfineEnvironment) => createFactory<Bone>([AnatomicalStructureMixin, BoneMixin], { types: [schema.Bone] }, env)
