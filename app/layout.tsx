import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/providers/Toast";
import ThemeProvider from "@/providers/ThemeProvider";
import AuthProvider from "@/providers/Account";
import { MessageBoxProvider } from "@/providers/MessageBoxProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "tg wallet",
  description: "tg wallet",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} dark`}>
        <ThemeProvider>
          <MessageBoxProvider>
            <AuthProvider>
              {children}

              <ToastProvider />
            </AuthProvider>
          </MessageBoxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
