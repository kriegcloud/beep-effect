import { Mail } from "@beep/todox/types/mail";
import { thunkNull, thunkZero } from "@beep/utils";
import * as Arbitrary from "effect/Arbitrary";
import * as A from "effect/Array";
import * as DateTime from "effect/DateTime";
import * as FC from "effect/FastCheck";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const subjects = [
  "Meeting Tomorrow at 10 AM",
  "Project Update Required",
  "Weekly Status Report",
  "Action Required: Review Document",
  "Team Lunch Friday",
];
// Generate a single mock mail with realistic data
const generateMockMail = (mailId: string, seed: number) =>
  F.pipe(
    FC.sample(Arbitrary.make(Mail), { seed, numRuns: 1 }),
    A.head,
    O.match({
      onNone: thunkNull,
      onSome: (baseMail) => ({
        ...baseMail,
        id: mailId,
        folder: "inbox",
        subject: subjects[seed % subjects.length] ?? "Email Subject",
        message: Str.trim(`
Dear User,

This is a detailed email message for mail ID: ${mailId}.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.

Best regards,
Sender
    `),
        isUnread: false,
        from: {
          name: "John Doe",
          email: "john.doe@example.com",
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`,
        },
        to: [
          {
            name: "Current User",
            email: "user@example.com",
            avatarUrl: null,
          },
        ],
        labelIds: A.make("inbox"),
        isStarred: seed % 2 === 0,
        isImportant: seed % 3 === 0,
        createdAt: DateTime.unsafeNow().pipe(
          DateTime.subtract({
            millis: seed * 3600000,
          }),
          DateTime.formatIso
        ),
        attachments:
          seed % 2 === 0
            ? [
                {
                  id: `attachment-${seed}`,
                  name: `document-${seed}.pdf`,
                  size: 1024 * (seed + 1),
                  type: "application/pdf",
                  path: `/attachments/document-${seed}.pdf`,
                  preview: `/attachments/preview-${seed}.png`,
                  createdAt: DateTime.unsafeNow().pipe(DateTime.formatIso),
                  modifiedAt: DateTime.unsafeNow().pipe(DateTime.formatIso),
                },
              ]
            : [],
      }),
    })
  );

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mailId = searchParams.get("mailId");

  if (!mailId) {
    return NextResponse.json({ error: "mailId is required" }, { status: 400 });
  }

  // Use mailId as part of seed for deterministic results
  const seed = A.reduce(
    Str.split(Str.empty)(mailId),
    0,
    (acc, char) => acc + O.getOrElse(Str.charCodeAt(0)(char), thunkZero)
  );
  const mail = generateMockMail(mailId, seed);

  if (!mail) {
    return NextResponse.json({ error: "Mail not found" }, { status: 404 });
  }

  return NextResponse.json({ mail });
}
