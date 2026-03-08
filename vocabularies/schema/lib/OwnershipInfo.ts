import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { StructuredValueMixin } from './StructuredValue.js';

export interface OwnershipInfo<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.StructuredValue<D>, rdfine.RdfResource<D> {
  acquiredFrom: Schema.Organization<D> | Schema.Person<D> | undefined;
  ownedFrom: Date | undefined;
  ownedThrough: Date | undefined;
  typeOfGood: Schema.Product<D> | Schema.Service<D> | undefined;
}

export function OwnershipInfoMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<OwnershipInfo & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class OwnershipInfoClass extends StructuredValueMixin(Resource) {
    @rdfine.property.resource()
    acquiredFrom: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.literal({ type: Date })
    ownedFrom: Date | undefined;
    @rdfine.property.literal({ type: Date })
    ownedThrough: Date | undefined;
    @rdfine.property.resource()
    typeOfGood: Schema.Product | Schema.Service | undefined;
  }
  return OwnershipInfoClass as any
}
OwnershipInfoMixin.appliesTo = schema.OwnershipInfo
OwnershipInfoMixin.createFactory = (env: RdfineEnvironment) => createFactory<OwnershipInfo>([StructuredValueMixin, OwnershipInfoMixin], { types: [schema.OwnershipInfo] }, env)
