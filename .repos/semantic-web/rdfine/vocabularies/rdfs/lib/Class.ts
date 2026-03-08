import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rdfs } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rdfs from '../index.js';
import { ResourceMixin } from './Resource.js';

export interface Class<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rdfs.Resource<D>, rdfine.RdfResource<D> {
  subClassOf: Array<Rdfs.Class<D>>;
}

export function ClassMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Class & RdfResourceCore> & Base {
  @rdfine.namespace(rdfs)
  class ClassClass extends ResourceMixin(Resource) {
    @rdfine.property.resource({ values: 'array', as: [ClassMixin] })
    subClassOf!: Array<Rdfs.Class>;
  }
  return ClassClass as any
}
ClassMixin.appliesTo = rdfs.Class
ClassMixin.createFactory = (env: RdfineEnvironment) => createFactory<Class>([ResourceMixin, ClassMixin], { types: [rdfs.Class] }, env)
