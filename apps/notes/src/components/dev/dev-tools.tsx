"use client";

import { useDevState } from "@beep/notes/components/dev/dev-provider";
import { Label } from "@beep/notes/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@beep/notes/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@beep/notes/components/ui/sheet";
import { cn } from "@beep/notes/lib/utils";
import { Button, type ButtonProps } from "@beep/notes/registry/ui/button";
import { Input } from "@beep/notes/registry/ui/input";
import { useState } from "react";

export function DevTools({ children, className, ...props }: ButtonProps) {
  const [waitAppLayout, setWaitAppLayout] = useDevState("waitAppLayout");
  const [wait, setWait] = useDevState("wait");
  const [user, setUser] = useDevState("user");
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="none"
          className={cn("size-7 rounded-full p-0 font-mono text-sm", className)}
          truncate={false}
          {...props}
        >
          {children}
        </Button>
      </SheetTrigger>

      <SheetContent className="pl-12" animate={false} side="bottom">
        <div className="space-y-4">
          <div className="flex w-[100px] flex-col gap-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={user.role}
              onValueChange={(value) => {
                setUser({
                  ...user,
                  role: value,
                });
                setOpen(false);
                window.location.reload();
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DEFAULT">Default</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="SUPERADMIN">SuperAdmin</SelectItem>
                <SelectItem value="USER">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[100px] flex-col gap-2">
            <Label htmlFor="role">Plan</Label>
            <Select
              value={user.plan}
              onValueChange={(value) => {
                setUser({
                  ...user,
                  plan: value,
                });
                setOpen(false);
                window.location.reload();
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                {/* <SelectItem value={SubscriptionPlan.Premium}> */}
                {/*  Premium */}
                {/* </SelectItem> */}
                {/* <SelectItem value={SubscriptionPlan.PremiumPlus}> */}
                {/*  Premium+ */}
                {/* </SelectItem> */}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[100px] flex-col gap-2">
            <Label>Wait Query</Label>
            <Input
              defaultValue={wait}
              onChange={(e) => {
                setWait(Number.parseInt(e.target.value, 10));
              }}
              step={1000}
              type="number"
            />
          </div>
          <div className="flex w-[100px] flex-col gap-2">
            <Label>Wait App Layout</Label>
            <Input
              defaultValue={waitAppLayout}
              onChange={(e) => {
                setWaitAppLayout(Number.parseInt(e.target.value, 10));
              }}
              step={1000}
              type="number"
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
