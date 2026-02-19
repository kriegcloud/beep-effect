# effect/FileSystem Surface

Total exports: 19

| Export | Kind | Overview |
|---|---|---|
| `File` | `interface` | Interface representing an open file handle. |
| `FileDescriptor` | `const` | Creates a branded file descriptor. |
| `FileSystem` | `interface` | Core interface for file system operations in Effect. |
| `FileTypeId` | `const` | No summary found in JSDoc. |
| `GiB` | `const` | Creates a `Size` representing gibibytes (1024³ bytes). |
| `isFile` | `const` | Type guard to check if a value is a File instance. |
| `KiB` | `const` | Creates a `Size` representing kilobytes (1024 bytes). |
| `layerNoop` | `const` | Creates a Layer that provides a no-op FileSystem implementation for testing. |
| `make` | `const` | Creates a FileSystem implementation from a partial implementation. |
| `makeNoop` | `const` | Creates a no-op FileSystem implementation for testing purposes. |
| `MiB` | `const` | Creates a `Size` representing mebibytes (1024² bytes). |
| `OpenFlag` | `type` | File open flags that determine how a file is opened and what operations are allowed. |
| `PiB` | `const` | Creates a `Size` representing pebibytes (1024⁵ bytes). |
| `SeekMode` | `type` | Specifies the reference point for seeking within a file. |
| `Size` | `type` | Represents a file size in bytes using a branded bigint. |
| `SizeInput` | `type` | Input type for size parameters that accepts multiple numeric types. |
| `TiB` | `const` | Creates a `Size` representing tebibytes (1024⁴ bytes). |
| `WatchBackend` | `class` | Service key for file system watch backend implementations. |
| `WatchEvent` | `type` | Represents file system events that can be observed when watching files or directories. |
