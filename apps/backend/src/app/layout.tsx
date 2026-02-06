import type { Metadata } from "next";
import { APP_CONFIG } from "@strava-musician-app/shared";

export const metadata: Metadata = {
  title: APP_CONFIG.appName,
  description: "A Strava-like app for musicians to track their practice",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
