# Readiness friction ledger

| Date | Friction and evidence | Prevention or proposed goal addition |
| --- | --- | --- |
| 2026-10-14 | Historical sudo recipe said pam_ssh_agent_auth; the live dankserver PAM file uses pam_rssh. Old module rejected ED25519-SK before a touch. | Treat live managed-host configuration as the source; pin/build the FIDO-aware module reproducibly and verify fresh sudo. |
| 2026-10-14 | Fresh FIDO SSH requests can expire while unrelated browser approvals are being completed; two agent-refused attempts preceded a successful third attempt. | Persistent touch notifications, serialized hardware operations and bounded retries. |
| 2026-10-14 | Compose HTTP probe raced nginx startup: curl returned an empty reply immediately after up. | Poll a bounded real HTTP readiness check and always tear down the disposable service. |
| 2026-10-14 | 1Password service-account item reads require --vault even for an item UUID. Doctor confirmed service-account identity; vault-scoped retry follows. | Inventory full UUID references and verify the actual required operation, not a desktop sign-in assumption. |
| 2026-10-14 | Local op-doctor found shim ordering failure in the systemd fallback surface when the user bus is unavailable. | Include user-systemd PATH and op-lane tests in portability acceptance; do not infer desktop state from an agent failure. |
| 2026-10-14 | Mise checksum filenames contain a ./ prefix; first exact filename lookup missed it. The correct published checksum subsequently matched. | Fail closed before executing installers and normalize manifest filename prefixes. |
