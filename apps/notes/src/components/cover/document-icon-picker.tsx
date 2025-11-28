"use client";

import { useDocumentId } from "@beep/notes/lib/navigation/routes";
import { Button } from "@beep/notes/registry/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@beep/notes/registry/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@beep/notes/registry/ui/tabs";
import { useUpdateDocumentMutation } from "@beep/notes/trpc/hooks/document-hooks";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { useTheme } from "next-themes";
import { useState } from "react";

import { useAuthGuard } from "../auth/useAuthGuard";

interface IconPickerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

export const DocumentIconPicker = ({ children }: IconPickerProps) => {
  const { resolvedTheme } = useTheme();
  const currentTheme = (resolvedTheme || "light") as keyof typeof themeMap;
  const themeMap = {
    dark: Theme.DARK,
    light: Theme.LIGHT,
  };
  const theme = themeMap[currentTheme];
  const id = useDocumentId();
  const authGuard = useAuthGuard();
  const [open, setOpen] = useState(false);

  const updateDocument = useUpdateDocumentMutation();

  const onChange = (icon: string) => {
    authGuard(() => {
      updateDocument.mutate({
        id,
        icon,
      });
      setOpen(false);
    });
  };

  const onRemove = () => {
    updateDocument.mutate({
      id,
      icon: null,
    });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Tabs defaultValue="emojis">
          <TabsList className="min-w-[350px]">
            <TabsTrigger value="emojis">Emojis</TabsTrigger>

            <Button variant="ghost2" className="ml-auto" onClick={onRemove}>
              Remove
            </Button>
          </TabsList>

          <TabsContent value="emojis">
            <EmojiPicker
              className="border-transparent! [&_.epr-category-nav]:hidden"
              onEmojiClick={(data) => onChange(data.emoji)}
              height={350}
              previewConfig={{ showPreview: false }}
              searchPlaceHolder="Filter..."
              theme={theme}
            />
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};
