import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { InviteMixin } from '../lib/Invite.js';
import { OfferMixin } from '../lib/Offer.js';

export const InviteBundle = [
  InviteMixin as Mixin,
  OfferMixin as Mixin];
