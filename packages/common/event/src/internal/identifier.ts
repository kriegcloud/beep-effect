import { $EventId as _$EventId } from "@beep/identity/packages";

export const {
  $EventId,
  $EventGroupId,
  $EventJournalId,
  $EventLogId,
  $EventLogEncryptionId,
  $EventLogServerId,
  $EventLogRemoteId,
} = _$EventId.compose(
  "event",
  "event-group",
  "event-journal",
  "event-log",
  "event-log-remote",
  "event-log-encryption",
  "event-log-server"
);
