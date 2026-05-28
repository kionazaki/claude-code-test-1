import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Notes",
  description: "Create and share rich text notes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* suppressHydrationWarning prevents false errors from browser extensions
          (password managers etc.) that inject attributes into the DOM */}
      <body className={`${geist.className} antialiased bg-green-50`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
