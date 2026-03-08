import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { StructuredValueMixin } from './StructuredValue.js';

export interface DeliveryTimeSettings<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.StructuredValue<D>, rdfine.RdfResource<D> {
  deliveryTime: Schema.ShippingDeliveryTime<D> | undefined;
  isUnlabelledFallback: boolean | undefined;
  shippingDestination: Schema.DefinedRegion<D> | undefined;
  transitTimeLabel: string | undefined;
}

export function DeliveryTimeSettingsMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<DeliveryTimeSettings & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class DeliveryTimeSettingsClass extends StructuredValueMixin(Resource) {
    @rdfine.property.resource()
    deliveryTime: Schema.ShippingDeliveryTime | undefined;
    @rdfine.property.literal({ type: Boolean })
    isUnlabelledFallback: boolean | undefined;
    @rdfine.property.resource()
    shippingDestination: Schema.DefinedRegion | undefined;
    @rdfine.property.literal()
    transitTimeLabel: string | undefined;
  }
  return DeliveryTimeSettingsClass as any
}
DeliveryTimeSettingsMixin.appliesTo = schema.DeliveryTimeSettings
DeliveryTimeSettingsMixin.createFactory = (env: RdfineEnvironment) => createFactory<DeliveryTimeSettings>([StructuredValueMixin, DeliveryTimeSettingsMixin], { types: [schema.DeliveryTimeSettings] }, env)
