# Discord OAuth And Bot Setup

Status: P1 implementation note.

Discord remains the only v1 channel. P1 does not provision Discord apps or run
OAuth. The operator supplies an existing guild/channel and a bot token stored
behind a 1Password reference.

Implemented P1 behavior:

- `@beep/discord` owns the Discord HTTP boundary.
- `Discord.getChannel` validates that the configured channel is reachable.
- `Discord.createMessage` sends the deterministic P1 proof message.
- Message creation disables broad mentions with `allowed_mentions: { parse:
  [] }`.
- `@beep/installer-use-cases` exposes
  `validateDiscordChannel`.
- `@beep/installer-server` composes the Discord driver into the installer
  slice.
- The sanitized proof includes the Discord channel identity and returned
  message ID when Discord accepts the test message.

Fresh-machine operator requirements:

- Discord bot exists before the P1 run.
- Bot token is stored in 1Password and entered only as `op://vault/item/field`.
- Bot is in the target guild.
- Bot has channel visibility and permission to send messages.
- Test channel is the intended P1 evidence channel.

Out of scope for P1:

- Discord Developer Portal automation
- OAuth invite generation
- channel creation
- permission repair
- future Slack, Teams, Signal, Telegram, WhatsApp, Google Chat, or iMessage
  channels
