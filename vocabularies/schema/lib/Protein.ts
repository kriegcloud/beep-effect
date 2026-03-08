import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { BioChemEntityMixin } from './BioChemEntity.js';

export interface Protein<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.BioChemEntity<D>, rdfine.RdfResource<D> {
  hasBioPolymerSequence: string | undefined;
}

export function ProteinMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Protein & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ProteinClass extends BioChemEntityMixin(Resource) {
    @rdfine.property.literal()
    hasBioPolymerSequence: string | undefined;
  }
  return ProteinClass as any
}
ProteinMixin.appliesTo = schema.Protein
ProteinMixin.createFactory = (env: RdfineEnvironment) => createFactory<Protein>([BioChemEntityMixin, ProteinMixin], { types: [schema.Protein] }, env)
