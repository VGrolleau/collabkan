import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";
import 'react-datepicker/dist/react-datepicker.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Collab'Kan",
  description: "Tableau collaboratif Kanban",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="fr">
      <body className={`dark ${geistSans.variable} ${geistMono.variable}`}>
        <div id="layout-container">
          <AppShell>
            {children}
          </AppShell>
        </div>
      </body>
    </html>
  );
}
