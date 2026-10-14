---
"@beep/observability": patch
"@beep/professional-desktop": patch
---

Fix five `@beep/observability` wiring defects: DevTools no longer hides OTLP
traces in `layerLocalLgtmServer`, DevTools spans now send events and end
snapshots, `layerConsoleLogger` keeps the log-to-span bridge and returns a
Layer for its one-argument form, and the local OTLP server takes a pluggable
`OtlpSerialization`. The desktop IPC sidecar keeps `Logger.tracerLogger`.
