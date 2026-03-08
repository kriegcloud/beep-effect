import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { BioChemEntityMixin } from './BioChemEntity.js';

export interface Gene<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.BioChemEntity<D>, rdfine.RdfResource<D> {
  alternativeOf: Schema.Gene<D> | undefined;
  encodesBioChemEntity: Schema.BioChemEntity<D> | undefined;
  expressedIn: Schema.AnatomicalStructure<D> | Schema.AnatomicalSystem<D> | Schema.BioChemEntity<D> | undefined;
  hasBioPolymerSequence: string | undefined;
}

export function GeneMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Gene & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class GeneClass extends BioChemEntityMixin(Resource) {
    @rdfine.property.resource()
    alternativeOf: Schema.Gene | undefined;
    @rdfine.property.resource()
    encodesBioChemEntity: Schema.BioChemEntity | undefined;
    @rdfine.property.resource()
    expressedIn: Schema.AnatomicalStructure | Schema.AnatomicalSystem | Schema.BioChemEntity | undefined;
    @rdfine.property.literal()
    hasBioPolymerSequence: string | undefined;
  }
  return GeneClass as any
}
GeneMixin.appliesTo = schema.Gene
GeneMixin.createFactory = (env: RdfineEnvironment) => createFactory<Gene>([BioChemEntityMixin, GeneMixin], { types: [schema.Gene] }, env)
