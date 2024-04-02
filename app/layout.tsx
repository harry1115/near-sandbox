import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/providers/Toast";
import AuthProvider from "@/providers/Account";

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
      <body className={inter.className}>
        <AuthProvider>
          <ToastProvider />
          {children}
        </AuthProvider>
       
      </body>
    </html>
  );
}
