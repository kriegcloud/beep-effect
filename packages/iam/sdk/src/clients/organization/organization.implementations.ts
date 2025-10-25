import { client } from "@beep/iam-sdk/adapters";
import { addFetchOptions, compact, makeMetadata, withFetchOptions } from "@beep/iam-sdk/clients/_internal";
import {
  AcceptInvitationContract,
  AcceptInvitationPayload,
  OrganizationCancelInvitationContract,
  OrganizationCancelInvitationPayload,
  OrganizationCheckSlugContract,
  OrganizationCheckSlugPayload,
  OrganizationContractKit,
  OrganizationCreateContract,
  OrganizationCreatePayload,
  OrganizationCreateRoleContract,
  OrganizationDeleteContract,
  OrganizationDeletePayload,
  OrganizationDeleteRoleContract,
  OrganizationGetActiveMemberContract,
  OrganizationGetActiveMemberRoleContract,
  OrganizationGetActiveMemberRolePayload,
  OrganizationGetFullContract,
  OrganizationGetFullPayload,
  OrganizationGetInvitationContract,
  OrganizationGetInvitationPayload,
  OrganizationInviteMemberContract,
  OrganizationInviteMemberPayload,
  OrganizationLeaveContract,
  OrganizationLeavePayload,
  OrganizationListContract,
  OrganizationListInvitationsContract,
  OrganizationListInvitationsPayload,
  OrganizationListMembersContract,
  OrganizationListMembersPayload,
  OrganizationListRolesContract,
  OrganizationListUserInvitationsContract,
  OrganizationListUserInvitationsPayload,
  OrganizationRejectInvitationContract,
  OrganizationRejectInvitationPayload,
  OrganizationRemoveMemberContract,
  OrganizationRemoveMemberPayload,
  OrganizationRoleCreatePayload,
  OrganizationRoleDeletePayload,
  OrganizationRoleListPayload,
  OrganizationSetActiveContract,
  OrganizationSetActivePayload,
  OrganizationUpdateContract,
  OrganizationUpdateMemberRoleContract,
  OrganizationUpdateMemberRolePayload,
  OrganizationUpdatePayload,
} from "@beep/iam-sdk/clients/organization/organization.contracts";
import { makeFailureContinuation } from "@beep/iam-sdk/contract-kit";
import { IamError } from "@beep/iam-sdk/errors";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

const OrganizationCreateMetadata = makeMetadata("create");
const OrganizationCheckSlugMetadata = makeMetadata("checkSlug");
const OrganizationListMetadata = makeMetadata("list");
const OrganizationSetActiveMetadata = makeMetadata("setActive");
const OrganizationGetFullMetadata = makeMetadata("getFullOrganization");
const OrganizationUpdateMetadata = makeMetadata("update");
const OrganizationDeleteMetadata = makeMetadata("delete");
const AcceptInvitationMetadata = makeMetadata("acceptInvitation");
const OrganizationInviteMemberMetadata = makeMetadata("inviteMember");
const OrganizationCancelInvitationMetadata = makeMetadata("cancelInvitation");
const OrganizationRejectInvitationMetadata = makeMetadata("rejectInvitation");
const OrganizationListInvitationsMetadata = makeMetadata("listInvitations");
const OrganizationListUserInvitationsMetadata = makeMetadata("listUserInvitations");
const OrganizationGetInvitationMetadata = makeMetadata("getInvitation");
const OrganizationListMembersMetadata = makeMetadata("listMembers");
const OrganizationRemoveMemberMetadata = makeMetadata("removeMember");
const OrganizationUpdateMemberRoleMetadata = makeMetadata("updateMemberRole");
const OrganizationGetActiveMemberMetadata = makeMetadata("getActiveMember");
const OrganizationGetActiveMemberRoleMetadata = makeMetadata("getActiveMemberRole");
const OrganizationLeaveMetadata = makeMetadata("leave");
const OrganizationCreateRoleMetadata = makeMetadata("createRole");
const OrganizationDeleteRoleMetadata = makeMetadata("deleteRole");
const OrganizationListRolesMetadata = makeMetadata("listRoles");

const OrganizationCreateHandler = Effect.fn("OrganizationCreateHandler")(
  function* (payload: OrganizationCreatePayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "OrganizationCreate",
      metadata: OrganizationCreateMetadata,
    });

    const encoded = yield* S.encode(OrganizationCreatePayload)(payload);

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
      return yield* Effect.fail(
        new IamError({}, "OrganizationCreateHandler returned no payload from Better Auth", OrganizationCreateMetadata())
      );
    }

    const data = result.data;

    const decoded = yield* S.decodeUnknown(OrganizationCreateContract.successSchema)(data);

    client.$store.notify("$sessionSignal");

    return decoded;
  },
  Effect.catchTags({
    ParseError: (error) => Effect.fail(IamError.match(error, OrganizationCreateMetadata())),
  })
);

const OrganizationCheckSlugHandler = Effect.fn("OrganizationCheckSlugHandler")(
  function* (payload: OrganizationCheckSlugPayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "OrganizationCheckSlug",
      metadata: OrganizationCheckSlugMetadata,
    });

    const encoded = yield* S.encode(OrganizationCheckSlugPayload)(payload);

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

    return yield* S.decodeUnknown(OrganizationCheckSlugContract.successSchema)(data);
  },
  Effect.catchTags({
    ParseError: (error) => Effect.fail(IamError.match(error, OrganizationCheckSlugMetadata())),
  })
);

const OrganizationListHandler = Effect.fn("OrganizationListHandler")(
  function* () {
    const continuation = makeFailureContinuation({
      contract: "OrganizationList",
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

    return yield* S.decodeUnknown(OrganizationListContract.successSchema)(data);
  },
  Effect.catchTags({
    ParseError: (error) => Effect.fail(IamError.match(error, OrganizationListMetadata())),
  })
);

const OrganizationSetActiveHandler = Effect.fn("OrganizationSetActiveHandler")(
  function* (payload: OrganizationSetActivePayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "OrganizationSetActive",
      metadata: OrganizationSetActiveMetadata,
    });

    const encoded = yield* S.encode(OrganizationSetActivePayload)(payload);

    const result = yield* continuation.run((handlers) =>
      client.organization.setActive(addFetchOptions(handlers, encoded))
    );

    yield* continuation.raiseResult(result);

    const decoded = yield* S.decodeUnknown(OrganizationSetActiveContract.successSchema)(result.data ?? null);

    client.$store.notify("$sessionSignal");

    return decoded;
  },
  Effect.catchTags({
    ParseError: (error) => Effect.fail(IamError.match(error, OrganizationSetActiveMetadata())),
  })
);

const OrganizationGetFullHandler = Effect.fn("OrganizationGetFullHandler")(
  function* (payload: OrganizationGetFullPayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "OrganizationGetFull",
      metadata: OrganizationGetFullMetadata,
    });

    const encoded = yield* S.encode(OrganizationGetFullPayload)(payload);
    const query = compact(encoded);

    const result = yield* continuation.run((handlers) =>
      client.organization.getFullOrganization(
        Object.keys(query).length > 0 ? { query } : undefined,
        withFetchOptions(handlers)
      )
    );

    yield* continuation.raiseResult(result);

    return yield* S.decodeUnknown(OrganizationGetFullContract.successSchema)(result.data ?? null);
  },
  Effect.catchTags({
    ParseError: (error) => Effect.fail(IamError.match(error, OrganizationGetFullMetadata())),
  })
);

const OrganizationUpdateHandler = Effect.fn("OrganizationUpdateHandler")(
  function* (payload: OrganizationUpdatePayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "OrganizationUpdate",
      metadata: OrganizationUpdateMetadata,
    });

    const encoded = yield* S.encode(OrganizationUpdatePayload)(payload);

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

    return yield* S.decodeUnknown(OrganizationUpdateContract.successSchema)(result.data ?? null);
  },
  Effect.catchTags({
    ParseError: (error) => Effect.fail(IamError.match(error, OrganizationUpdateMetadata())),
  })
);

const OrganizationDeleteHandler = Effect.fn("OrganizationDeleteHandler")(
  function* (payload: OrganizationDeletePayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "OrganizationDelete",
      metadata: OrganizationDeleteMetadata,
    });

    const encoded = yield* S.encode(OrganizationDeletePayload)(payload);

    const result = yield* continuation.run((handlers) =>
      client.organization.delete(addFetchOptions(handlers, encoded))
    );

    yield* continuation.raiseResult(result);

    if (!result.data) {
      return yield* Effect.fail(
        new IamError({}, "OrganizationDeleteHandler returned no payload from Better Auth", OrganizationDeleteMetadata())
      );
    }

    const data = result.data;

    const decoded = yield* S.decodeUnknown(OrganizationDeleteContract.successSchema)(data);

    client.$store.notify("$sessionSignal");

    return decoded;
  },
  Effect.catchTags({
    ParseError: (error) => Effect.fail(IamError.match(error, OrganizationDeleteMetadata())),
  })
);

const AcceptInvitationHandler = Effect.fn("AcceptInvitationHandler")(
  function* (payload: AcceptInvitationPayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "AcceptInvitation",
      metadata: AcceptInvitationMetadata,
    });

    const encoded = yield* S.encode(AcceptInvitationPayload)(payload);

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

    const decoded = yield* S.decodeUnknown(AcceptInvitationContract.successSchema)(data);

    client.$store.notify("$sessionSignal");

    return decoded;
  },
  Effect.catchTags({
    ParseError: (error) => Effect.fail(IamError.match(error, AcceptInvitationMetadata())),
  })
);

const OrganizationInviteMemberHandler = Effect.fn("OrganizationInviteMemberHandler")(
  function* (payload: OrganizationInviteMemberPayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "OrganizationInviteMember",
      metadata: OrganizationInviteMemberMetadata,
    });

    const encoded = yield* S.encode(OrganizationInviteMemberPayload)(payload);

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

    return yield* S.decodeUnknown(OrganizationInviteMemberContract.successSchema)(data);
  },
  Effect.catchTags({
    ParseError: (error) => Effect.fail(IamError.match(error, OrganizationInviteMemberMetadata())),
  })
);

const OrganizationCancelInvitationHandler = Effect.fn("OrganizationCancelInvitationHandler")(
  function* (payload: OrganizationCancelInvitationPayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "OrganizationCancelInvitation",
      metadata: OrganizationCancelInvitationMetadata,
    });

    const encoded = yield* S.encode(OrganizationCancelInvitationPayload)(payload);

    const result = yield* continuation.run((handlers) =>
      client.organization.cancelInvitation(addFetchOptions(handlers, encoded))
    );

    yield* continuation.raiseResult(result);

    return yield* S.decodeUnknown(OrganizationCancelInvitationContract.successSchema)(result.data ?? null);
  },
  Effect.catchTags({
    ParseError: (error) => Effect.fail(IamError.match(error, OrganizationCancelInvitationMetadata())),
  })
);

const OrganizationRejectInvitationHandler = Effect.fn("OrganizationRejectInvitationHandler")(
  function* (payload: OrganizationRejectInvitationPayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "OrganizationRejectInvitation",
      metadata: OrganizationRejectInvitationMetadata,
    });

    const encoded = yield* S.encode(OrganizationRejectInvitationPayload)(payload);

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

    return yield* S.decodeUnknown(OrganizationRejectInvitationContract.successSchema)(data);
  },
  Effect.catchTags({
    ParseError: (error) => Effect.fail(IamError.match(error, OrganizationRejectInvitationMetadata())),
  })
);

const OrganizationListInvitationsHandler = Effect.fn("OrganizationListInvitationsHandler")(
  function* (payload: OrganizationListInvitationsPayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "OrganizationListInvitations",
      metadata: OrganizationListInvitationsMetadata,
    });

    const encoded = yield* S.encode(OrganizationListInvitationsPayload)(payload);
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

    return yield* S.decodeUnknown(OrganizationListInvitationsContract.successSchema)(data);
  },
  Effect.catchTags({
    ParseError: (error) => Effect.fail(IamError.match(error, OrganizationListInvitationsMetadata())),
  })
);

const OrganizationListUserInvitationsHandler = Effect.fn("OrganizationListUserInvitationsHandler")(
  function* (payload: OrganizationListUserInvitationsPayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "OrganizationListUserInvitations",
      metadata: OrganizationListUserInvitationsMetadata,
    });

    const encoded = yield* S.encode(OrganizationListUserInvitationsPayload)(payload);
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

    return yield* S.decodeUnknown(OrganizationListUserInvitationsContract.successSchema)(data);
  },
  Effect.catchTags({
    ParseError: (error) => Effect.fail(IamError.match(error, OrganizationListUserInvitationsMetadata())),
  })
);

const OrganizationGetInvitationHandler = Effect.fn("OrganizationGetInvitationHandler")(
  function* (payload: OrganizationGetInvitationPayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "OrganizationGetInvitation",
      metadata: OrganizationGetInvitationMetadata,
    });

    const encoded = yield* S.encode(OrganizationGetInvitationPayload)(payload);

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

    return yield* S.decodeUnknown(OrganizationGetInvitationContract.successSchema)(data);
  },
  Effect.catchTags({
    ParseError: (error) => Effect.fail(IamError.match(error, OrganizationGetInvitationMetadata())),
  })
);

const OrganizationListMembersHandler = Effect.fn("OrganizationListMembersHandler")(
  function* (payload: OrganizationListMembersPayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "OrganizationListMembers",
      metadata: OrganizationListMembersMetadata,
    });

    const encoded = yield* S.encode(OrganizationListMembersPayload)(payload);
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

    return yield* S.decodeUnknown(OrganizationListMembersContract.successSchema)(data);
  },
  Effect.catchTags({
    ParseError: (error) => Effect.fail(IamError.match(error, OrganizationListMembersMetadata())),
  })
);

const OrganizationRemoveMemberHandler = Effect.fn("OrganizationRemoveMemberHandler")(
  function* (payload: OrganizationRemoveMemberPayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "OrganizationRemoveMember",
      metadata: OrganizationRemoveMemberMetadata,
    });

    const encoded = yield* S.encode(OrganizationRemoveMemberPayload)(payload);

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

    return yield* S.decodeUnknown(OrganizationRemoveMemberContract.successSchema)(data);
  },
  Effect.catchTags({
    ParseError: (error) => Effect.fail(IamError.match(error, OrganizationRemoveMemberMetadata())),
  })
);

const OrganizationUpdateMemberRoleHandler = Effect.fn("OrganizationUpdateMemberRoleHandler")(
  function* (payload: OrganizationUpdateMemberRolePayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "OrganizationUpdateMemberRole",
      metadata: OrganizationUpdateMemberRoleMetadata,
    });

    const encoded = yield* S.encode(OrganizationUpdateMemberRolePayload)(payload);

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

    return yield* S.decodeUnknown(OrganizationUpdateMemberRoleContract.successSchema)(data);
  },
  Effect.catchTags({
    ParseError: (error) => Effect.fail(IamError.match(error, OrganizationUpdateMemberRoleMetadata())),
  })
);

const OrganizationGetActiveMemberHandler = Effect.fn("OrganizationGetActiveMemberHandler")(
  function* () {
    const continuation = makeFailureContinuation({
      contract: "OrganizationGetActiveMember",
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

    return yield* S.decodeUnknown(OrganizationGetActiveMemberContract.successSchema)(data);
  },
  Effect.catchTags({
    ParseError: (error) => Effect.fail(IamError.match(error, OrganizationGetActiveMemberMetadata())),
  })
);

const OrganizationGetActiveMemberRoleHandler = Effect.fn("OrganizationGetActiveMemberRoleHandler")(
  function* (payload: OrganizationGetActiveMemberRolePayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "OrganizationGetActiveMemberRole",
      metadata: OrganizationGetActiveMemberRoleMetadata,
    });

    const encoded = yield* S.encode(OrganizationGetActiveMemberRolePayload)(payload);
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

    return yield* S.decodeUnknown(OrganizationGetActiveMemberRoleContract.successSchema)(data);
  },
  Effect.catchTags({
    ParseError: (error) => Effect.fail(IamError.match(error, OrganizationGetActiveMemberRoleMetadata())),
  })
);

const OrganizationLeaveHandler = Effect.fn("OrganizationLeaveHandler")(
  function* (payload: OrganizationLeavePayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "OrganizationLeave",
      metadata: OrganizationLeaveMetadata,
    });

    const encoded = yield* S.encode(OrganizationLeavePayload)(payload);

    const result = yield* continuation.run((handlers) => client.organization.leave(addFetchOptions(handlers, encoded)));

    yield* continuation.raiseResult(result);

    if (!result.data) {
      return yield* Effect.fail(
        new IamError({}, "OrganizationLeaveHandler returned no payload from Better Auth", OrganizationLeaveMetadata())
      );
    }
    const data = result.data;

    const decoded = yield* S.decodeUnknown(OrganizationLeaveContract.successSchema)(data);

    client.$store.notify("$sessionSignal");

    return decoded;
  },
  Effect.catchTags({
    ParseError: (error) => Effect.fail(IamError.match(error, OrganizationLeaveMetadata())),
  })
);

const OrganizationCreateRoleHandler = Effect.fn("OrganizationCreateRoleHandler")(
  function* (payload: OrganizationRoleCreatePayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "OrganizationCreateRole",
      metadata: OrganizationCreateRoleMetadata,
    });

    const encoded = yield* S.encode(OrganizationRoleCreatePayload)(payload);

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

    return yield* S.decodeUnknown(OrganizationCreateRoleContract.successSchema)(data);
  },
  Effect.catchTags({
    ParseError: (error) => Effect.fail(IamError.match(error, OrganizationCreateRoleMetadata())),
  })
);

const OrganizationDeleteRoleHandler = Effect.fn("OrganizationDeleteRoleHandler")(
  function* (payload: OrganizationRoleDeletePayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "OrganizationDeleteRole",
      metadata: OrganizationDeleteRoleMetadata,
    });

    const encoded = yield* S.encode(OrganizationRoleDeletePayload)(payload);

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

    return yield* S.decodeUnknown(OrganizationDeleteRoleContract.successSchema)(data);
  },
  Effect.catchTags({
    ParseError: (error) => Effect.fail(IamError.match(error, OrganizationDeleteRoleMetadata())),
  })
);

const OrganizationListRolesHandler = Effect.fn("OrganizationListRolesHandler")(
  function* (payload: OrganizationRoleListPayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "OrganizationListRoles",
      metadata: OrganizationListRolesMetadata,
    });

    const encoded = yield* S.encode(OrganizationRoleListPayload)(payload);
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

    return yield* S.decodeUnknown(OrganizationListRolesContract.successSchema)(data);
  },
  Effect.catchTags({
    ParseError: (error) => Effect.fail(IamError.match(error, OrganizationListRolesMetadata())),
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
