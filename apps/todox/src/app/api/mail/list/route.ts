import { Mail } from "@beep/mock/_mail";
import * as Arbitrary from "effect/Arbitrary";
import * as A from "effect/Array";
import * as FC from "effect/FastCheck";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Generate deterministic mock mails with realistic data
const generateMockMails = (labelId: string, seed: number) => {
  const baseMails = FC.sample(Arbitrary.make(Mail), { seed, numRuns: 10 });

  // Enhance with realistic data
  const subjects = [
    "Meeting Tomorrow at 10 AM",
    "Project Update Required",
    "Weekly Status Report",
    "Action Required: Review Document",
    "Team Lunch Friday",
    "New Feature Request",
    "Bug Report: Dashboard Issue",
    "Invoice #12345",
    "Welcome to the Team!",
    "Reminder: Submit Timesheet",
  ];

  const folders = ["inbox", "sent", "drafts", "spam", "trash"];
  const folderIndex = folders.indexOf(labelId);
  const folder = folderIndex >= 0 ? folders[folderIndex] : "inbox";

  return A.map(baseMails, (mail, index) => ({
    ...mail,
    id: `mail-${labelId}-${index + 1}`,
    folder,
    subject: subjects[index % subjects.length] ?? `Email ${index + 1}`,
    message: `This is the message content for email ${index + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
    isUnread: index < 3,
    from: {
      name: `Sender ${index + 1}`,
      email: `sender${index + 1}@example.com`,
      avatarUrl: index % 2 === 0 ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${index}` : null,
    },
    to: [
      {
        name: "Current User",
        email: "user@example.com",
        avatarUrl: null,
      },
    ],
    labelIds: [labelId],
    isStarred: index % 3 === 0,
    isImportant: index % 4 === 0,
    createdAt: new Date(Date.now() - index * 3600000).toISOString(),
    attachments:
      index % 5 === 0
        ? [
            {
              id: `attachment-${index}`,
              name: `document-${index}.pdf`,
              size: 1024 * (index + 1),
              type: "application/pdf",
              path: `/attachments/document-${index}.pdf`,
              preview: `/attachments/preview-${index}.png`,
              createdAt: new Date().toISOString(),
              modifiedAt: new Date().toISOString(),
            },
          ]
        : [],
  }));
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const labelId = searchParams.get("labelId") ?? "inbox";

  // Use labelId as part of seed for different results per label
  const seed = A.reduce(labelId.split(""), 0, (acc, char) => acc + char.charCodeAt(0));
  const mails = generateMockMails(labelId, seed);

  return NextResponse.json({ mails });
}
