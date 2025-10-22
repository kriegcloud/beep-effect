"use client";
import { iamAtomRuntime } from "@beep/iam-sdk/clients/runtime";
import { useAtom, useAtomValue } from "@effect-atom/atom-react";
import { OrganizationImplementations } from "./organization.implementations";

export const createOrganizationAtom = iamAtomRuntime.fn(OrganizationImplementations.OrganizationCreate);
export const useCreateOrganization = () => {
  const [createOrganizationResult, createOrganization] = useAtom(createOrganizationAtom);
  return { createOrganizationResult, createOrganization };
};

export const checkOrganizationSlugAtom = iamAtomRuntime.fn(OrganizationImplementations.OrganizationCheckSlug);
export const useCheckOrganizationSlug = () => {
  const [checkOrganizationSlugResult, checkOrganizationSlug] = useAtom(checkOrganizationSlugAtom);
  return { checkOrganizationSlugResult, checkOrganizationSlug };
};

export const listOrganizationsAtom = iamAtomRuntime.atom(OrganizationImplementations.OrganizationList);
export const useListOrganizations = () => {
  const listOrganizationsResult = useAtomValue(listOrganizationsAtom);
  return { listOrganizationsResult };
};

export const setActiveOrganizationAtom = iamAtomRuntime.fn(OrganizationImplementations.OrganizationSetActive);
export const useSetActiveOrganization = () => {
  const [setActiveOrganizationResult, setActiveOrganization] = useAtom(setActiveOrganizationAtom);
  return { setActiveOrganizationResult, setActiveOrganization };
};

export const getFullOrganizationAtom = iamAtomRuntime.fn(OrganizationImplementations.OrganizationGetFull);
export const useGetFullOrganization = () => {
  const [getFullOrganizationResult, getFullOrganization] = useAtom(getFullOrganizationAtom);
  return { getFullOrganizationResult, getFullOrganization };
};

export const updateOrganizationAtom = iamAtomRuntime.fn(OrganizationImplementations.OrganizationUpdate);
export const useUpdateOrganization = () => {
  const [updateOrganizationResult, updateOrganization] = useAtom(updateOrganizationAtom);
  return { updateOrganizationResult, updateOrganization };
};

export const deleteOrganizationAtom = iamAtomRuntime.fn(OrganizationImplementations.OrganizationDelete);
export const useDeleteOrganization = () => {
  const [deleteOrganizationResult, deleteOrganization] = useAtom(deleteOrganizationAtom);
  return { deleteOrganizationResult, deleteOrganization };
};

export const acceptOrganizationInvitationAtom = iamAtomRuntime.fn(OrganizationImplementations.AcceptInvitation);
export const useAcceptOrganizationInvitation = () => {
  const [acceptOrganizationInvitationResult, acceptOrganizationInvitation] = useAtom(acceptOrganizationInvitationAtom);
  return { acceptOrganizationInvitationResult, acceptOrganizationInvitation };
};

export const inviteOrganizationMemberAtom = iamAtomRuntime.fn(OrganizationImplementations.OrganizationInviteMember);
export const useInviteOrganizationMember = () => {
  const [inviteOrganizationMemberResult, inviteOrganizationMember] = useAtom(inviteOrganizationMemberAtom);
  return { inviteOrganizationMemberResult, inviteOrganizationMember };
};

export const cancelOrganizationInvitationAtom = iamAtomRuntime.fn(
  OrganizationImplementations.OrganizationCancelInvitation
);
export const useCancelOrganizationInvitation = () => {
  const [cancelOrganizationInvitationResult, cancelOrganizationInvitation] = useAtom(cancelOrganizationInvitationAtom);
  return { cancelOrganizationInvitationResult, cancelOrganizationInvitation };
};

export const rejectOrganizationInvitationAtom = iamAtomRuntime.fn(
  OrganizationImplementations.OrganizationRejectInvitation
);
export const useRejectOrganizationInvitation = () => {
  const [rejectOrganizationInvitationResult, rejectOrganizationInvitation] = useAtom(rejectOrganizationInvitationAtom);
  return { rejectOrganizationInvitationResult, rejectOrganizationInvitation };
};

export const listOrganizationInvitationsAtom = iamAtomRuntime.fn(
  OrganizationImplementations.OrganizationListInvitations
);
export const useListOrganizationInvitations = () => {
  const [listOrganizationInvitationsResult, listOrganizationInvitations] = useAtom(listOrganizationInvitationsAtom);
  return { listOrganizationInvitationsResult, listOrganizationInvitations };
};

export const listUserOrganizationInvitationsAtom = iamAtomRuntime.fn(
  OrganizationImplementations.OrganizationListUserInvitations
);
export const useListUserOrganizationInvitations = () => {
  const [listUserOrganizationInvitationsResult, listUserOrganizationInvitations] = useAtom(
    listUserOrganizationInvitationsAtom
  );
  return { listUserOrganizationInvitationsResult, listUserOrganizationInvitations };
};

export const getOrganizationInvitationAtom = iamAtomRuntime.fn(OrganizationImplementations.OrganizationGetInvitation);
export const useGetOrganizationInvitation = () => {
  const [getOrganizationInvitationResult, getOrganizationInvitation] = useAtom(getOrganizationInvitationAtom);
  return { getOrganizationInvitationResult, getOrganizationInvitation };
};

export const listOrganizationMembersAtom = iamAtomRuntime.fn(OrganizationImplementations.OrganizationListMembers);
export const useListOrganizationMembers = () => {
  const [listOrganizationMembersResult, listOrganizationMembers] = useAtom(listOrganizationMembersAtom);
  return { listOrganizationMembersResult, listOrganizationMembers };
};

export const removeOrganizationMemberAtom = iamAtomRuntime.fn(OrganizationImplementations.OrganizationRemoveMember);
export const useRemoveOrganizationMember = () => {
  const [removeOrganizationMemberResult, removeOrganizationMember] = useAtom(removeOrganizationMemberAtom);
  return { removeOrganizationMemberResult, removeOrganizationMember };
};

export const updateOrganizationMemberRoleAtom = iamAtomRuntime.fn(
  OrganizationImplementations.OrganizationUpdateMemberRole
);
export const useUpdateOrganizationMemberRole = () => {
  const [updateOrganizationMemberRoleResult, updateOrganizationMemberRole] = useAtom(updateOrganizationMemberRoleAtom);
  return { updateOrganizationMemberRoleResult, updateOrganizationMemberRole };
};

export const getActiveOrganizationMemberAtom = iamAtomRuntime.fn(
  OrganizationImplementations.OrganizationGetActiveMember
);
export const useGetActiveOrganizationMember = () => {
  const [getActiveOrganizationMemberResult, getActiveOrganizationMember] = useAtom(getActiveOrganizationMemberAtom);
  return { getActiveOrganizationMemberResult, getActiveOrganizationMember };
};

export const getActiveOrganizationMemberRoleAtom = iamAtomRuntime.fn(
  OrganizationImplementations.OrganizationGetActiveMemberRole
);
export const useGetActiveOrganizationMemberRole = () => {
  const [getActiveOrganizationMemberRoleResult, getActiveOrganizationMemberRole] = useAtom(
    getActiveOrganizationMemberRoleAtom
  );
  return { getActiveOrganizationMemberRoleResult, getActiveOrganizationMemberRole };
};

export const leaveOrganizationAtom = iamAtomRuntime.fn(OrganizationImplementations.OrganizationLeave);
export const useLeaveOrganization = () => {
  const [leaveOrganizationResult, leaveOrganization] = useAtom(leaveOrganizationAtom);
  return { leaveOrganizationResult, leaveOrganization };
};

export const createOrganizationRoleAtom = iamAtomRuntime.fn(OrganizationImplementations.OrganizationCreateRole);
export const useCreateOrganizationRole = () => {
  const [createOrganizationRoleResult, createOrganizationRole] = useAtom(createOrganizationRoleAtom);
  return { createOrganizationRoleResult, createOrganizationRole };
};

export const deleteOrganizationRoleAtom = iamAtomRuntime.fn(OrganizationImplementations.OrganizationDeleteRole);
export const useDeleteOrganizationRole = () => {
  const [deleteOrganizationRoleResult, deleteOrganizationRole] = useAtom(deleteOrganizationRoleAtom);
  return { deleteOrganizationRoleResult, deleteOrganizationRole };
};

export const listOrganizationRolesAtom = iamAtomRuntime.fn(OrganizationImplementations.OrganizationListRoles);
export const useListOrganizationRoles = () => {
  const [listOrganizationRolesResult, listOrganizationRoles] = useAtom(listOrganizationRolesAtom);
  return { listOrganizationRolesResult, listOrganizationRoles };
};
