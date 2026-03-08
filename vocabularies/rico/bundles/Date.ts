import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AppellationMixin } from '../lib/Appellation.js';
import { DateMixin } from '../lib/Date.js';
import { DateTypeMixin } from '../lib/DateType.js';
import { EventMixin } from '../lib/Event.js';
import { InstantiationMixin } from '../lib/Instantiation.js';
import { PersonMixin } from '../lib/Person.js';
import { RecordResourceMixin } from '../lib/RecordResource.js';
import { RecordSetMixin } from '../lib/RecordSet.js';
import { ThingMixin } from '../lib/Thing.js';

export const DateBundle = [
  AppellationMixin as Mixin,
  DateMixin as Mixin,
  DateTypeMixin as Mixin,
  EventMixin as Mixin,
  InstantiationMixin as Mixin,
  PersonMixin as Mixin,
  RecordResourceMixin as Mixin,
  RecordSetMixin as Mixin,
  ThingMixin as Mixin];
