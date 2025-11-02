import type { IconifyProps } from "@beep/ui/atoms/iconify/iconify";
import type { StaticImageData } from "next/image";
export interface ConnectedInDevice {
  readonly id: number;
  readonly securityKey: string;
  readonly deviceName: string;
  readonly connected: boolean;
  readonly used: boolean;
  readonly currentlyUsed: boolean;
  readonly lastUsedDate: Date;
  readonly deviceIcon: IconifyProps["icon"];
}

export interface LoggedInDevice {
  readonly id: number;
  readonly name: string;
  readonly icon: string | StaticImageData;
  readonly location: string;
  readonly currentlyLoggedIn: boolean;
  readonly firstLoggedTime: Date;
  readonly lastLoggedTime: Date;
  readonly browsersAppsServices?:
    | ReadonlyArray<{
        icon: string | StaticImageData;
        readonly name: string;
      }>
    | undefined;
}
