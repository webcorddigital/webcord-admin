import "./globals.css";
import ConvexClientProvider from "./ConvexClientProvider";
import { AuthProvider } from "@/lib/AuthContext";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Webcord Admin",
  description: "Admin panel for Webcord.in",
  robots: "noindex, nofollow",
};

import { Bebas_Neue, DM_Sans, Space_Mono } from "next/font/google";

const fontHero = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-hero",
});

const fontBody = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

const fontMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
});

import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fontHero.variable} ${fontMono.variable} ${fontBody.variable}`}>
        <ConvexClientProvider>
          <AuthProvider>
            <Toaster 
              position="top-center"
              toastOptions={{
                style: {
                  background: 'var(--bg-card)',
                  color: 'var(--black)',
                  border: '1px solid rgba(17, 17, 17, 0.08)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.85rem',
                  borderRadius: 'var(--r-md)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                },
                success: {
                  iconTheme: {
                    primary: '#111',
                    secondary: '#fff',
                  },
                },
              }}
            />
            {children}
          </AuthProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
