import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { TypeMixin } from './Type.js';

export interface DateType<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.Type<D>, rdfine.RdfResource<D> {
  isDateTypeOf: Rico.Date<D> | undefined;
}

export function DateTypeMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<DateType & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class DateTypeClass extends TypeMixin(Resource) {
    @rdfine.property.resource({ implicitTypes: [rico.Date] })
    isDateTypeOf: Rico.Date | undefined;
  }
  return DateTypeClass as any
}
DateTypeMixin.appliesTo = rico.DateType
DateTypeMixin.createFactory = (env: RdfineEnvironment) => createFactory<DateType>([TypeMixin, DateTypeMixin], { types: [rico.DateType] }, env)
