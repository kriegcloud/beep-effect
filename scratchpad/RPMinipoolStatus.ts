import { $ScratchId } from "@beep/identity";
import { NonNegativeInt } from "@beep/schema/Int";
import { Percentage } from "@beep/schema/Percentage";
import { NonEmptyTrimmedStr } from "@beep/schema/String";
import { EthAmount } from "@beep/schema/blockchain/EthAmount";
import {
  EthereumValidatorPublicKeyRedacted,
} from "@beep/schema/blockchain/EthereumValidatorPublicKey";
import {
  EvmAddressRedacted,
} from "@beep/schema/blockchain/EvmAddress";
import * as S from "effect/Schema";
import { RocketPoolUtcTimestamp } from "./RocketPoolUtcTimestamp.ts";

const $I = $ScratchId.create("RPMinipoolStatus");

/**
 * Decoded representation of one Rocket Pool minipool status row from
 * `RP_MINIPOOL_STATUS_OUTPUTS.json`.
 */
export class RPMinipoolStatusEntry extends S.Class<RPMinipoolStatusEntry>($I`RPMinipoolStatusEntry`)(
  {
    address: EvmAddressRedacted,
    penalties: NonNegativeInt,
    status: NonEmptyTrimmedStr,
    status_updated: RocketPoolUtcTimestamp,
    node_fee_percent: Percentage,
    node_deposit_eth: EthAmount,
    rp_eth_assigned: RocketPoolUtcTimestamp,
    rp_deposit_eth: EthAmount,
    minipool_balance_el_eth: EthAmount,
    minipool_balance_el_your_portion_eth: EthAmount,
    available_refund_eth: EthAmount,
    total_el_rewards_eth: EthAmount,
    validator_pubkey: EthereumValidatorPublicKeyRedacted,
    validator_index: NonNegativeInt,
    validator_active: S.Boolean,
    beacon_balance_cl_eth: EthAmount,
    beacon_balance_cl_your_portion_eth: EthAmount,
    use_latest_delegate: S.Boolean,
    delegate_address: EvmAddressRedacted,
    rollback_delegate: S.OptionFromNullOr(EvmAddressRedacted),
    effective_delegate: EvmAddressRedacted,
  },
  $I.annote("RPMinipoolStatusEntry", {
    description: "One decoded Rocket Pool minipool status entry from the scratchpad export.",
  })
) {}

/**
 * Decoded representation of the full Rocket Pool minipool status export.
 */
export class RPMinipoolStatusOutputs extends S.Class<RPMinipoolStatusOutputs>($I`RPMinipoolStatusOutputs`)(
  {
    minipools: S.Array(RPMinipoolStatusEntry),
    finalized_minipools_hidden: NonNegativeInt,
  },
  $I.annote("RPMinipoolStatusOutputs", {
    description: "Decoded Rocket Pool minipool status export from RP_MINIPOOL_STATUS_OUTPUTS.json.",
  })
) {}

/**
 * JSON-string boundary schema for the Rocket Pool minipool status export.
 */
export const RPMinipoolStatusOutputsJson = S.fromJsonString(RPMinipoolStatusOutputs).pipe(
  $I.annoteSchema("RPMinipoolStatusOutputsJson", {
    description: "JSON-string boundary schema for the Rocket Pool minipool status export.",
  })
);

/**
 * Decode the Rocket Pool minipool status export from a JSON string.
 */
export const decodeRPMinipoolStatusOutputsJson = S.decodeUnknownEffect(RPMinipoolStatusOutputsJson);
