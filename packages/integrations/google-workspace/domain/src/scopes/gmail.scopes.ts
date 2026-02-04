export const GmailScopes = {
  send: "https://www.googleapis.com/auth/gmail.send",
  read: "https://www.googleapis.com/auth/gmail.readonly",
  modify: "https://www.googleapis.com/auth/gmail.modify",
  labels: "https://www.googleapis.com/auth/gmail.labels",
  compose: "https://www.googleapis.com/auth/gmail.compose",
} as const;

export const GMAIL_REQUIRED_SCOPES = [GmailScopes.read, GmailScopes.send, GmailScopes.modify] as const;
