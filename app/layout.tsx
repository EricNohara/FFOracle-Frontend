import type { Metadata } from "next";
import { baseFont } from "./localFont";
import { AuthProvider } from "./context/AuthProvider";
import { UserDataProvider } from "./context/UserDataProvider";
import "./globals.css";
import "shepherd.js/dist/css/shepherd.css";

export const metadata: Metadata = {
  title: "FFOracle",
  description: "AI insights into weekly start and sit decisions for fantasy football",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={baseFont.className} suppressHydrationWarning>
      <body>
        <AuthProvider>
          <UserDataProvider>
            {children}
          </UserDataProvider>
        </AuthProvider>
      </body>
    </html >
  );
}
