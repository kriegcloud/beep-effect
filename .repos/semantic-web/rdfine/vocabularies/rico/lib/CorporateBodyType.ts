import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { TypeMixin } from './Type.js';

export interface CorporateBodyType<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.Type<D>, rdfine.RdfResource<D> {
  isOrWasCorporateBodyTypeOf: Rico.CorporateBody<D> | undefined;
}

export function CorporateBodyTypeMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<CorporateBodyType & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class CorporateBodyTypeClass extends TypeMixin(Resource) {
    @rdfine.property.resource({ implicitTypes: [rico.CorporateBody] })
    isOrWasCorporateBodyTypeOf: Rico.CorporateBody | undefined;
  }
  return CorporateBodyTypeClass as any
}
CorporateBodyTypeMixin.appliesTo = rico.CorporateBodyType
CorporateBodyTypeMixin.createFactory = (env: RdfineEnvironment) => createFactory<CorporateBodyType>([TypeMixin, CorporateBodyTypeMixin], { types: [rico.CorporateBodyType] }, env)
