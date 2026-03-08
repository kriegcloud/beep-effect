import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { PlaceMixin } from './Place.js';

export interface CivicStructure<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Place<D>, rdfine.RdfResource<D> {
  openingHours: string | undefined;
}

export function CivicStructureMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<CivicStructure & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class CivicStructureClass extends PlaceMixin(Resource) {
    @rdfine.property.literal()
    openingHours: string | undefined;
  }
  return CivicStructureClass as any
}
CivicStructureMixin.appliesTo = schema.CivicStructure
CivicStructureMixin.createFactory = (env: RdfineEnvironment) => createFactory<CivicStructure>([PlaceMixin, CivicStructureMixin], { types: [schema.CivicStructure] }, env)
