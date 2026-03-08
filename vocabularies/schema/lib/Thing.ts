import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';

export interface Thing<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
  additionalType: RDF.NamedNode | undefined;
  alternateName: string | undefined;
  description: string | undefined;
  disambiguatingDescription: string | undefined;
  identifier: Schema.PropertyValue<D> | undefined;
  identifierLiteral: string | undefined;
  image: Schema.ImageObject<D> | undefined;
  mainEntityOfPage: Schema.CreativeWork<D> | undefined;
  name: string | undefined;
  potentialAction: Schema.Action<D> | undefined;
  sameAs: RDF.NamedNode | undefined;
  subjectOf: Schema.CreativeWork<D> | Schema.Event<D> | undefined;
  url: RDF.NamedNode | undefined;
}

export function ThingMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Thing & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ThingClass extends Resource {
    @rdfine.property()
    additionalType: RDF.NamedNode | undefined;
    @rdfine.property.literal()
    alternateName: string | undefined;
    @rdfine.property.literal()
    description: string | undefined;
    @rdfine.property.literal()
    disambiguatingDescription: string | undefined;
    @rdfine.property.resource()
    identifier: Schema.PropertyValue | undefined;
    @rdfine.property.literal({ path: schema.identifier })
    identifierLiteral: string | undefined;
    @rdfine.property.resource()
    image: Schema.ImageObject | undefined;
    @rdfine.property.resource()
    mainEntityOfPage: Schema.CreativeWork | undefined;
    @rdfine.property.literal()
    name: string | undefined;
    @rdfine.property.resource()
    potentialAction: Schema.Action | undefined;
    @rdfine.property()
    sameAs: RDF.NamedNode | undefined;
    @rdfine.property.resource()
    subjectOf: Schema.CreativeWork | Schema.Event | undefined;
    @rdfine.property()
    url: RDF.NamedNode | undefined;
  }
  return ThingClass as any
}
ThingMixin.appliesTo = schema.Thing
ThingMixin.createFactory = (env: RdfineEnvironment) => createFactory<Thing>([ThingMixin], { types: [schema.Thing] }, env)
