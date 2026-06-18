import { describe, expect, it } from "tstyche";
import type {
  GraphContentTypeInfo,
  GraphDateTimeTimeZone,
  GraphDeleted,
  GraphDrive,
  GraphDriveItem,
  GraphDriveItemVersion,
  GraphEmailAddress,
  GraphEvent,
  GraphFile,
  GraphFileHashes,
  GraphFolder,
  GraphIdentitySet,
  GraphItemBody,
  GraphItemReference,
  GraphListItem,
  GraphLocation,
  GraphMessage,
  GraphQuota,
  GraphRecipient,
  GraphSite,
  GraphSiteCollection,
  GraphUserIdentity,
  M365DownloadedContent,
  M365DriveItemDownload,
  M365Error,
  M365Shape,
  M365SkippedEncryptedItem,
} from "@beep/m365";
import type * as MSGraph from "@microsoft/microsoft-graph-types";
import type { Effect } from "effect";

type DecodedGraphKeyDrift<Decoded, Upstream, Extra extends PropertyKey = never> = Exclude<
  keyof Decoded,
  keyof Upstream | Extra
>;

describe("@beep/m365 Graph type drift guards", () => {
  it("keeps decoded Graph field names aligned with upstream Microsoft Graph types", () => {
    expect<DecodedGraphKeyDrift<GraphUserIdentity, MSGraph.Identity, "email">>().type.toBe<never>();
    expect<DecodedGraphKeyDrift<GraphIdentitySet, MSGraph.IdentitySet>>().type.toBe<never>();
    expect<DecodedGraphKeyDrift<GraphItemReference, MSGraph.ItemReference>>().type.toBe<never>();
    expect<DecodedGraphKeyDrift<GraphFileHashes, MSGraph.Hashes>>().type.toBe<never>();
    expect<DecodedGraphKeyDrift<GraphFile, MSGraph.File>>().type.toBe<never>();
    expect<DecodedGraphKeyDrift<GraphFolder, MSGraph.Folder>>().type.toBe<never>();
    expect<DecodedGraphKeyDrift<GraphDeleted, MSGraph.Deleted>>().type.toBe<never>();
    expect<DecodedGraphKeyDrift<GraphQuota, MSGraph.Quota>>().type.toBe<never>();
    expect<DecodedGraphKeyDrift<GraphSiteCollection, MSGraph.SiteCollection>>().type.toBe<never>();
    expect<DecodedGraphKeyDrift<GraphEmailAddress, MSGraph.EmailAddress>>().type.toBe<never>();
    expect<DecodedGraphKeyDrift<GraphRecipient, MSGraph.Recipient>>().type.toBe<never>();
    expect<DecodedGraphKeyDrift<GraphItemBody, MSGraph.ItemBody>>().type.toBe<never>();
    expect<DecodedGraphKeyDrift<GraphDateTimeTimeZone, MSGraph.DateTimeTimeZone>>().type.toBe<never>();
    expect<DecodedGraphKeyDrift<GraphLocation, MSGraph.Location>>().type.toBe<never>();
    expect<DecodedGraphKeyDrift<GraphContentTypeInfo, MSGraph.ContentTypeInfo>>().type.toBe<never>();
    expect<DecodedGraphKeyDrift<GraphDrive, MSGraph.Drive>>().type.toBe<never>();
    expect<DecodedGraphKeyDrift<GraphSite, MSGraph.Site>>().type.toBe<never>();
    expect<
      DecodedGraphKeyDrift<GraphDriveItem, MSGraph.DriveItem, "@microsoft.graph.downloadUrl">
    >().type.toBe<never>();
    expect<
      DecodedGraphKeyDrift<GraphDriveItemVersion, MSGraph.DriveItemVersion, "@microsoft.graph.downloadUrl">
    >().type.toBe<never>();
    expect<DecodedGraphKeyDrift<GraphListItem, MSGraph.ListItem>>().type.toBe<never>();
    expect<DecodedGraphKeyDrift<GraphMessage, MSGraph.Message>>().type.toBe<never>();
    expect<DecodedGraphKeyDrift<GraphEvent, MSGraph.Event>>().type.toBe<never>();
  });

  it("keeps service returns typed through decoded driver models", () => {
    expect<M365Shape["downloadDriveItemContent"]>().type.toBeAssignableTo<
      (request: Parameters<M365Shape["downloadDriveItemContent"]>[0]) => Effect.Effect<M365DriveItemDownload, M365Error>
    >();
    expect<M365DriveItemDownload>().type.toBeAssignableTo<M365DownloadedContent | M365SkippedEncryptedItem>();
  });
});
