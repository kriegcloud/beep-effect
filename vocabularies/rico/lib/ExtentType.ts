import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { TypeMixin } from './Type.js';

export interface ExtentType<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.Type<D>, rdfine.RdfResource<D> {
  isExtentTypeOf: Rico.Extent<D> | undefined;
}

export function ExtentTypeMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ExtentType & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class ExtentTypeClass extends TypeMixin(Resource) {
    @rdfine.property.resource({ implicitTypes: [rico.Extent] })
    isExtentTypeOf: Rico.Extent | undefined;
  }
  return ExtentTypeClass as any
}
ExtentTypeMixin.appliesTo = rico.ExtentType
ExtentTypeMixin.createFactory = (env: RdfineEnvironment) => createFactory<ExtentType>([TypeMixin, ExtentTypeMixin], { types: [rico.ExtentType] }, env)
