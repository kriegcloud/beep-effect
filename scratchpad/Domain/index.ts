/**
 * Domain module for managing application domains.
 * This module provides domain-related functionality and entities.
 *
 * @module
 * @since 0.0.0
 */
import * as Model from "effect/unstable/schema/Model";
import * as S from "effect/Schema";
import {$SharedDomainId} from "@beep/identity";

const $I = $SharedDomainId.create("entities/MyDomainEntity/MyDomainEntity.model")

export class MyDomainEntity extends Model.Class<MyDomainEntity>($I`MyDomainEntity`)({
	id: Model.Generated(S.Number),
	field1: Model.FieldOption(S.String),
}, $I.annote("MyDomainEntity", {
	description: "MyDomainEntity is a domain entity representing a specific concept or object within the application domain. It encapsulates data and behavior related to this entity.",
})) {
}


