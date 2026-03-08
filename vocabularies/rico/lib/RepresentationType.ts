import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { TypeMixin } from './Type.js';

export interface RepresentationType<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.Type<D>, rdfine.RdfResource<D> {
  isRepresentationTypeOf: Rico.Instantiation<D> | undefined;
}

export function RepresentationTypeMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<RepresentationType & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class RepresentationTypeClass extends TypeMixin(Resource) {
    @rdfine.property.resource({ implicitTypes: [rico.Instantiation] })
    isRepresentationTypeOf: Rico.Instantiation | undefined;
  }
  return RepresentationTypeClass as any
}
RepresentationTypeMixin.appliesTo = rico.RepresentationType
RepresentationTypeMixin.createFactory = (env: RdfineEnvironment) => createFactory<RepresentationType>([TypeMixin, RepresentationTypeMixin], { types: [rico.RepresentationType] }, env)
