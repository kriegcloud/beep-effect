import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { hydra } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Hydra from '../index.js';
import type * as Rdf from '@rdfine/rdf';
import { PropertyMixin as RdfPropertyMixin } from '@rdfine/rdf/lib/Property';

export interface SupportedProperty<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
  description: string | undefined;
  property: Rdf.Property<D> | undefined;
  readable: boolean | undefined;
  required: boolean | undefined;
  supportedOperation: Array<Hydra.Operation<D>>;
  title: string | undefined;
  writable: boolean | undefined;
}

export function SupportedPropertyMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SupportedProperty & RdfResourceCore> & Base {
  @rdfine.namespace(hydra)
  class SupportedPropertyClass extends Resource {
    @rdfine.property.literal()
    description: string | undefined;
    @rdfine.property.resource({ as: [RdfPropertyMixin] })
    property: Rdf.Property | undefined;
    @rdfine.property.literal({ type: Boolean })
    readable: boolean | undefined;
    @rdfine.property.literal({ type: Boolean })
    required: boolean | undefined;
    @rdfine.property.resource({ values: 'array', implicitTypes: [hydra.Operation] })
    supportedOperation!: Array<Hydra.Operation>;
    @rdfine.property.literal()
    title: string | undefined;
    @rdfine.property.literal({ type: Boolean })
    writable: boolean | undefined;
  }
  return SupportedPropertyClass as any
}
SupportedPropertyMixin.appliesTo = hydra.SupportedProperty
SupportedPropertyMixin.createFactory = (env: RdfineEnvironment) => createFactory<SupportedProperty>([SupportedPropertyMixin], { types: [hydra.SupportedProperty] }, env)
