import "./globals.css";
import ConvexClientProvider from "./ConvexClientProvider";
import { AuthProvider } from "@/lib/AuthContext";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Webcord Admin",
  description: "Admin panel for Webcord.in",
  robots: "noindex, nofollow",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ConvexClientProvider>
          <AuthProvider>{children}</AuthProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
