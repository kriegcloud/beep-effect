import { HazelRpcClient } from "~/lib/services/common/rpc-atom-client"

/**
 * Mutation atom for creating a channel member (joining a channel).
 */
export const createChannelMemberMutation = HazelRpcClient.mutation("channelMember.create")

/**
 * Mutation atom for updating channel member preferences.
 * Use this for toggling mute, favorite, hidden status, etc.
 */
export const updateChannelMemberMutation = HazelRpcClient.mutation("channelMember.update")

/**
 * Mutation atom for deleting a channel member (leaving a channel).
 */
export const deleteChannelMemberMutation = HazelRpcClient.mutation("channelMember.delete")

/**
 * Mutation atom for clearing notification count when user views a channel.
 * Called automatically when entering a channel to reset unread notifications.
 */
export const clearChannelNotificationsMutation = HazelRpcClient.mutation("channelMember.clearNotifications")
