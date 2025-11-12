import { client } from "@beep/iam-sdk/adapters";
import { addFetchOptions, compact, makeFailureContinuation, withFetchOptions } from "@beep/iam-sdk/clients/_internal";
import { MetadataFactory } from "@beep/iam-sdk/clients/_internal/client-method-helpers";

import {
  AcceptInvitationContract,
  OrganizationCancelInvitationContract,
  OrganizationCheckSlugContract,
  OrganizationContractKit,
  OrganizationCreateContract,
  OrganizationCreateRoleContract,
  OrganizationDeleteContract,
  OrganizationDeleteRoleContract,
  OrganizationGetActiveMemberContract,
  OrganizationGetActiveMemberRoleContract,
  OrganizationGetFullContract,
  OrganizationGetInvitationContract,
  OrganizationInviteMemberContract,
  OrganizationLeaveContract,
  OrganizationListContract,
  OrganizationListInvitationsContract,
  OrganizationListMembersContract,
  OrganizationListRolesContract,
  OrganizationListUserInvitationsContract,
  OrganizationRejectInvitationContract,
  OrganizationRemoveMemberContract,
  OrganizationSetActiveContract,
  OrganizationUpdateContract,
  OrganizationUpdateMemberRoleContract,
} from "@beep/iam-sdk/clients/organization/organization.contracts";
import { IamError } from "@beep/iam-sdk/errors";
import * as Effect from "effect/Effect";
import * as Struct from "effect/Struct";

const metaDataFactory = new MetadataFactory("organization");

const OrganizationCreateMetadata = metaDataFactory.make("create");
const OrganizationCheckSlugMetadata = metaDataFactory.make("checkSlug");
const OrganizationListMetadata = metaDataFactory.make("list");
const OrganizationSetActiveMetadata = metaDataFactory.make("setActive");
const OrganizationGetFullMetadata = metaDataFactory.make("getFullOrganization");
const OrganizationUpdateMetadata = metaDataFactory.make("update");
const OrganizationDeleteMetadata = metaDataFactory.make("delete");
const AcceptInvitationMetadata = metaDataFactory.make("acceptInvitation");
const OrganizationInviteMemberMetadata = metaDataFactory.make("inviteMember");
const OrganizationCancelInvitationMetadata = metaDataFactory.make("cancelInvitation");
const OrganizationRejectInvitationMetadata = metaDataFactory.make("rejectInvitation");
const OrganizationListInvitationsMetadata = metaDataFactory.make("listInvitations");
const OrganizationListUserInvitationsMetadata = metaDataFactory.make("listUserInvitations");
const OrganizationGetInvitationMetadata = metaDataFactory.make("getInvitation");
const OrganizationListMembersMetadata = metaDataFactory.make("listMembers");
const OrganizationRemoveMemberMetadata = metaDataFactory.make("removeMember");
const OrganizationUpdateMemberRoleMetadata = metaDataFactory.make("updateMemberRole");
const OrganizationGetActiveMemberMetadata = metaDataFactory.make("getActiveMember");
const OrganizationGetActiveMemberRoleMetadata = metaDataFactory.make("getActiveMemberRole");
const OrganizationLeaveMetadata = metaDataFactory.make("leave");
const OrganizationCreateRoleMetadata = metaDataFactory.make("createRole");
const OrganizationDeleteRoleMetadata = metaDataFactory.make("deleteRole");
const OrganizationListRolesMetadata = metaDataFactory.make("listRoles");

const OrganizationCreateHandler = OrganizationCreateContract.implement(
  Effect.fn(function* (payload) {
    const continuation = makeFailureContinuation({
      contract: OrganizationCreateContract.name,
      metadata: OrganizationCreateMetadata,
    });

    const encoded = yield* OrganizationCreateContract.encodePayload(payload);

    const result = yield* continuation.run((handlers) =>
      client.organization.create(
        addFetchOptions(handlers, {
          ...encoded,
          logo: encoded.logo ?? undefined,
          metadata: encoded.metadata ?? undefined,
        })
      )
    );

    yield* continuation.raiseResult(result);

    if (!result.data) {
      return yield* new IamError(
        {},
        "OrganizationCreateHandler returned no payload from Better Auth",
        OrganizationCreateMetadata()
      );
    }

    const decoded = yield* OrganizationCreateContract.decodeUnknownSuccess(result.data);

    client.$store.notify("$sessionSignal");

    return decoded;
  })
);

const OrganizationCheckSlugHandler = OrganizationCheckSlugContract.implement(
  Effect.fn(function* (payload) {
    const continuation = makeFailureContinuation({
      contract: OrganizationCheckSlugContract.name,
      metadata: OrganizationCheckSlugMetadata,
    });

    const encoded = yield* OrganizationCheckSlugContract.encodePayload(payload);

    const result = yield* continuation.run((handlers) =>
      client.organization.checkSlug(addFetchOptions(handlers, encoded))
    );

    yield* continuation.raiseResult(result);

    if (!result.data) {
      return yield* Effect.fail(
        new IamError(
          {},
          "OrganizationCheckSlugHandler returned no payload from Better Auth",
          OrganizationCheckSlugMetadata()
        )
      );
    }

    const data = result.data;

    return yield* OrganizationCheckSlugContract.decodeUnknownSuccess(data);
  })
);

const OrganizationListHandler = OrganizationListContract.implement(
  Effect.fn(function* () {
    const continuation = makeFailureContinuation({
      contract: OrganizationListContract.name,
      metadata: OrganizationListMetadata,
    });

    const result = yield* continuation.run((handlers) =>
      client.organization.list(undefined, withFetchOptions(handlers))
    );

    yield* continuation.raiseResult(result);

    if (!result.data) {
      return yield* Effect.fail(
        new IamError({}, "OrganizationListHandler returned no payload from Better Auth", OrganizationListMetadata())
      );
    }

    const data = result.data;

    return yield* OrganizationListContract.decodeUnknownSuccess(data);
  })
);

const OrganizationSetActiveHandler = OrganizationSetActiveContract.implement(
  Effect.fn(function* (payload) {
    const continuation = makeFailureContinuation({
      contract: OrganizationSetActiveContract.name,
      metadata: OrganizationSetActiveMetadata,
    });

    const encoded = yield* OrganizationSetActiveContract.encodePayload(payload);

    const result = yield* continuation.run((handlers) =>
      client.organization.setActive(addFetchOptions(handlers, encoded))
    );

    yield* continuation.raiseResult(result);

    const decoded = yield* OrganizationSetActiveContract.decodeUnknownSuccess(result.data ?? null);

    client.$store.notify("$sessionSignal");

    return decoded;
  })
);

const OrganizationGetFullHandler = OrganizationGetFullContract.implement(
  Effect.fn(function* (payload) {
    const continuation = makeFailureContinuation({
      contract: OrganizationGetFullContract.name,
      metadata: OrganizationGetFullMetadata,
    });

    const encoded = yield* OrganizationGetFullContract.encodePayload(payload);
    const query = compact(encoded);

    const result = yield* continuation.run((handlers) =>
      client.organization.getFullOrganization(
        Struct.keys(query).length > 0 ? { query } : undefined,
        withFetchOptions(handlers)
      )
    );

    yield* continuation.raiseResult(result);

    return yield* OrganizationGetFullContract.decodeUnknownSuccess(result.data ?? null);
  })
);

const OrganizationUpdateHandler = OrganizationUpdateContract.implement(
  Effect.fn(function* (payload) {
    const continuation = makeFailureContinuation({
      contract: OrganizationUpdateContract.name,
      metadata: OrganizationUpdateMetadata,
    });

    const encoded = yield* OrganizationUpdateContract.encodePayload(payload);

    const result = yield* continuation.run((handlers) =>
      client.organization.update(
        addFetchOptions(handlers, {
          ...encoded,
          data: {
            ...encoded.data,
            logo: encoded.data.logo ?? undefined,
            metadata: encoded.data.metadata ?? undefined,
          },
        })
      )
    );

    yield* continuation.raiseResult(result);

    return yield* OrganizationUpdateContract.decodeUnknownSuccess(result.data ?? null);
  })
);

const OrganizationDeleteHandler = OrganizationDeleteContract.implement(
  Effect.fn(function* (payload) {
    const continuation = makeFailureContinuation({
      contract: OrganizationDeleteContract.name,
      metadata: OrganizationDeleteMetadata,
    });

    const result = yield* continuation.run((handlers) =>
      client.organization.delete({
        organizationId: payload.id,
        fetchOptions: withFetchOptions(handlers),
      })
    );

    yield* continuation.raiseResult(result);

    if (!result.data) {
      return yield* Effect.fail(
        new IamError({}, "OrganizationDeleteHandler returned no payload from Better Auth", OrganizationDeleteMetadata())
      );
    }

    const data = result.data;

    const decoded = yield* OrganizationDeleteContract.decodeUnknownSuccess(data);

    client.$store.notify("$sessionSignal");

    return decoded;
  })
);

const AcceptInvitationHandler = AcceptInvitationContract.implement(
  Effect.fn(function* (payload) {
    const continuation = makeFailureContinuation({
      contract: AcceptInvitationContract.name,
      metadata: AcceptInvitationMetadata,
    });

    const encoded = yield* AcceptInvitationContract.encodePayload(payload);

    const result = yield* continuation.run((handlers) =>
      client.organization.acceptInvitation(addFetchOptions(handlers, encoded))
    );

    yield* continuation.raiseResult(result);

    if (!result.data) {
      return yield* Effect.fail(
        new IamError({}, "AcceptInvitationHandler returned no payload from Better Auth", AcceptInvitationMetadata())
      );
    }

    const data = result.data;

    const decoded = yield* AcceptInvitationContract.decodeUnknownSuccess(data);

    client.$store.notify("$sessionSignal");

    return decoded;
  })
);

const OrganizationInviteMemberHandler = OrganizationInviteMemberContract.implement(
  Effect.fn(function* (payload) {
    const continuation = makeFailureContinuation({
      contract: OrganizationInviteMemberContract.name,
      metadata: OrganizationInviteMemberMetadata,
    });

    const encoded = yield* OrganizationInviteMemberContract.encodePayload(payload);

    const result = yield* continuation.run((handlers) =>
      client.organization.inviteMember(
        addFetchOptions(handlers, {
          ...encoded,
          role: Array.isArray(encoded.role) ? [...encoded.role] : encoded.role,
        })
      )
    );

    yield* continuation.raiseResult(result);

    if (!result.data) {
      return yield* Effect.fail(
        new IamError(
          {},
          "OrganizationInviteMemberHandler returned no payload from Better Auth",
          OrganizationInviteMemberMetadata()
        )
      );
    }

    const data = result.data;

    return yield* OrganizationInviteMemberContract.decodeUnknownSuccess(data);
  })
);

const OrganizationCancelInvitationHandler = OrganizationCancelInvitationContract.implement(
  Effect.fn(function* (payload) {
    const continuation = makeFailureContinuation({
      contract: OrganizationCancelInvitationContract.name,
      metadata: OrganizationCancelInvitationMetadata,
    });

    const encoded = yield* OrganizationCancelInvitationContract.encodePayload(payload);

    const result = yield* continuation.run((handlers) =>
      client.organization.cancelInvitation(addFetchOptions(handlers, encoded))
    );

    yield* continuation.raiseResult(result);

    return yield* OrganizationCancelInvitationContract.decodeUnknownSuccess(result.data ?? null);
  })
);

const OrganizationRejectInvitationHandler = OrganizationRejectInvitationContract.implement(
  Effect.fn(function* (payload) {
    const continuation = makeFailureContinuation({
      contract: OrganizationRejectInvitationContract.name,
      metadata: OrganizationRejectInvitationMetadata,
    });

    const encoded = yield* OrganizationRejectInvitationContract.encodePayload(payload);

    const result = yield* continuation.run((handlers) =>
      client.organization.rejectInvitation(addFetchOptions(handlers, encoded))
    );

    yield* continuation.raiseResult(result);

    if (!result.data) {
      return yield* new IamError(
        {},
        "OrganizationRejectInvitationHandler returned no payload from Better Auth",
        OrganizationRejectInvitationMetadata()
      );
    }

    const data = result.data;

    return yield* OrganizationRejectInvitationContract.decodeUnknownSuccess(data);
  })
);

const OrganizationListInvitationsHandler = OrganizationListInvitationsContract.implement(
  Effect.fn(function* (payload) {
    const continuation = makeFailureContinuation({
      contract: OrganizationListInvitationsContract.name,
      metadata: OrganizationListInvitationsMetadata,
    });

    const encoded = yield* OrganizationListInvitationsContract.encodePayload(payload);
    const query = compact(encoded);

    const result = yield* continuation.run((handlers) =>
      client.organization.listInvitations(
        Object.keys(query).length > 0 ? { query } : undefined,
        withFetchOptions(handlers)
      )
    );

    yield* continuation.raiseResult(result);

    if (!result.data) {
      return yield* new IamError(
        {},
        "OrganizationListInvitationsHandler returned no payload from Better Auth",
        OrganizationListInvitationsMetadata()
      );
    }

    const data = result.data;

    return yield* OrganizationListInvitationsContract.decodeUnknownSuccess(data);
  })
);

const OrganizationListUserInvitationsHandler = OrganizationListUserInvitationsContract.implement(
  Effect.fn(function* (payload) {
    const continuation = makeFailureContinuation({
      contract: OrganizationListUserInvitationsContract.name,
      metadata: OrganizationListUserInvitationsMetadata,
    });

    const encoded = yield* OrganizationListUserInvitationsContract.encodePayload(payload);
    const query = compact(encoded);

    const result = yield* continuation.run((handlers) =>
      client.organization.listUserInvitations(
        Object.keys(query).length > 0 ? { query } : undefined,
        withFetchOptions(handlers)
      )
    );

    yield* continuation.raiseResult(result);

    if (!result.data) {
      return yield* Effect.fail(
        new IamError(
          {},
          "OrganizationListUserInvitationsHandler returned no payload from Better Auth",
          OrganizationListUserInvitationsMetadata()
        )
      );
    }

    const data = result.data;

    return yield* OrganizationListUserInvitationsContract.decodeUnknownSuccess(data);
  })
);

const OrganizationGetInvitationHandler = OrganizationGetInvitationContract.implement(
  Effect.fn(function* (payload) {
    const continuation = makeFailureContinuation({
      contract: OrganizationGetInvitationContract.name,
      metadata: OrganizationGetInvitationMetadata,
    });

    const encoded = yield* OrganizationGetInvitationContract.encodePayload(payload);

    const result = yield* continuation.run((handlers) =>
      client.organization.getInvitation({ query: encoded }, withFetchOptions(handlers))
    );

    yield* continuation.raiseResult(result);

    if (!result.data) {
      return yield* Effect.fail(
        new IamError(
          {},
          "OrganizationGetInvitationHandler returned no payload from Better Auth",
          OrganizationGetInvitationMetadata()
        )
      );
    }

    const data = result.data;

    return yield* OrganizationGetInvitationContract.decodeUnknownSuccess(data);
  })
);

const OrganizationListMembersHandler = OrganizationListMembersContract.implement(
  Effect.fn(function* (payload) {
    const continuation = makeFailureContinuation({
      contract: OrganizationListMembersContract.name,
      metadata: OrganizationListMembersMetadata,
    });

    const encoded = yield* OrganizationListMembersContract.encodePayload(payload);
    const query = compact(encoded);

    const result = yield* continuation.run((handlers) =>
      client.organization.listMembers(Object.keys(query).length > 0 ? { query } : undefined, withFetchOptions(handlers))
    );

    yield* continuation.raiseResult(result);

    if (!result.data) {
      return yield* Effect.fail(
        new IamError(
          {},
          "OrganizationListMembersHandler returned no payload from Better Auth",
          OrganizationListMembersMetadata()
        )
      );
    }

    const data = result.data;

    return yield* OrganizationListMembersContract.decodeUnknownSuccess(data);
  })
);

const OrganizationRemoveMemberHandler = OrganizationRemoveMemberContract.implement(
  Effect.fn(function* (payload) {
    const continuation = makeFailureContinuation({
      contract: OrganizationRemoveMemberContract.name,
      metadata: OrganizationRemoveMemberMetadata,
    });

    const encoded = yield* OrganizationRemoveMemberContract.encodePayload(payload);

    const result = yield* continuation.run((handlers) =>
      client.organization.removeMember(addFetchOptions(handlers, encoded))
    );

    yield* continuation.raiseResult(result);

    if (!result.data) {
      return yield* Effect.fail(
        new IamError(
          {},
          "OrganizationRemoveMemberHandler returned no payload from Better Auth",
          OrganizationRemoveMemberMetadata()
        )
      );
    }

    const data = result.data;

    return yield* OrganizationRemoveMemberContract.decodeUnknownSuccess(data);
  })
);

const OrganizationUpdateMemberRoleHandler = OrganizationUpdateMemberRoleContract.implement(
  Effect.fn(function* (payload) {
    const continuation = makeFailureContinuation({
      contract: OrganizationUpdateMemberRoleContract.name,
      metadata: OrganizationUpdateMemberRoleMetadata,
    });

    const encoded = yield* OrganizationUpdateMemberRoleContract.encodePayload(payload);

    const result = yield* continuation.run((handlers) =>
      client.organization.updateMemberRole(addFetchOptions(handlers, encoded))
    );

    yield* continuation.raiseResult(result);

    if (!result.data) {
      return yield* Effect.fail(
        new IamError(
          {},
          "OrganizationUpdateMemberRoleHandler returned no payload from Better Auth",
          OrganizationUpdateMemberRoleMetadata()
        )
      );
    }

    const data = result.data;

    return yield* OrganizationUpdateMemberRoleContract.decodeUnknownSuccess(data);
  })
);

const OrganizationGetActiveMemberHandler = OrganizationGetActiveMemberContract.implement(
  Effect.fn(function* () {
    const continuation = makeFailureContinuation({
      contract: OrganizationGetActiveMemberContract.name,
      metadata: OrganizationGetActiveMemberMetadata,
    });

    const result = yield* continuation.run((handlers) =>
      client.organization.getActiveMember(undefined, withFetchOptions(handlers))
    );

    yield* continuation.raiseResult(result);

    if (!result.data) {
      return yield* Effect.fail(
        new IamError(
          {},
          "OrganizationGetActiveMemberHandler returned no payload from Better Auth",
          OrganizationGetActiveMemberMetadata()
        )
      );
    }

    const data = result.data;

    return yield* OrganizationGetActiveMemberContract.decodeUnknownSuccess(data);
  })
);

const OrganizationGetActiveMemberRoleHandler = OrganizationGetActiveMemberRoleContract.implement(
  Effect.fn(function* (payload) {
    const continuation = makeFailureContinuation({
      contract: OrganizationGetActiveMemberRoleContract.name,
      metadata: OrganizationGetActiveMemberRoleMetadata,
    });

    const encoded = yield* OrganizationGetActiveMemberRoleContract.encodePayload(payload);
    const query = compact(encoded);

    const result = yield* continuation.run((handlers) =>
      client.organization.getActiveMemberRole(
        Object.keys(query).length > 0 ? { query } : undefined,
        withFetchOptions(handlers)
      )
    );

    yield* continuation.raiseResult(result);

    if (!result.data) {
      return yield* Effect.fail(
        new IamError(
          {},
          "OrganizationGetActiveMemberRoleHandler returned no payload from Better Auth",
          OrganizationGetActiveMemberRoleMetadata()
        )
      );
    }

    const data = result.data;

    return yield* OrganizationGetActiveMemberRoleContract.decodeUnknownSuccess(data);
  })
);

const OrganizationLeaveHandler = OrganizationLeaveContract.implement(
  Effect.fn(function* (payload) {
    const continuation = makeFailureContinuation({
      contract: OrganizationLeaveContract.name,
      metadata: OrganizationLeaveMetadata,
    });

    const encoded = yield* OrganizationLeaveContract.encodePayload(payload);

    const result = yield* continuation.run((handlers) => client.organization.leave(addFetchOptions(handlers, encoded)));

    yield* continuation.raiseResult(result);

    if (!result.data) {
      return yield* Effect.fail(
        new IamError({}, "OrganizationLeaveHandler returned no payload from Better Auth", OrganizationLeaveMetadata())
      );
    }
    const data = result.data;

    const decoded = yield* OrganizationLeaveContract.decodeUnknownSuccess(data);

    client.$store.notify("$sessionSignal");

    return decoded;
  })
);

const OrganizationCreateRoleHandler = OrganizationCreateRoleContract.implement(
  Effect.fn(function* (payload) {
    const continuation = makeFailureContinuation({
      contract: OrganizationCreateRoleContract.name,
      metadata: OrganizationCreateRoleMetadata,
    });

    const encoded = yield* OrganizationCreateRoleContract.encodePayload(payload);

    const result = yield* continuation.run((handlers) =>
      client.organization.createRole(addFetchOptions(handlers, encoded))
    );

    yield* continuation.raiseResult(result);

    if (!result.data) {
      return yield* Effect.fail(
        new IamError(
          {},
          "OrganizationCreateRoleHandler returned no payload from Better Auth",
          OrganizationCreateRoleMetadata()
        )
      );
    }
    const data = result.data;

    return yield* OrganizationCreateRoleContract.decodeUnknownSuccess(data);
  })
);

const OrganizationDeleteRoleHandler = OrganizationDeleteRoleContract.implement(
  Effect.fn(function* (payload) {
    const continuation = makeFailureContinuation({
      contract: OrganizationDeleteRoleContract.name,
      metadata: OrganizationDeleteRoleMetadata,
    });

    const encoded = yield* OrganizationDeleteRoleContract.encodePayload(payload);

    const result = yield* continuation.run((handlers) =>
      client.organization.deleteRole(addFetchOptions(handlers, encoded))
    );

    yield* continuation.raiseResult(result);

    if (!result.data) {
      return yield* Effect.fail(
        new IamError(
          {},
          "OrganizationDeleteRoleHandler returned no payload from Better Auth",
          OrganizationDeleteRoleMetadata()
        )
      );
    }

    const data = result.data;

    return yield* OrganizationDeleteRoleContract.decodeUnknownSuccess(data);
  })
);

const OrganizationListRolesHandler = OrganizationListRolesContract.implement(
  Effect.fn(function* (payload) {
    const continuation = makeFailureContinuation({
      contract: OrganizationListRolesContract.name,
      metadata: OrganizationListRolesMetadata,
    });

    const encoded = yield* OrganizationListRolesContract.encodePayload(payload);
    const query = compact(encoded);

    const result = yield* continuation.run((handlers) =>
      client.organization.listRoles(Object.keys(query).length > 0 ? { query } : undefined, withFetchOptions(handlers))
    );

    yield* continuation.raiseResult(result);

    if (!result.data) {
      return yield* Effect.fail(
        new IamError(
          {},
          "OrganizationListRolesHandler returned no payload from Better Auth",
          OrganizationListRolesMetadata()
        )
      );
    }
    const data = result.data;

    return yield* OrganizationListRolesContract.decodeUnknownSuccess(data);
  })
);

export const OrganizationImplementations = OrganizationContractKit.of({
  OrganizationCreate: OrganizationCreateHandler,
  OrganizationCheckSlug: OrganizationCheckSlugHandler,
  OrganizationList: OrganizationListHandler,
  OrganizationSetActive: OrganizationSetActiveHandler,
  OrganizationGetFull: OrganizationGetFullHandler,
  OrganizationUpdate: OrganizationUpdateHandler,
  OrganizationDelete: OrganizationDeleteHandler,
  AcceptInvitation: AcceptInvitationHandler,
  OrganizationInviteMember: OrganizationInviteMemberHandler,
  OrganizationCancelInvitation: OrganizationCancelInvitationHandler,
  OrganizationRejectInvitation: OrganizationRejectInvitationHandler,
  OrganizationListInvitations: OrganizationListInvitationsHandler,
  OrganizationListUserInvitations: OrganizationListUserInvitationsHandler,
  OrganizationGetInvitation: OrganizationGetInvitationHandler,
  OrganizationListMembers: OrganizationListMembersHandler,
  OrganizationRemoveMember: OrganizationRemoveMemberHandler,
  OrganizationUpdateMemberRole: OrganizationUpdateMemberRoleHandler,
  OrganizationGetActiveMember: OrganizationGetActiveMemberHandler,
  OrganizationGetActiveMemberRole: OrganizationGetActiveMemberRoleHandler,
  OrganizationLeave: OrganizationLeaveHandler,
  OrganizationCreateRole: OrganizationCreateRoleHandler,
  OrganizationDeleteRole: OrganizationDeleteRoleHandler,
  OrganizationListRoles: OrganizationListRolesHandler,
});
