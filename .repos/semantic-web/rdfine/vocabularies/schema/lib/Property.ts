import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { IntangibleMixin } from './Intangible.js';

export interface Property<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Intangible<D>, rdfine.RdfResource<D> {
  domainIncludes: RDF.Term | undefined;
  inverseOf: Schema.Property<D> | undefined;
  rangeIncludes: RDF.Term | undefined;
  supersededBy: Schema.Property<D> | undefined;
}

export function PropertyMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Property & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class PropertyClass extends IntangibleMixin(Resource) {
    @rdfine.property()
    domainIncludes: RDF.Term | undefined;
    @rdfine.property.resource()
    inverseOf: Schema.Property | undefined;
    @rdfine.property()
    rangeIncludes: RDF.Term | undefined;
    @rdfine.property.resource()
    supersededBy: Schema.Property | undefined;
  }
  return PropertyClass as any
}
PropertyMixin.appliesTo = schema.Property
PropertyMixin.createFactory = (env: RdfineEnvironment) => createFactory<Property>([IntangibleMixin, PropertyMixin], { types: [schema.Property] }, env)
