"use client";

import { Button } from "@beep/todox/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@beep/todox/components/ui/card";
import { Label } from "@beep/todox/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@beep/todox/components/ui/select";
import { Textarea } from "@beep/todox/components/ui/textarea";
import * as React from "react";
import { SAMPLE_EMAILS, type SampleEmail } from "../data/sample-emails";

interface EmailInputPanelProps {
  onExtract: (text: string) => void;
  isLoading: boolean;
}

function formatEmailForDisplay(email: SampleEmail): string {
  return `Subject: ${email.subject}
From: ${email.from}
To: ${email.to}
Date: ${email.date}

${email.body}`;
}

export function EmailInputPanel({ onExtract, isLoading }: EmailInputPanelProps) {
  const [selectedEmailId, setSelectedEmailId] = React.useState<string>("");
  const [textContent, setTextContent] = React.useState<string>("");

  const handleEmailSelect = (emailId: string | null) => {
    if (!emailId) {
      setSelectedEmailId("");
      setTextContent("");
      return;
    }
    setSelectedEmailId(emailId);
    const email = SAMPLE_EMAILS.find((e) => e.id === emailId);
    if (email) {
      setTextContent(formatEmailForDisplay(email));
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Email Input</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Select Sample Email</Label>
          <Select onValueChange={handleEmailSelect} value={selectedEmailId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose an email..." />
            </SelectTrigger>
            <SelectContent>
              {SAMPLE_EMAILS.map((email) => (
                <SelectItem key={email.id} value={email.id}>
                  {email.subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Email Content</Label>
          <Textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="Paste email text here or select from samples..."
            className="min-h-[300px] font-mono text-sm"
          />
        </div>

        <Button onClick={() => onExtract(textContent)} disabled={isLoading || !textContent.trim()} className="w-full">
          {isLoading ? "Extracting..." : "Extract Entities"}
        </Button>
      </CardContent>
    </Card>
  );
}
