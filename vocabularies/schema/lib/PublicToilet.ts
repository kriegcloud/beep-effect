import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CivicStructureMixin } from './CivicStructure.js';

export interface PublicToilet<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CivicStructure<D>, rdfine.RdfResource<D> {
}

export function PublicToiletMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<PublicToilet & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class PublicToiletClass extends CivicStructureMixin(Resource) {
  }
  return PublicToiletClass as any
}
PublicToiletMixin.appliesTo = schema.PublicToilet
PublicToiletMixin.createFactory = (env: RdfineEnvironment) => createFactory<PublicToilet>([CivicStructureMixin, PublicToiletMixin], { types: [schema.PublicToilet] }, env)
