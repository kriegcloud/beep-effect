import { Mail } from "@beep/mock/_mail";
import * as Arbitrary from "effect/Arbitrary";
import * as A from "effect/Array";
import * as FC from "effect/FastCheck";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Generate a single mock mail with realistic data
const generateMockMail = (mailId: string, seed: number) => {
  const baseMails = FC.sample(Arbitrary.make(Mail), { seed, numRuns: 1 });
  const baseMail = baseMails[0];

  if (!baseMail) {
    return null;
  }

  const subjects = [
    "Meeting Tomorrow at 10 AM",
    "Project Update Required",
    "Weekly Status Report",
    "Action Required: Review Document",
    "Team Lunch Friday",
  ];

  return {
    ...baseMail,
    id: mailId,
    folder: "inbox",
    subject: subjects[seed % subjects.length] ?? "Email Subject",
    message: `
Dear User,

This is a detailed email message for mail ID: ${mailId}.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.

Best regards,
Sender
    `.trim(),
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
    labelIds: ["inbox"],
    isStarred: seed % 2 === 0,
    isImportant: seed % 3 === 0,
    createdAt: new Date(Date.now() - seed * 3600000).toISOString(),
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
              createdAt: new Date().toISOString(),
              modifiedAt: new Date().toISOString(),
            },
          ]
        : [],
  };
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mailId = searchParams.get("mailId");

  if (!mailId) {
    return NextResponse.json({ error: "mailId is required" }, { status: 400 });
  }

  // Use mailId as part of seed for deterministic results
  const seed = A.reduce(mailId.split(""), 0, (acc, char) => acc + char.charCodeAt(0));
  const mail = generateMockMail(mailId, seed);

  if (!mail) {
    return NextResponse.json({ error: "Mail not found" }, { status: 404 });
  }

  return NextResponse.json({ mail });
}
