import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { foaf } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Foaf from '../index.js';

export interface LabelProperty<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
}

export function LabelPropertyMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<LabelProperty & RdfResourceCore> & Base {
  @rdfine.namespace(foaf)
  class LabelPropertyClass extends Resource {
  }
  return LabelPropertyClass as any
}
LabelPropertyMixin.appliesTo = foaf.LabelProperty
LabelPropertyMixin.createFactory = (env: RdfineEnvironment) => createFactory<LabelProperty>([LabelPropertyMixin], { types: [foaf.LabelProperty] }, env)
