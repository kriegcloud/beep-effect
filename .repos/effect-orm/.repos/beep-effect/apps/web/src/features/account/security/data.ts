import { assetPaths } from "@beep/constants";
import type { ConnectedInDevice, LoggedInDevice } from "./types";

export const loggedInDevices: LoggedInDevice[] = [
  {
    id: 1,
    name: "MacBook Air M1",
    icon: assetPaths.logos.apple,
    location: "Dhaka, Bangladesh",
    currentlyLoggedIn: false,
    firstLoggedTime: new Date(2024, 0, 11, 12, 0),
    lastLoggedTime: new Date(2024, 2, 15, 14, 40),
    browsersAppsServices: [
      {
        icon: assetPaths.logos.googleChrome,
        name: "Google chrome",
      },
      {
        icon: assetPaths.logos.apple,
        name: "Mac OS X",
      },
    ],
  },
  {
    id: 2,
    name: "Windows Laptop",
    icon: assetPaths.logos.windows,
    location: "Dhaka, Bangladesh",
    currentlyLoggedIn: true,
    firstLoggedTime: new Date(2024, 2, 15, 14, 40),
    lastLoggedTime: new Date(),
    browsersAppsServices: [
      {
        icon: assetPaths.logos.googleChrome,
        name: "Google chrome",
      },
    ],
  },
];

export const connectedDevices: ConnectedInDevice[] = [
  {
    id: 1,
    securityKey: "1234",
    deviceName: "Security Key 2(FIDO U2F)",
    connected: true,
    used: true,
    currentlyUsed: true,
    lastUsedDate: new Date(),
    deviceIcon: "material-symbols-light:chromecast-device-outline",
  },
  {
    id: 2,
    securityKey: "5678",
    deviceName: "Security Key (FIDO 2)",
    connected: true,
    used: false,
    currentlyUsed: false,
    lastUsedDate: new Date(),
    deviceIcon: "material-symbols-light:chromecast-device-outline",
  },
  {
    id: 3,
    securityKey: "1234",
    deviceName: "Galaxy Z Fold 3",
    connected: true,
    used: true,
    currentlyUsed: false,
    lastUsedDate: new Date(2024, 2, 15, 14, 40),
    deviceIcon: "material-symbols-light:phone-android-outline",
  },
];
