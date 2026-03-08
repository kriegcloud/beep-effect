import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { csvw } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Csvw from '../index.js';

export interface Transformation<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
  scriptFormat: string | undefined;
  source: string | undefined;
  targetFormat: string | undefined;
  title: RDF.Term | undefined;
  url: string | undefined;
}

export function TransformationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Transformation & RdfResourceCore> & Base {
  @rdfine.namespace(csvw)
  class TransformationClass extends Resource {
    @rdfine.property.literal()
    scriptFormat: string | undefined;
    @rdfine.property.literal()
    source: string | undefined;
    @rdfine.property.literal()
    targetFormat: string | undefined;
    @rdfine.property()
    title: RDF.Term | undefined;
    @rdfine.property.literal()
    url: string | undefined;
  }
  return TransformationClass as any
}
TransformationMixin.appliesTo = csvw.Transformation
TransformationMixin.createFactory = (env: RdfineEnvironment) => createFactory<Transformation>([TransformationMixin], { types: [csvw.Transformation] }, env)
