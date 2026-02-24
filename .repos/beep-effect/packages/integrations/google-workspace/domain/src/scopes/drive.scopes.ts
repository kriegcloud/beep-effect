export const DriveScopes = {
  file: "https://www.googleapis.com/auth/drive.file",
  readonly: "https://www.googleapis.com/auth/drive.readonly",
  full: "https://www.googleapis.com/auth/drive",
} as const;

export const DRIVE_REQUIRED_SCOPES = [DriveScopes.file] as const;
