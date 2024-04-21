import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/providers/Toast";
import ThemeProvider from "@/providers/ThemeProvider";
import AuthProvider from "@/providers/Account";
import Account from "@/components/Account";
import Tabbar from "@/components/Tabbar";

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
          <AuthProvider>
            <div className="flex flex-col h-[100vh]">
              <div className="flex-1 overflow-y-auto">
                <Account />
                {children}
              </div>
              <Tabbar />
            </div>
            <ToastProvider />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
